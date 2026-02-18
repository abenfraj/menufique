/**
 * Génère des screenshots en mode "print" A4 pour voir exactement
 * ce que Puppeteer capturera dans le PDF.
 * Usage : node scripts/test-pdf-visual.mjs
 */

import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "tmp", "pdf-tests");

// A4 at 96dpi: 794 × 1123px
const A4_W = 794;
const A4_H = 1123;

const FIXED_SCALER = `<script data-mf-scaler="1">
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
  function run(){
    if(document.fonts&&document.fonts.ready){document.fonts.ready.then(fit);}
    else{fit();}
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',run);}
  else{run();}
})();
<\/script>`;

const OLD_SCALER = `<script data-mf-scaler="1">
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

const A4_LOCK = `<style id="mf-a4-lock">
.menu-page{width:210mm!important;height:297mm!important;min-height:unset!important;max-height:297mm!important;overflow:hidden!important;box-sizing:border-box!important;position:relative!important;flex-shrink:0!important;}
</style>`;

function inject(html, scaler) {
  let r = html;
  // Remove any existing scaler
  r = r.replace(/<script data-mf-scaler[\s\S]*?<\/script>/g, "");
  if (!r.includes('id="mf-a4-lock"')) r = r.replace("</head>", `${A4_LOCK}</head>`);
  r = r.replace("</body>", `${scaler}</body>`);
  return r;
}

const htmlFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith(".html"));

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

for (const htmlFile of htmlFiles) {
  const name = htmlFile.replace(".html", "");
  const rawHtml = fs.readFileSync(path.join(OUT_DIR, htmlFile), "utf-8");

  for (const [label, scaler] of [["fixed", FIXED_SCALER], ["old", OLD_SCALER]]) {
    console.log(`\n▶ ${name} [${label} scaler]`);
    const html = inject(rawHtml, scaler);

    const page = await browser.newPage();
    await page.setViewport({ width: A4_W, height: A4_H, deviceScaleFactor: 1 });
    await page.emulateMediaType("print");

    await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 });
    await page.evaluate(() => document.fonts.ready);

    if (label === "fixed") {
      // Wait for scaler
      await page.waitForFunction(
        () => document.querySelectorAll('.menu-page').length === 0 ||
              document.querySelectorAll('.menu-page[data-mf-scaled]').length === document.querySelectorAll('.menu-page').length,
        { timeout: 5000 }
      ).catch(() => {});
    } else {
      // Old scaler: just small delay
      await new Promise(r => setTimeout(r, 200));
    }

    await new Promise(r => setTimeout(r, 200));

    // Screenshot VIEWPORT only (not full page) — simulates what Puppeteer captures for PDF
    const pngPath = path.join(OUT_DIR, `${name}-${label}.png`);
    await page.screenshot({ path: pngPath, clip: { x: 0, y: 0, width: A4_W, height: A4_H } });
    console.log(`  Saved: ${pngPath}`);

    // Diagnostic
    const diag = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.menu-page')).map(p => ({
        clientH: p.clientHeight, scrollH: p.scrollHeight, scaled: p.hasAttribute('data-mf-scaled')
      }))
    );
    console.log(`  Diag:`, JSON.stringify(diag));

    await page.close();
  }
}

await browser.close();
console.log("\nDone.");
