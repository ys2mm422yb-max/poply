import { webkit } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const baseURL=process.env.QA_BASE_URL||'http://127.0.0.1:4173';
const outDir=process.env.QA_OUT_DIR||'qa-artifacts';
await mkdir(outDir,{recursive:true});

const browser=await webkit.launch({headless:true});
const context=await browser.newContext({
  viewport:{width:390,height:844},
  screen:{width:390,height:844},
  deviceScaleFactor:2,
  isMobile:true,
  hasTouch:true,
  locale:'de-DE',
});
const page=await context.newPage();
const consoleProblems=[];
page.on('console',msg=>{if(['error','warning'].includes(msg.type()))consoleProblems.push(`${msg.type()}: ${msg.text()}`);});
page.on('pageerror',error=>consoleProblems.push(`pageerror: ${error.message}`));

const shot=async name=>page.screenshot({path:`${outDir}/${name}.png`,fullPage:false});
const assert=(value,message)=>{if(!value)throw new Error(message);};
const readSave=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('poply-v2-state-1')||'null'));

let failure=null;
try{
  await page.goto(baseURL,{waitUntil:'networkidle'});
  await page.waitForSelector('.game-view');
  assert((await page.title()).toLowerCase().includes('poply'),'page title is not Poply');
  await shot('01-board-smoke');

  await page.locator('[data-view="place"]').click();
  await page.waitForSelector('.view-place');
  await shot('02-place-smoke');

  await page.locator('[data-view="orders"]').click();
  await page.waitForSelector('.view-orders');
  await shot('03-orders-smoke');

  // Seed one deterministic ready order through the same persisted state used by the live app.
  await page.evaluate(async()=>{
    const game=await import('./src/v2-game.js');
    const state=game.createInitialState();
    state.board[9]=game.makeItem('coffee',2,'qa-ready-coffee');
    state.board[10]=null;
    localStorage.setItem('poply-v2-state-1',JSON.stringify(state));
  });
  await page.reload({waitUntil:'networkidle'});
  await page.locator('[data-view="orders"]').click();
  await page.locator('[data-select-order="order-0"]').click();

  const serve=page.locator('button[data-order="order-0"]');
  await serve.waitFor({state:'visible'});
  assert(await serve.isEnabled(),'ready order serve button is disabled');
  assert((await serve.textContent()||'').includes('Jetzt servieren'),'ready order does not show Jetzt servieren');
  await shot('04-before-serve');

  const before=await readSave();
  await serve.click();
  await page.waitForTimeout(1100);
  const after=await readSave();
  await shot('05-after-serve');

  assert(after.coins===before.coins+45,`coins did not increase by 45 (${before.coins} -> ${after.coins})`);
  assert(after.stars===before.stars+2,`stars did not increase by 2 (${before.stars} -> ${after.stars})`);
  assert(!after.currentOrders.some(order=>order.id==='order-0'),'served order still exists');
  assert(after.currentOrders.some(order=>order.id==='order-3'),'replacement order was not created');
  assert(!after.board.some(item=>item?.id==='qa-ready-coffee'),'served item was not consumed');
  assert(after.stats.orders===before.stats.orders+1,'order statistic did not increment');
  assert(await page.locator('.view-orders').isVisible(),'orders view disappeared after serving');

  // Check primary navigation remains functional after the delivery transition.
  await page.locator('[data-view="board"]').click();
  await page.waitForSelector('.view-board');
  await page.locator('[data-view="orders"]').click();
  await page.waitForSelector('.view-orders');

  const visibleText=(await page.locator('body').innerText()).trim();
  assert(visibleText.length>80,'app rendered an unexpectedly blank state');
  if(consoleProblems.length)throw new Error(`console problems: ${consoleProblems.join(' | ')}`);
}catch(error){
  failure=error;
  try{await shot('99-failure');}catch{}
}finally{
  await writeFile(`${outDir}/qa-report.json`,JSON.stringify({baseURL,viewport:'390x844 mobile WebKit',consoleProblems,failure:failure?.message||null},null,2));
  await browser.close();
}
if(failure)throw failure;
console.log('Mobile WebKit QA passed.');
