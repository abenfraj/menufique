import puppeteer from 'puppeteer';
const BASE = 'http://localhost:3000';
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
await page.goto(BASE + '/login', { waitUntil: 'networkidle0' });
await page.type('input[type="email"]', 'testui_snap@menufique.dev');
await page.type('input[type="password"]', 'TestUI123456!');
await page.click('button[type="submit"]');
await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
await page.goto(BASE + '/menus/new', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 1500));
await page.screenshot({ path: '/tmp/import-current.png', fullPage: true });

// Click "Importer" tab
const importBtn = await page.$('[class*="border-border"]:last-child');
// Let's click the import card
const cards = await page.$$('button, [role="button"]');
// Try to find and click the import option
await page.evaluate(() => {
  const divs = document.querySelectorAll('div');
  for (const d of divs) {
    if (d.textContent?.includes('Importer')) {
      d.click();
      break;
    }
  }
});
await new Promise(r => setTimeout(r, 800));
await page.screenshot({ path: '/tmp/import-clicked.png', fullPage: true });

await browser.close();
console.log('Done');
