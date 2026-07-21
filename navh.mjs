import pkg from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pkg;
const SS='/tmp/claude-0/-home-user-naosei/25606974-fafd-5a4e-b063-3e5fd8fcc8d1/scratchpad/';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const p=await b.newPage({viewport:{width:420,height:1000}});
await p.goto('http://localhost:4180/preview.html',{waitUntil:'networkidle'});await p.waitForTimeout(1200);
await p.getByText('Ajuda / crise').click();await p.waitForTimeout(600);
await p.screenshot({path:SS+'help2.png',fullPage:true});
await b.close();console.log('done');
