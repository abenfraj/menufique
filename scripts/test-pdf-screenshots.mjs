/**
 * Génère des screenshots PNG des pages HTML de test pour inspection visuelle.
 * Usage : node scripts/test-pdf-screenshots.mjs
 */

import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "tmp", "pdf-tests");
fs.mkdirSync(OUT_DIR, { recursive: true });

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
  if(document.fonts&&document.fonts.ready){document.fonts.ready.then(fit);}
  else if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',fit);}
  else{fit();}
})();
<\/script>`;

function injectInfra(html) {
  let result = html;
  if (!result.includes('id="mf-a4-lock"')) result = result.replace("</head>", `${A4_LOCK_CSS}</head>`);
  if (!result.includes('data-mf-scaler')) result = result.replace("</body>", `${AUTO_SCALER_SCRIPT}</body>`);
  return result;
}

// Read HTML files from previous run
const htmlFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith(".html"));
if (htmlFiles.length === 0) {
  console.log("No HTML files found. Run test-pdf-generation.mjs first.");
  process.exit(1);
}

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

for (const htmlFile of htmlFiles) {
  const name = htmlFile.replace(".html", "");
  console.log(`\n▶ Screenshot: ${name}`);

  const rawHtml = fs.readFileSync(path.join(OUT_DIR, htmlFile), "utf-8");
  // Reinject infra (might already be there, but injectInfra checks)
  const html = rawHtml.includes('id="mf-a4-lock"') ? rawHtml : injectInfra(rawHtml);

  const page = await browser.newPage();
  // A4 pixel size at 96dpi: 794 × 1123
  await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });

  await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);

  // Wait for scaler
  await page.waitForFunction(
    () => document.querySelectorAll('.menu-page[data-mf-scaled]').length === document.querySelectorAll('.menu-page').length,
    { timeout: 5000 }
  ).catch(() => {});

  // Extra settle time
  await new Promise(r => setTimeout(r, 300));

  // Diagnostic AFTER fonts + scaler
  const diag = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.menu-page')).map((p, i) => {
      const cs = getComputedStyle(p);
      return {
        index: i,
        clientH: p.clientHeight,
        scrollH: p.scrollHeight,
        scaled: p.hasAttribute('data-mf-scaled'),
        width: cs.width,
        height: cs.height,
        overflow: cs.overflow,
      };
    });
  });
  console.log("  Diagnostics:", JSON.stringify(diag));

  // Screenshot of the .menu-page element only
  const menuPageEl = await page.$('.menu-page');
  const pngPath = path.join(OUT_DIR, `${name}.png`);
  if (menuPageEl) {
    await menuPageEl.screenshot({ path: pngPath });
  } else {
    await page.screenshot({ path: pngPath, fullPage: false });
  }
  console.log(`  PNG saved: ${pngPath}`);

  await page.close();
}

await browser.close();
console.log("\nDone.");
