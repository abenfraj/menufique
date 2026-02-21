import type { Page } from "puppeteer-core";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { TemplateData } from "@/templates/types";

async function launchBrowser() {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    const chromium = await import("@sparticuz/chromium");
    const puppeteerCore = await import("puppeteer-core");
    return puppeteerCore.default.launch({
      args: chromium.default.args,
      executablePath: await chromium.default.executablePath(),
      headless: true,
    });
  } else {
    const puppeteer = await import("puppeteer");
    return puppeteer.default.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
}

export async function generateMenuPdf(menuId: string): Promise<Buffer> {
  // 1. Load menu data
  const menu = await prisma.menu.findUnique({
    where: { id: menuId },
    include: {
      user: { select: { plan: true } },
      restaurant: true,
      categories: {
        include: { dishes: { orderBy: { sortOrder: "asc" } } },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!menu) throw new Error("Menu introuvable");

  const customColors = (menu.customColors as Record<string, string>) ?? {};
  const customFonts = (menu.customFonts as Record<string, string>) ?? {};

  const templateData: TemplateData = {
    restaurant: {
      name: menu.restaurant.name,
      address: menu.restaurant.address ?? undefined,
      phone: menu.restaurant.phone ?? undefined,
      email: menu.restaurant.email ?? undefined,
      website: menu.restaurant.website ?? undefined,
      logoUrl: menu.restaurant.logoUrl ?? undefined,
    },
    menu: {
      name: menu.name,
      categories: menu.categories.map((cat) => ({
        name: cat.name,
        description: cat.description ?? undefined,
        dishes: cat.dishes.map((dish) => ({
          name: dish.name,
          description: dish.description ?? undefined,
          price: formatPrice(Number(dish.price)),
          allergens: dish.allergens,
          isAvailable: dish.isAvailable,
        })),
      })),
    },
    customization: {
      primaryColor: customColors.primary ?? "#FF6B35",
      backgroundColor: customColors.background ?? "#FFF8F2",
      textColor: customColors.text ?? "#1A1A2E",
      headingFont: customFonts.heading ?? "Playfair Display",
      bodyFont: customFonts.body ?? "Inter",
    },
    branding: {
      showWatermark: menu.user.plan === "FREE",
    },
    aiDesignHtml: menu.aiDesignHtml ?? undefined,
    aiBackgroundUrl: menu.aiBackgroundUrl ?? undefined,
  };

  // 2. Build HTML
  const html = buildPdfHtml(templateData, menu.templateId);

  // 3. Generate PDF with Puppeteer
  const browser = await launchBrowser();

  try {
    const page = (await browser.newPage()) as unknown as Page;
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Wait for fonts to finish loading — critical for correct scale calculation
    await page.evaluate(() => document.fonts.ready);

    // Wait for the paginator's DOMContentLoaded handler (background copy) to complete.
    // The paginator pre-marks pages synchronously, so data-mf-scaled is already set;
    // we just need a brief settle for DOMContentLoaded and any reflow to finish.
    await new Promise((r) => setTimeout(r, 200));

    const isAiCustom = menu.templateId === "ai-custom";
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      // AI custom designs handle their own margins via .menu-page
      margin: isAiCustom
        ? { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" }
        : { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

function buildPdfHtml(data: TemplateData, templateId: string): string {
  switch (templateId) {
    case "ai-custom":
      return buildAiCustomPdfHtml(data);
    case "bistrot":
      return buildBistrotPdfHtml(data);
    case "minimal":
      return buildMinimalPdfHtml(data);
    default:
      return buildClassicPdfHtml(data);
  }
}

// ────────────────────────── AI CUSTOM ──────────────────────────

/**
 * CSS fallback for menus that don't yet have `mf-a4-lock` in their stored HTML.
 * Uses auto height so content flows across pages naturally.
 */
const PDF_A4_LOCK_CSS = `<style id="mf-a4-lock">
.menu-page{width:210mm!important;min-height:297mm!important;height:auto!important;max-height:none!important;overflow:visible!important;box-sizing:border-box!important;position:relative!important;page-break-after:always!important;break-after:page!important;}
</style>`;

/**
 * JS paginator — always injected before Puppeteer renders the PDF.
 * 1. Disables any legacy scaler baked into the HTML (pre-marks pages as processed).
 * 2. Overrides any old `height:297mm / overflow:hidden` lock with natural flow CSS.
 * 3. Adds `break-inside:avoid` to categories/dishes so page breaks fall between items.
 * 4. Copies .menu-page background to <html>/<body> so all PDF pages share the same bg.
 */
const PDF_PAGINATOR_SCRIPT = `<script data-mf-paginator="1">
(function(){
  // 1. Prevent legacy scaler from running (it checks data-mf-scaled before scaling)
  document.querySelectorAll('.menu-page').forEach(function(p){p.setAttribute('data-mf-scaled','1');});
  // 2. Override old height lock — allow natural pagination across A4 pages
  var s=document.createElement('style');
  s.textContent=
    '.menu-page{min-height:297mm!important;height:auto!important;max-height:none!important;overflow:visible!important;page-break-after:always!important;break-after:page!important;}'+
    '.category,.menu-section,.dish,[class*="category"],[class*="section"],[class*="dish"],[class*="item"]{break-inside:avoid!important;page-break-inside:avoid!important;}';
  (document.head||document.body).appendChild(s);
  // 3. Copy page background to html/body so secondary pages keep the bg colour
  function copyBg(){
    var p=document.querySelector('.menu-page');
    if(!p)return;
    var bg=window.getComputedStyle(p).backgroundColor;
    if(bg&&bg!=='rgba(0, 0, 0, 0)'&&bg!=='transparent'){
      document.documentElement.style.setProperty('background-color',bg,'important');
      document.body.style.setProperty('background-color',bg,'important');
    }
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',copyBg);}
  else{copyBg();}
})();
<\/script>`;

function buildAiCustomPdfHtml(data: TemplateData): string {
  if (data.aiDesignHtml) {
    // The AI-generated HTML is already a complete document
    let html = data.aiDesignHtml;

    // Inject background image if available
    if (data.aiBackgroundUrl) {
      html = html.replace(
        /<body([^>]*)>/i,
        `<body$1 style="background-image: url('${data.aiBackgroundUrl}'); background-size: cover; background-position: center;">`
      );
    }

    // Inject A4 lock CSS if not already present (handles old generated menus)
    if (!html.includes('id="mf-a4-lock"')) {
      html = html.replace("</head>", `${PDF_A4_LOCK_CSS}</head>`);
    }

    // Always inject the paginator — it disables any legacy scaler, overrides old
    // height:297mm CSS, and copies the background colour to html/body so all pages look right.
    if (!html.includes('data-mf-paginator')) {
      html = html.replace("</body>", `${PDF_PAGINATOR_SCRIPT}</body>`);
    }

    // Inject watermark for FREE plan (must be last, after scaler)
    if (data.branding.showWatermark) {
      html = html.replace("</body>", `${watermarkHtml()}</body>`);
    }

    return html;
  }

  // Fallback to classic if no AI design exists
  return buildClassicPdfHtml(data);
}

function allergenLabel(id: string): string {
  const map: Record<string, string> = {
    gluten: "Gluten", crustaces: "Crustacés", oeufs: "Œufs",
    poissons: "Poissons", arachides: "Arachides", soja: "Soja",
    lait: "Lait", "fruits-a-coque": "Fruits à coque", celeri: "Céleri",
    moutarde: "Moutarde", sesame: "Sésame", sulfites: "Sulfites",
    lupin: "Lupin", mollusques: "Mollusques",
  };
  return map[id] ?? id;
}

function collectAllergens(data: TemplateData): string[] {
  const used = new Set<string>();
  data.menu.categories.forEach((cat) =>
    cat.dishes.forEach((dish) => dish.allergens.forEach((a) => used.add(a)))
  );
  return Array.from(used);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function watermarkHtml(): string {
  const text = "MENUFIQUE · PLAN GRATUIT";
  const rows = Array.from({ length: 8 }, (_, i) =>
    `<div style="white-space:nowrap;transform:rotate(-35deg);font-size:18pt;font-weight:800;letter-spacing:4px;color:rgba(0,0,0,0.07);font-family:sans-serif;margin-bottom:60px;">${Array(4).fill(text).join("   ")}</div>`
  ).join("");

  return `<div style="position:fixed;top:-100px;left:-100px;right:-100px;bottom:-100px;z-index:9999;pointer-events:none;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;">
    ${rows}
  </div>`;
}

function pdfHead(fontBody: string, fontHeading: string, extraStyles: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: '${fontBody}', sans-serif; font-size: 11pt; line-height: 1.5; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    ${extraStyles}
  </style>
</head>`;
}

// ────────────────────────── CLASSIC ──────────────────────────
function buildClassicPdfHtml(data: TemplateData): string {
  const { restaurant, menu, customization, branding } = data;
  const p = customization.primaryColor;
  const t = customization.textColor;
  const bg = customization.backgroundColor;
  const h = customization.headingFont;
  const b = customization.bodyFont;
  const usedAllergens = collectAllergens(data);

  const categoriesHtml = menu.categories
    .map((cat) => {
      const dishesHtml = cat.dishes
        .filter((d) => d.isAvailable)
        .map((dish) => {
          const allergenSup = dish.allergens.length > 0
            ? `<sup style="font-size:7pt;opacity:0.4;margin-left:2px;">${dish.allergens.map((a) => {
                const allIds = ["gluten","crustaces","oeufs","poissons","arachides","soja","lait","fruits-a-coque","celeri","moutarde","sesame","sulfites","lupin","mollusques"];
                return allIds.indexOf(a) + 1;
              }).join(",")}</sup>`
            : "";
          return `
            <div style="margin-bottom:10px;">
              <div style="display:flex;align-items:baseline;gap:4px;">
                <span style="font-weight:600;font-size:11pt;flex-shrink:0;">${escapeHtml(dish.name)}</span>
                ${allergenSup}
                <div style="flex:1;border-bottom:1px dotted ${t}25;min-width:20px;margin:0 4px;position:relative;top:-3px;"></div>
                <span style="font-weight:700;font-size:11pt;color:${p};flex-shrink:0;white-space:nowrap;">${dish.price}</span>
              </div>
              ${dish.description ? `<p style="font-size:9pt;font-style:italic;opacity:0.5;margin-top:2px;line-height:1.4;padding-right:3rem;">${escapeHtml(dish.description)}</p>` : ""}
            </div>`;
        })
        .join("");

      return `
        <div style="margin-bottom:28px;">
          <div style="text-align:center;margin-bottom:16px;">
            <h3 style="font-family:'${h}',serif;font-size:13pt;font-weight:700;text-transform:uppercase;letter-spacing:3px;color:${p};margin:0;">${escapeHtml(cat.name)}</h3>
            ${cat.description ? `<p style="font-size:9pt;font-style:italic;opacity:0.5;margin-top:4px;">${escapeHtml(cat.description)}</p>` : ""}
            <div style="width:40px;height:2px;background:${p};margin:8px auto 0;border-radius:1px;"></div>
          </div>
          ${dishesHtml}
        </div>`;
    })
    .join("");

  const allergenLegend = usedAllergens.length > 0
    ? `<div style="margin-top:28px;padding-top:12px;border-top:1px solid ${p}20;font-size:8pt;opacity:0.45;line-height:1.6;">
        <p style="font-weight:600;margin-bottom:3px;">Allergènes :</p>
        <p>${usedAllergens.map((a) => {
          const allIds = ["gluten","crustaces","oeufs","poissons","arachides","soja","lait","fruits-a-coque","celeri","moutarde","sesame","sulfites","lupin","mollusques"];
          return `<strong>(${allIds.indexOf(a) + 1})</strong> ${allergenLabel(a)}`;
        }).join(" · ")}</p>
      </div>`
    : "";

  return `${pdfHead(b, h, `body { background:${bg}; color:${t}; }`)}
<body style="padding:32px 28px;">
  <!-- Ornamental top border -->
  <div style="height:3px;background:linear-gradient(90deg,transparent,${p},transparent);margin-bottom:24px;"></div>

  <!-- Header -->
  <div style="text-align:center;margin-bottom:24px;">
    <h1 style="font-family:'${h}',serif;font-size:26pt;font-weight:700;letter-spacing:1px;color:${p};margin:0;line-height:1.2;">${escapeHtml(restaurant.name)}</h1>
    ${restaurant.address ? `<p style="font-size:9pt;opacity:0.5;margin-top:6px;letter-spacing:0.5px;">${escapeHtml(restaurant.address)}</p>` : ""}
    ${restaurant.phone ? `<p style="font-size:9pt;opacity:0.5;margin-top:2px;">${escapeHtml(restaurant.phone)}</p>` : ""}
  </div>

  <!-- Divider -->
  <div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:20px;">
    <div style="height:1px;width:60px;background:${p};opacity:0.4;"></div>
    <span style="color:${p};font-size:14pt;opacity:0.6;">❧</span>
    <div style="height:1px;width:60px;background:${p};opacity:0.4;"></div>
  </div>

  <!-- Menu title -->
  <h2 style="text-align:center;font-family:'${h}',serif;font-size:13pt;font-weight:600;font-style:italic;margin-bottom:24px;opacity:0.7;">— ${escapeHtml(menu.name)} —</h2>

  ${categoriesHtml}
  ${allergenLegend}

  <!-- Bottom ornament -->
  <div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-top:24px;">
    <div style="height:1px;width:40px;background:${p};opacity:0.3;"></div>
    <span style="color:${p};font-size:9pt;opacity:0.4;">✦</span>
    <div style="height:1px;width:40px;background:${p};opacity:0.3;"></div>
  </div>

  ${branding.showWatermark ? watermarkHtml() : ""}
</body>
</html>`;
}

// ────────────────────────── MINIMAL ──────────────────────────
function buildMinimalPdfHtml(data: TemplateData): string {
  const { restaurant, menu, customization, branding } = data;
  const p = customization.primaryColor;
  const t = customization.textColor;
  const b = customization.bodyFont;
  const usedAllergens = collectAllergens(data);

  const categoriesHtml = menu.categories
    .map((cat) => {
      const dishesHtml = cat.dishes
        .filter((d) => d.isAvailable)
        .map((dish) => {
          const allergenTags = dish.allergens.length > 0
            ? `<div style="display:flex;gap:4px;margin-top:5px;flex-wrap:wrap;">${dish.allergens.map((a) =>
                `<span style="font-size:7pt;font-weight:500;padding:2px 6px;border-radius:2px;background:${p}10;color:${t}80;letter-spacing:0.3px;">${allergenLabel(a)}</span>`
              ).join("")}</div>`
            : "";
          return `
            <div style="margin-bottom:18px;">
              <div style="display:flex;justify-content:space-between;align-items:baseline;gap:20px;">
                <span style="font-weight:600;font-size:11pt;letter-spacing:-0.1px;">${escapeHtml(dish.name)}</span>
                <span style="font-size:10.5pt;font-weight:600;color:${p};flex-shrink:0;white-space:nowrap;">${dish.price}</span>
              </div>
              ${dish.description ? `<p style="font-size:9pt;opacity:0.4;margin-top:3px;line-height:1.5;max-width:85%;">${escapeHtml(dish.description)}</p>` : ""}
              ${allergenTags}
            </div>`;
        })
        .join("");

      return `
        <div style="margin-bottom:30px;">
          <h3 style="font-family:'${b}',sans-serif;font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:4px;opacity:0.35;margin-bottom:16px;padding-bottom:6px;border-bottom:1px solid ${t}10;">${escapeHtml(cat.name)}</h3>
          ${cat.description ? `<p style="font-size:9pt;opacity:0.35;margin-top:-8px;margin-bottom:12px;font-style:italic;">${escapeHtml(cat.description)}</p>` : ""}
          ${dishesHtml}
        </div>`;
    })
    .join("");

  return `${pdfHead(b, b, `body { background:#FFFFFF; color:${t}; }`)}
<body style="padding:40px 28px;">
  <!-- Header -->
  <div style="margin-bottom:36px;">
    <div style="display:flex;align-items:center;justify-content:space-between;">
      <h1 style="font-family:'${b}',sans-serif;font-size:20pt;font-weight:700;margin:0;letter-spacing:-0.2px;">${escapeHtml(restaurant.name)}</h1>
      ${restaurant.phone ? `<span style="font-size:9pt;opacity:0.35;font-weight:500;">${escapeHtml(restaurant.phone)}</span>` : ""}
    </div>
    ${restaurant.address ? `<p style="font-size:9pt;opacity:0.35;margin-top:4px;font-weight:400;">${escapeHtml(restaurant.address)}</p>` : ""}
    <div style="width:32px;height:2px;background:${p};margin-top:16px;"></div>
  </div>

  ${categoriesHtml}

  ${usedAllergens.length > 0 ? `<p style="margin-top:32px;font-size:7pt;opacity:0.25;line-height:1.6;">Allergènes : ${usedAllergens.map((a) => allergenLabel(a)).join(", ")}</p>` : ""}
  ${branding.showWatermark ? watermarkHtml() : ""}
</body>
</html>`;
}

// ────────────────────────── BISTROT ──────────────────────────
function buildBistrotPdfHtml(data: TemplateData): string {
  const { restaurant, menu, customization, branding } = data;
  const accent = customization.primaryColor;
  const h = customization.headingFont;
  const b = customization.bodyFont;
  const bgColor = "#1C1410";
  const textColor = "#F2E8DC";
  const subtleColor = "#A89279";
  const usedAllergens = collectAllergens(data);

  const categoriesHtml = menu.categories
    .map((cat) => {
      const dishesHtml = cat.dishes
        .filter((d) => d.isAvailable)
        .map((dish) => {
          const allergenText = dish.allergens.length > 0
            ? `<p style="font-size:7pt;color:${subtleColor}80;margin-top:3px;">${dish.allergens.map((a) => allergenLabel(a)).join(" · ")}</p>`
            : "";
          return `
            <div style="text-align:center;margin-bottom:14px;">
              <div style="display:flex;align-items:baseline;justify-content:center;gap:10px;">
                <span style="font-weight:600;font-size:11pt;letter-spacing:0.3px;">${escapeHtml(dish.name)}</span>
                <span style="font-weight:700;color:${accent};font-size:11pt;">${dish.price}</span>
              </div>
              ${dish.description ? `<p style="font-size:9pt;font-style:italic;color:${subtleColor};margin-top:2px;line-height:1.4;">${escapeHtml(dish.description)}</p>` : ""}
              ${allergenText}
            </div>`;
        })
        .join("");

      return `
        <div style="margin-bottom:32px;">
          <div style="text-align:center;margin-bottom:16px;">
            <h3 style="font-family:'${h}',serif;font-size:14pt;font-weight:700;color:${accent};margin:0;letter-spacing:2px;">${escapeHtml(cat.name)}</h3>
            ${cat.description ? `<p style="font-size:9pt;font-style:italic;color:${subtleColor};margin-top:4px;">${escapeHtml(cat.description)}</p>` : ""}
          </div>
          ${dishesHtml}
        </div>`;
    })
    .join("");

  return `${pdfHead(b, h, `body { background:${bgColor}; color:${textColor}; }`)}
<body style="padding:32px 24px;position:relative;">
  <!-- Subtle texture overlay -->
  <div style="position:fixed;top:0;left:0;right:0;bottom:0;opacity:0.03;background-image:repeating-linear-gradient(45deg,transparent,transparent 2px,${textColor} 2px,${textColor} 3px);pointer-events:none;"></div>

  <!-- Inner decorative border -->
  <div style="border:1px solid ${subtleColor}30;border-radius:8px;padding:28px 20px;position:relative;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:28px;">
      <h1 style="font-family:'${h}',serif;font-size:24pt;font-weight:700;color:${accent};margin:0;line-height:1.2;letter-spacing:0.5px;">${escapeHtml(restaurant.name)}</h1>

      <!-- Ornamental divider -->
      <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin:10px 0;">
        <div style="height:1px;width:50px;background:linear-gradient(90deg,transparent,${subtleColor}60);"></div>
        <span style="color:${accent};font-size:10pt;">◆</span>
        <div style="height:1px;width:50px;background:linear-gradient(90deg,${subtleColor}60,transparent);"></div>
      </div>

      ${restaurant.address ? `<p style="font-size:9pt;color:${subtleColor};letter-spacing:1px;">${escapeHtml(restaurant.address)}</p>` : ""}
    </div>

    <!-- Menu title -->
    <div style="text-align:center;margin-bottom:28px;padding:6px 0;border-top:1px solid ${subtleColor}20;border-bottom:1px solid ${subtleColor}20;">
      <h2 style="font-family:'${h}',serif;font-size:12pt;font-style:italic;font-weight:400;letter-spacing:3px;text-transform:uppercase;color:${subtleColor};margin:0;">${escapeHtml(menu.name)}</h2>
    </div>

    ${categoriesHtml}

    ${usedAllergens.length > 0 ? `<div style="margin-top:28px;padding-top:10px;border-top:1px solid ${subtleColor}20;text-align:center;font-size:7pt;color:${subtleColor}60;line-height:1.6;">Allergènes : ${usedAllergens.map((a) => allergenLabel(a)).join(" · ")}</div>` : ""}

    ${restaurant.phone ? `<p style="text-align:center;font-size:8pt;color:${subtleColor};margin-top:16px;letter-spacing:1px;">Réservations : ${escapeHtml(restaurant.phone)}</p>` : ""}

    ${branding.showWatermark ? watermarkHtml() : ""}
  </div>
</body>
</html>`;
}
