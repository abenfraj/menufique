/**
 * Génère les PDFs finaux et ouvre-les en screenshot page par page.
 * Simule exactement ce que fait pdf.ts en production.
 */

import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "tmp", "pdf-tests");

const SCALER = `<script data-mf-scaler="1">
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

const A4_LOCK = `<style id="mf-a4-lock">
.menu-page{width:210mm!important;height:297mm!important;min-height:unset!important;max-height:297mm!important;overflow:hidden!important;box-sizing:border-box!important;position:relative!important;flex-shrink:0!important;}
</style>`;

function prepare(html) {
  let r = html;
  r = r.replace(/<script data-mf-scaler[\s\S]*?<\/script>/g, "");
  if (!r.includes('id="mf-a4-lock"')) r = r.replace("</head>", `${A4_LOCK}</head>`);
  r = r.replace("</body>", `${SCALER}</body>`);
  return r;
}

const htmlFiles = fs.readdirSync(OUT_DIR).filter(f => /^\d\d-.*\.html$/.test(f));
const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

for (const htmlFile of htmlFiles) {
  const name = htmlFile.replace(".html", "");
  console.log(`\n▶ ${name}`);
  const rawHtml = fs.readFileSync(path.join(OUT_DIR, htmlFile), "utf-8");
  const html = prepare(rawHtml);

  const page = await browser.newPage();

  // --- PDF generation (mirrors production pdf.ts) ---
  await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);

  // Wait for scaler
  const menuPageCount = (html.match(/class="[^"]*menu-page[^"]*"/g) ?? []).length;
  if (menuPageCount > 0) {
    await page.waitForFunction(
      (expected) =>
        document.querySelectorAll('.menu-page[data-mf-scaled]').length >= expected,
      { timeout: 5000 },
      menuPageCount
    ).catch(() => console.log("  ⚠ Scaler timeout"));
  }
  await new Promise(r => setTimeout(r, 150));

  // Generate actual PDF
  const pdfBuf = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
  });
  const pdfPath = path.join(OUT_DIR, `${name}-final.pdf`);
  fs.writeFileSync(pdfPath, pdfBuf);
  console.log(`  PDF: ${pdfPath} (${Math.round(pdfBuf.length / 1024)} KB)`);

  // Screenshot of page at A4 size for visual check
  await page.setViewport({ width: 794, height: 1123 });
  const screenshotPath = path.join(OUT_DIR, `${name}-final.png`);
  await page.screenshot({
    path: screenshotPath,
    clip: { x: 0, y: 0, width: 794, height: 1123 },
  });
  console.log(`  PNG: ${screenshotPath}`);

  // Diagnostics
  const diag = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.menu-page')).map((p, i) => {
      const firstChild = p.firstElementChild;
      const hasWrapper = firstChild && firstChild.style.transform;
      return {
        page: i + 1,
        clientH: p.clientHeight,
        scrollH: p.scrollHeight,
        scaled: p.hasAttribute('data-mf-scaled'),
        scaleApplied: hasWrapper ? firstChild.style.transform : 'none',
      };
    })
  );
  for (const d of diag) {
    const fits = d.clientH >= d.scrollH - 2;
    console.log(`  Page ${d.page}: ${fits ? "✅" : "⚠️ "} clientH=${d.clientH} scrollH=${d.scrollH} scale=${d.scaleApplied} scaled=${d.scaled}`);
  }

  await page.close();
}

await browser.close();
console.log("\n✓ Done");
