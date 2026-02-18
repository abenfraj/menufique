/**
 * Script de test : génère des PDFs depuis les templates HTML de référence
 * et les sauvegarde dans /tmp/pdf-tests/ pour inspection visuelle.
 *
 * Usage : node scripts/test-pdf-generation.mjs
 */

import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "tmp", "pdf-tests");
fs.mkdirSync(OUT_DIR, { recursive: true });

// ─── Sample HTML fixtures ────────────────────────────────────────────────────
// Reproduit ce que l'IA génère typiquement (avec Google Fonts, 2 colonnes, etc.)

const SAMPLE_ELEGANT = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #FDF8F0; }
  .menu-page { width: 210mm; height: 297mm; padding: 12mm; box-sizing: border-box; overflow: hidden; background: #FDF8F0; position: relative; }
  .header { text-align: center; padding-bottom: 5mm; border-bottom: 0.5px solid #C9A96E; margin-bottom: 4mm; }
  .restaurant-name { font-family: 'Cormorant Garamond', serif; font-size: 30pt; font-weight: 300; letter-spacing: 6px; color: #2C1F14; text-transform: uppercase; margin: 0 0 2px; }
  .restaurant-subtitle { font-family: 'Montserrat', sans-serif; font-size: 6.5pt; letter-spacing: 5px; text-transform: uppercase; color: #C9A96E; margin: 0; }
  .restaurant-address { font-family: 'Montserrat', sans-serif; font-size: 7pt; color: #7A6A5A; margin: 3px 0 0; letter-spacing: 1px; }
  .ornament { text-align: center; color: #C9A96E; font-size: 14pt; letter-spacing: 8px; margin: 3mm 0; line-height: 1; }
  .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; }
  .category { margin-bottom: 4mm; }
  .category-title { font-family: 'Cormorant Garamond', serif; font-size: 12pt; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #2C1F14; border-bottom: 0.5px solid #C9A96E; padding-bottom: 1.5mm; margin-bottom: 2.5mm; }
  .dish { margin-bottom: 2.5mm; }
  .dish-row { display: flex; align-items: flex-end; gap: 3px; }
  .dish-name { font-family: 'Cormorant Garamond', serif; font-size: 10.5pt; color: #2C1F14; flex-shrink: 0; max-width: 68%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .dish-dots { flex: 1; border-bottom: 1px dotted #C9A96E; margin-bottom: 3px; min-width: 8px; }
  .dish-price { font-family: 'Montserrat', sans-serif; font-size: 9.5pt; font-weight: 400; color: #C9A96E; flex-shrink: 0; white-space: nowrap; }
  .dish-desc { font-family: 'Cormorant Garamond', serif; font-size: 8pt; font-style: italic; color: #7A6A5A; margin-top: 0.5mm; display: block; }
  .allergens { font-family: 'Montserrat', sans-serif; font-size: 5.5pt; color: #A08878; text-align: center; margin-top: 2mm; letter-spacing: 0.5px; }
  .footer { position: absolute; bottom: 10mm; left: 12mm; right: 12mm; border-top: 0.5px solid #C9A96E; padding-top: 2.5mm; text-align: center; }
  .footer p { font-family: 'Montserrat', sans-serif; font-size: 6.5pt; letter-spacing: 2px; color: #7A6A5A; margin: 0; text-transform: uppercase; }
</style>
</head>
<body>
<div class="menu-page">
  <header class="header">
    <h1 class="restaurant-name">La Belle Assiette</h1>
    <p class="restaurant-subtitle">Cuisine gastronomique française</p>
    <p class="restaurant-address">12 Rue des Lilas · 75008 Paris · 01 42 36 89 20</p>
  </header>
  <div class="ornament">— ✦ —</div>
  <div class="columns">
    <div>
      <section class="category">
        <h2 class="category-title">Entrées</h2>
        <div class="dish"><div class="dish-row"><span class="dish-name">Soupe à l'oignon</span><span class="dish-dots"></span><span class="dish-price">9 €</span></div><span class="dish-desc">Gratinée, croûton au gruyère</span></div>
        <div class="dish"><div class="dish-row"><span class="dish-name">Carpaccio de bœuf</span><span class="dish-dots"></span><span class="dish-price">14 €</span></div><span class="dish-desc">Roquette, parmesan, huile de truffe</span></div>
        <div class="dish"><div class="dish-row"><span class="dish-name">Feuilleté d'escargots</span><span class="dish-dots"></span><span class="dish-price">13 €</span></div><span class="dish-desc">Beurre persillé, ail confit</span></div>
        <div class="dish"><div class="dish-row"><span class="dish-name">Foie gras maison</span><span class="dish-dots"></span><span class="dish-price">18 €</span></div><span class="dish-desc">Toast brioche, chutney figues</span></div>
      </section>
      <section class="category">
        <h2 class="category-title">Desserts</h2>
        <div class="dish"><div class="dish-row"><span class="dish-name">Tarte Tatin</span><span class="dish-dots"></span><span class="dish-price">10 €</span></div><span class="dish-desc">Crème fraîche, caramel beurre salé</span></div>
        <div class="dish"><div class="dish-row"><span class="dish-name">Crème brûlée</span><span class="dish-dots"></span><span class="dish-price">9 €</span></div><span class="dish-desc">Vanille Bourbon, cassonade</span></div>
        <div class="dish"><div class="dish-row"><span class="dish-name">Fondant chocolat</span><span class="dish-dots"></span><span class="dish-price">11 €</span></div><span class="dish-desc">Cœur coulant, glace vanille</span></div>
        <div class="dish"><div class="dish-row"><span class="dish-name">Île flottante</span><span class="dish-dots"></span><span class="dish-price">8 €</span></div><span class="dish-desc">Crème anglaise, pralin</span></div>
      </section>
    </div>
    <div>
      <section class="category">
        <h2 class="category-title">Plats principaux</h2>
        <div class="dish"><div class="dish-row"><span class="dish-name">Filet de bar</span><span class="dish-dots"></span><span class="dish-price">24 €</span></div><span class="dish-desc">Légumes du marché, beurre blanc</span></div>
        <div class="dish"><div class="dish-row"><span class="dish-name">Canard à l'orange</span><span class="dish-dots"></span><span class="dish-price">26 €</span></div><span class="dish-desc">Magret, jus d'agrumes, pommes sarladaises</span></div>
        <div class="dish"><div class="dish-row"><span class="dish-name">Entrecôte grillée</span><span class="dish-dots"></span><span class="dish-price">28 €</span></div><span class="dish-desc">Sauce béarnaise, frites maison</span></div>
        <div class="dish"><div class="dish-row"><span class="dish-name">Risotto aux cèpes</span><span class="dish-dots"></span><span class="dish-price">22 €</span></div><span class="dish-desc">Parmesan affiné, huile de truffe</span></div>
        <div class="dish"><div class="dish-row"><span class="dish-name">Suprême de volaille</span><span class="dish-dots"></span><span class="dish-price">23 €</span></div><span class="dish-desc">Jus réduit, légumes de saison</span></div>
      </section>
      <section class="category">
        <h2 class="category-title">Fromages</h2>
        <div class="dish"><div class="dish-row"><span class="dish-name">Plateau de fromages</span><span class="dish-dots"></span><span class="dish-price">14 €</span></div><span class="dish-desc">Sélection affinée du moment</span></div>
        <div class="dish"><div class="dish-row"><span class="dish-name">Chèvre chaud</span><span class="dish-dots"></span><span class="dish-price">11 €</span></div><span class="dish-desc">Salade, miel, noix</span></div>
      </section>
    </div>
  </div>
  <p class="allergens">Allergènes : G = Gluten · L = Lait · O = Œuf · P = Poisson · C = Crustacés — Informations disponibles sur demande</p>
  <footer class="footer">
    <p>La Belle Assiette · 12 Rue des Lilas, Paris 8e · 01 42 36 89 20</p>
  </footer>
</div>
</body>
</html>`;

// Version avec beaucoup de contenu qui déborde (cas problématique)
const SAMPLE_OVERFLOW = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Montserrat:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .menu-page { width: 210mm; height: 297mm; padding: 12mm; box-sizing: border-box; overflow: hidden; background: #fff; position: relative; }
  .restaurant-name { font-family: 'Cormorant Garamond', serif; font-size: 28pt; text-align: center; margin-bottom: 5mm; color: #2C1F14; }
  .category-title { font-size: 13pt; font-weight: bold; color: #c9a96e; margin: 4mm 0 2mm; border-bottom: 1px solid #c9a96e; padding-bottom: 1mm; }
  .dish { display: flex; justify-content: space-between; margin-bottom: 2mm; font-size: 11pt; }
  .dish-desc { font-size: 9pt; color: #888; font-style: italic; margin-bottom: 2mm; }
</style>
</head>
<body>
<div class="menu-page">
  <h1 class="restaurant-name">Restaurant Le Grand Large</h1>
  <p style="text-align:center;font-size:8pt;color:#888;margin-bottom:4mm;">15 Avenue de la Mer · 06400 Cannes · 04 93 12 34 56</p>
  ${Array.from({length: 5}, (_, ci) => `
  <div class="category-title">Catégorie ${ci + 1} — ${["Entrées", "Plats principaux", "Grillades", "Poissons", "Desserts"][ci]}</div>
  ${Array.from({length: 6}, (_, di) => `
  <div class="dish"><span>Plat ${ci * 6 + di + 1} avec un très long nom de plat</span><span>${(12 + di * 2 + ci).toFixed(2)} €</span></div>
  <div class="dish-desc">Belle description du plat avec des détails sur la préparation et les ingrédients utilisés.</div>
  `).join("")}
  `).join("")}
</div>
</body>
</html>`;

// Version luxe (fond sombre, ornements CSS)
const SAMPLE_LUXE = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap" rel="stylesheet">
<style>
  body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .menu-page { width: 210mm; height: 297mm; padding: 10mm; box-sizing: border-box; overflow: hidden; background: #080808; position: relative; color: #E8D5A3; }
  .frame { position: absolute; inset: 5mm; border: 1px solid #C9A84C; pointer-events: none; }
  .content { position: relative; z-index: 1; padding: 5mm; }
  .restaurant-name { font-family: 'Cinzel', serif; font-size: 22pt; color: #C9A84C; letter-spacing: 8px; text-transform: uppercase; text-align: center; margin-bottom: 3mm; }
  .subtitle { font-family: 'Cormorant Garamond', serif; font-size: 9pt; font-style: italic; color: rgba(201,168,76,0.75); text-align: center; margin-bottom: 3mm; }
  .divider { display: flex; align-items: center; gap: 3mm; margin: 2mm 0; }
  .divider-line { flex: 1; height: 0.5px; background: linear-gradient(to right, transparent, #C9A84C, transparent); }
  .divider-ornament { color: #C9A84C; font-size: 9pt; }
  .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; margin-top: 4mm; }
  .category-title { font-family: 'Cinzel', serif; font-size: 9pt; color: #C9A84C; letter-spacing: 3px; text-transform: uppercase; text-align: center; margin-bottom: 2mm; }
  .dish-row { display: flex; align-items: flex-end; gap: 3px; margin-bottom: 2mm; }
  .dish-name { font-family: 'Cormorant Garamond', serif; font-size: 10pt; color: #E8D5A3; flex-shrink: 0; max-width: 68%; }
  .dish-dots { flex: 1; border-bottom: 1px dotted rgba(201,168,76,0.35); margin-bottom: 3px; }
  .dish-price { font-family: 'Cinzel', serif; font-size: 9pt; color: #C9A84C; white-space: nowrap; }
  .dish-desc { font-family: 'Cormorant Garamond', serif; font-size: 7.5pt; font-style: italic; color: rgba(232,213,163,0.5); display: block; margin-bottom: 2mm; }
  .footer { position: absolute; bottom: 8mm; left: 10mm; right: 10mm; text-align: center; border-top: 0.5px solid rgba(201,168,76,0.3); padding-top: 2.5mm; }
  .footer p { font-family: 'Cinzel', serif; font-size: 5.5pt; color: rgba(201,168,76,0.6); letter-spacing: 3px; text-transform: uppercase; margin: 0; }
</style>
</head>
<body>
<div class="menu-page">
  <div class="frame"></div>
  <div class="content">
    <h1 class="restaurant-name">Le Prestige</h1>
    <p class="subtitle">Haute Gastronomie Française</p>
    <div class="divider"><div class="divider-line"></div><span class="divider-ornament">◆</span><div class="divider-line"></div></div>
    <p style="font-family:'Cormorant Garamond',serif;font-size:7.5pt;color:rgba(201,168,76,0.6);text-align:center;letter-spacing:2px;margin-top:2mm;">8 Place Vendôme · Paris 1er · 01 40 20 00 00</p>
    <div class="columns">
      <div>
        <p class="category-title">Entrées</p>
        <div class="dish-row"><span class="dish-name">Caviar Osciètre</span><span class="dish-dots"></span><span class="dish-price">85 €</span></div>
        <span class="dish-desc">Blinis tièdes, crème fraîche de Normandie</span>
        <div class="dish-row"><span class="dish-name">Foie gras en terrine</span><span class="dish-dots"></span><span class="dish-price">38 €</span></div>
        <span class="dish-desc">Gelée au Sauternes, brioche toastée</span>
        <div class="dish-row"><span class="dish-name">Langoustines rôties</span><span class="dish-dots"></span><span class="dish-price">44 €</span></div>
        <span class="dish-desc">Beurre corail, légumes croquants</span>
        <p class="category-title" style="margin-top:3mm;">Desserts</p>
        <div class="dish-row"><span class="dish-name">Soufflé au Grand Marnier</span><span class="dish-dots"></span><span class="dish-price">22 €</span></div>
        <span class="dish-desc">Crème anglaise vanillée</span>
        <div class="dish-row"><span class="dish-name">Mille-feuille vanille</span><span class="dish-dots"></span><span class="dish-price">18 €</span></div>
        <span class="dish-desc">Crème légère, caramel lacté</span>
        <div class="dish-row"><span class="dish-name">Tarte au citron</span><span class="dish-dots"></span><span class="dish-price">16 €</span></div>
        <span class="dish-desc">Meringue italienne, sorbet citron</span>
      </div>
      <div>
        <p class="category-title">Plats Principaux</p>
        <div class="dish-row"><span class="dish-name">Homard bleu breton</span><span class="dish-dots"></span><span class="dish-price">78 €</span></div>
        <span class="dish-desc">Beurre aux herbes, tagliatelles fraîches</span>
        <div class="dish-row"><span class="dish-name">Filet de sole meunière</span><span class="dish-dots"></span><span class="dish-price">54 €</span></div>
        <span class="dish-desc">Câpres, citron confit, persil</span>
        <div class="dish-row"><span class="dish-name">Pigeon de Bresse rôti</span><span class="dish-dots"></span><span class="dish-price">62 €</span></div>
        <span class="dish-desc">Jus de truffes, légumes du potager</span>
        <div class="dish-row"><span class="dish-name">Côte de bœuf Wagyu</span><span class="dish-dots"></span><span class="dish-price">95 €</span></div>
        <span class="dish-desc">Sauce Périgueux, pommes dauphines</span>
        <p class="category-title" style="margin-top:3mm;">Fromages</p>
        <div class="dish-row"><span class="dish-name">Chariot de fromages</span><span class="dish-dots"></span><span class="dish-price">24 €</span></div>
        <span class="dish-desc">Sélection affinée, accompagnements</span>
      </div>
    </div>
    <p style="font-family:'Cormorant Garamond',serif;font-size:6pt;color:rgba(201,168,76,0.4);text-align:center;margin-top:3mm;">Allergènes disponibles sur demande · Service 12h30–14h30 · 19h30–22h30</p>
  </div>
  <footer class="footer">
    <p>Le Prestige · 8 Place Vendôme, Paris 1er · contact@leprestige.fr</p>
  </footer>
</div>
</body>
</html>`;

// ─── PDF generation ──────────────────────────────────────────────────────────

const A4_LOCK_CSS = `<style id="mf-a4-lock">
.menu-page{width:210mm!important;height:297mm!important;min-height:unset!important;max-height:297mm!important;overflow:hidden!important;box-sizing:border-box!important;position:relative!important;flex-shrink:0!important;}
</style>`;

const AUTO_SCALER_SCRIPT = `<script data-mf-scaler="1">
(function(){
  var DONE='data-mf-scaled';
  function fit(){
    document.querySelectorAll('.menu-page').forEach(function(page){
      if(page.hasAttribute(DONE))return;
      page.setAttribute(DONE,'1');
      var pH=page.clientHeight,cH=page.scrollHeight;
      if(!pH||cH<=pH+1)return;
      var scale=pH/cH;
      var wrap=document.createElement('div');
      wrap.style.cssText='transform-origin:top left;width:'+(100/scale).toFixed(3)+'%;display:block;';
      while(page.firstChild)wrap.appendChild(page.firstChild);
      page.appendChild(wrap);
      wrap.style.transform='scale('+scale.toFixed(6)+')';
    });
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',fit);}
  else{fit();}
})();
<\/script>`;

function injectInfra(html) {
  let result = html;
  if (!result.includes('id="mf-a4-lock"')) {
    result = result.replace("</head>", `${A4_LOCK_CSS}</head>`);
  }
  if (!result.includes('data-mf-scaler')) {
    result = result.replace("</body>", `${AUTO_SCALER_SCRIPT}</body>`);
  }
  return result;
}

async function generateAndSave(name, rawHtml) {
  const html = injectInfra(rawHtml);

  // Save HTML for inspection
  const htmlPath = path.join(OUT_DIR, `${name}.html`);
  fs.writeFileSync(htmlPath, html, "utf-8");
  console.log(`  HTML saved: ${htmlPath}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // Collect console messages for debugging
    const logs = [];
    page.on("console", (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
    page.on("pageerror", (err) => logs.push(`[ERROR] ${err.message}`));

    await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 });

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);

    // Wait for scaler to complete (check data-mf-scaled on all pages)
    await page.evaluate(() => {
      return new Promise((resolve) => {
        const pages = document.querySelectorAll('.menu-page');
        if (pages.length === 0) return resolve();
        let done = 0;
        const check = () => {
          done = 0;
          pages.forEach(p => { if (p.hasAttribute('data-mf-scaled')) done++; });
          if (done === pages.length) resolve();
          else setTimeout(check, 50);
        };
        setTimeout(check, 100);
      });
    });

    // Capture diagnostics: for each .menu-page, report clientHeight vs scrollHeight
    const diagnostics = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.menu-page')).map((page, i) => ({
        index: i,
        clientHeight: page.clientHeight,
        scrollHeight: page.scrollHeight,
        clientWidth: page.clientWidth,
        scrollWidth: page.scrollWidth,
        overflows: page.scrollHeight > page.clientHeight + 2,
        scaled: page.hasAttribute('data-mf-scaled'),
        style: {
          height: getComputedStyle(page).height,
          overflow: getComputedStyle(page).overflow,
          width: getComputedStyle(page).width,
        }
      }));
    });

    console.log(`  Diagnostics for ${name}:`);
    for (const d of diagnostics) {
      const status = d.overflows ? "⚠️  OVERFLOW" : "✅ OK";
      console.log(`    Page ${d.index + 1}: ${status} | clientH=${d.clientHeight} scrollH=${d.scrollHeight} | width=${d.style.width} | scaled=${d.scaled}`);
    }

    if (logs.length > 0) {
      console.log(`  Console logs:`, logs.slice(0, 5));
    }

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
    });

    const pdfPath = path.join(OUT_DIR, `${name}.pdf`);
    fs.writeFileSync(pdfPath, pdfBuffer);
    console.log(`  PDF saved: ${pdfPath}`);

    return diagnostics;
  } finally {
    await browser.close();
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

console.log(`\n📁 Output dir: ${OUT_DIR}\n`);

const tests = [
  { name: "01-elegant-normal", html: SAMPLE_ELEGANT },
  { name: "02-overflow-heavy", html: SAMPLE_OVERFLOW },
  { name: "03-luxe-dark", html: SAMPLE_LUXE },
];

let allDiagnostics = {};

for (const test of tests) {
  console.log(`\n▶ Generating: ${test.name}`);
  try {
    const diags = await generateAndSave(test.name, test.html);
    allDiagnostics[test.name] = diags;
  } catch (err) {
    console.error(`  ❌ Error: ${err.message}`);
  }
}

// Summary
console.log("\n\n═══════════════ SUMMARY ═══════════════");
for (const [name, diags] of Object.entries(allDiagnostics)) {
  const hasOverflow = diags.some(d => d.overflows);
  console.log(`${hasOverflow ? "❌" : "✅"} ${name}: ${hasOverflow ? "has overflow issues" : "OK"}`);
}
console.log(`\nPDFs saved to: ${OUT_DIR}`);
