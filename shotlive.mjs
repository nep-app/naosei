import pkg from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pkg;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
await page.goto(process.argv[2], { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3500);
await page.screenshot({ path: process.argv[3], fullPage: true });
console.log('ok');
await browser.close();
