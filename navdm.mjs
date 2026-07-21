import pkg from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pkg;
const SS='/tmp/claude-0/-home-user-naosei/25606974-fafd-5a4e-b063-3e5fd8fcc8d1/scratchpad/';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const p=await b.newPage({viewport:{width:420,height:1000}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:4180/preview.html',{waitUntil:'networkidle'});await p.waitForTimeout(1200);
// go to Messages tab
await p.getByRole('button',{name:/Mensagens/}).click();await p.waitForTimeout(700);
await p.screenshot({path:SS+'dm_list.png',fullPage:true});
// open the conversation
await p.getByText('Lobo Calmo').first().click();await p.waitForTimeout(700);
await p.screenshot({path:SS+'dm_thread.png',fullPage:true});
console.log('ERRORS:',errs.length?errs.join('\n'):'none');
await b.close();
