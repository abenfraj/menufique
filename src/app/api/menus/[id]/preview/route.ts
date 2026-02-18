import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

/**
 * GET /api/menus/[id]/preview — Returns the AI design HTML directly (no Puppeteer).
 * Used by the editor iframe for instant preview.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const { id: menuId } = await params;

    const menu = await prisma.menu.findFirst({
      where: { id: menuId, userId: session.user.id },
      include: {
        restaurant: true,
        categories: {
          include: { dishes: { orderBy: { sortOrder: "asc" } } },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!menu) {
      return new NextResponse("Menu introuvable", { status: 404 });
    }

    // If we have AI-generated HTML, inject preview normalizer + auto-scaler and serve it
    if (menu.templateId === "ai-custom" && menu.aiDesignHtml) {
      // CSS: centers pages, adds shadow, locks A4 dimensions (overrides any min-height)
      const previewCss = `<style id="preview-normalizer">
html,body{background:#e8eaed!important;margin:0!important;padding:20px 0!important;display:flex!important;flex-direction:column!important;align-items:center!important;gap:20px!important;min-height:100vh!important;}
.menu-page{width:210mm!important;height:297mm!important;min-height:unset!important;max-height:297mm!important;overflow:hidden!important;box-sizing:border-box!important;box-shadow:0 4px 24px rgba(0,0,0,0.18)!important;flex-shrink:0!important;margin:0!important;position:relative!important;}
</style>`;

      // JS auto-scaler: fits overflowing content via transform:scale — waits for fonts before measuring
      const scalerScript = `<script data-mf-scaler="1">
(function(){var DONE='data-mf-scaled';function fit(){document.querySelectorAll('.menu-page').forEach(function(page){if(page.hasAttribute(DONE))return;page.setAttribute(DONE,'1');var pH=page.clientHeight,cH=page.scrollHeight;if(!pH||cH<=pH+1)return;var scale=pH/cH;var wrap=document.createElement('div');wrap.style.cssText='transform-origin:top left;width:'+(100/scale).toFixed(3)+'%;display:block;';while(page.firstChild)wrap.appendChild(page.firstChild);page.appendChild(wrap);wrap.style.transform='scale('+scale.toFixed(6)+')';});}function run(){if(document.fonts&&document.fonts.ready){document.fonts.ready.then(fit);}else{fit();}}if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',run);}else{run();}})();
<\/script>`;

      let html = menu.aiDesignHtml;
      // Only inject what's not already present (handles both old and new generated HTML)
      if (!html.includes('id="preview-normalizer"')) {
        html = html.replace("</head>", `${previewCss}</head>`);
      }
      if (!html.includes('data-mf-scaler')) {
        html = html.replace("</body>", `${scalerScript}</body>`);
      }

      return new NextResponse(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // Otherwise, build a simple preview HTML
    const html = buildSimplePreviewHtml(menu);
    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch {
    return new NextResponse("Erreur serveur", { status: 500 });
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildSimplePreviewHtml(menu: {
  name: string;
  restaurant: { name: string; address: string | null; phone: string | null };
  categories: {
    name: string;
    description: string | null;
    dishes: {
      name: string;
      description: string | null;
      price: unknown;
      allergens: string[];
      isAvailable: boolean;
    }[];
  }[];
}): string {
  const cats = menu.categories
    .map(
      (cat) => `
      <div style="margin-bottom:24px;">
        <h3 style="font-family:'Playfair Display',serif;font-size:15pt;color:#FF6B35;text-align:center;margin-bottom:12px;text-transform:uppercase;letter-spacing:2px;">${escapeHtml(cat.name)}</h3>
        ${cat.description ? `<p style="text-align:center;font-style:italic;opacity:0.5;font-size:10pt;margin-bottom:10px;">${escapeHtml(cat.description)}</p>` : ""}
        ${cat.dishes
          .filter((d) => d.isAvailable)
          .map(
            (d) => `
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;">
            <span style="font-weight:600;font-size:11pt;">${escapeHtml(d.name)}</span>
            <span style="font-weight:700;color:#FF6B35;">${formatPrice(Number(d.price))}</span>
          </div>
          ${d.description ? `<p style="font-size:9pt;opacity:0.5;margin-top:-4px;margin-bottom:8px;">${escapeHtml(d.description)}</p>` : ""}
        `
          )
          .join("")}
      </div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { background: #e8eaed; min-height: 100vh; }
    body { font-family: 'Inter', sans-serif; color: #1A1A2E; display: flex; flex-direction: column; align-items: center; padding: 20px 0; gap: 20px; }
    .menu-page { width: 210mm; min-height: 297mm; padding: 15mm; box-shadow: 0 4px 24px rgba(0,0,0,0.18); background: #FFF8F2; }
  </style>
</head>
<body>
  <div class="menu-page">
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="font-family:'Playfair Display',serif;font-size:24pt;color:#FF6B35;">${escapeHtml(menu.restaurant.name)}</h1>
      ${menu.restaurant.address ? `<p style="font-size:9pt;opacity:0.5;margin-top:6px;">${escapeHtml(menu.restaurant.address)}</p>` : ""}
      ${menu.restaurant.phone ? `<p style="font-size:9pt;opacity:0.5;margin-top:2px;">${escapeHtml(menu.restaurant.phone)}</p>` : ""}
    </div>
    ${cats}
  </div>
</body>
</html>`;
}
