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
const assertShellFits=async label=>{
  const metrics=await page.evaluate(()=>{
    const rect=selector=>{const el=document.querySelector(selector);if(!el)return null;const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.width,height:r.height};};
    return {
      innerHeight:window.innerHeight,
      visualHeight:window.visualViewport?.height||window.innerHeight,
      app:rect('.app-shell'),
      view:rect('.game-view'),
      nav:rect('.main-nav'),
      board:rect('.board-frame'),
      scrollHeight:document.documentElement.scrollHeight,
    };
  });
  assert(metrics.app&&metrics.view&&metrics.nav,`${label}: shell elements missing`);
  assert(metrics.nav.top>=0&&metrics.nav.bottom<=metrics.visualHeight+1,`${label}: bottom navigation is outside visible viewport ${JSON.stringify(metrics)}`);
  assert(metrics.app.bottom<=metrics.visualHeight+1,`${label}: app shell exceeds visual viewport ${JSON.stringify(metrics)}`);
  assert(metrics.scrollHeight<=metrics.innerHeight+1,`${label}: document scrolls vertically ${JSON.stringify(metrics)}`);
  if(metrics.board)assert(metrics.board.bottom<=metrics.nav.top+1,`${label}: board overlaps navigation ${JSON.stringify(metrics)}`);
  return metrics;
};
let clickTrace=[],toastState=null,afterImmediate=null,afterProgrammatic=null;
let viewportReports={};

let failure=null;
try{
  await page.goto(baseURL,{waitUntil:'networkidle'});
  await page.waitForSelector('.game-view');
  assert((await page.title()).toLowerCase().includes('poply'),'page title is not Poply');
  viewportReports.board844=await assertShellFits('390x844 board');
  await shot('01-board-390x844');

  await page.locator('[data-view="place"]').click();
  await page.waitForSelector('.view-place');
  viewportReports.place844=await assertShellFits('390x844 place');
  await shot('02-place-390x844');

  await page.locator('[data-view="orders"]').click();
  await page.waitForSelector('.view-orders');
  viewportReports.orders844=await assertShellFits('390x844 orders');
  await shot('03-orders-390x844');

  // Real Safari exposes less webpage height than the physical 844px screen because browser chrome is visible.
  // Exercise the authored one-screen layouts at a deliberately short visual viewport too.
  await page.setViewportSize({width:390,height:720});
  await page.waitForTimeout(120);
  await page.locator('[data-view="board"]').click();
  viewportReports.board720=await assertShellFits('390x720 board');
  await shot('04-board-short-safari');
  await page.locator('[data-view="place"]').click();
  viewportReports.place720=await assertShellFits('390x720 place');
  await shot('05-place-short-safari');
  await page.locator('[data-view="orders"]').click();
  viewportReports.orders720=await assertShellFits('390x720 orders');
  await shot('06-orders-short-safari');

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
  const serveBox=await serve.boundingBox(),navBox=await page.locator('.main-nav').boundingBox();
  assert(serveBox&&navBox&&serveBox.y+serveBox.height<=navBox.y+1,`serve button is clipped by navigation: ${JSON.stringify({serveBox,navBox})}`);
  await shot('07-before-serve-short-safari');

  await page.evaluate(()=>{
    window.__qaClickTrace=[];
    const record=(scope,event)=>{
      const target=event.target instanceof Element?event.target:event.target?.parentElement;
      window.__qaClickTrace.push({
        scope,
        tag:target?.tagName||null,
        className:typeof target?.className==='string'?target.className:null,
        dataOrder:target?.closest?.('[data-order]')?.dataset?.order||null,
        dataAction:target?.closest?.('[data-action]')?.dataset?.action||null,
        defaultPrevented:event.defaultPrevented,
      });
    };
    document.addEventListener('click',event=>record('document-capture',event),true);
    document.querySelector('#app')?.addEventListener('click',event=>record('app-bubble',event));
  });

  const before=await readSave();
  await serve.click();
  await page.waitForTimeout(80);
  afterImmediate=await readSave();
  clickTrace=await page.evaluate(()=>window.__qaClickTrace||[]);
  toastState=await page.evaluate(()=>{const el=document.querySelector('#toast');return {text:el?.textContent||'',show:el?.classList.contains('show')||false,tone:el?.dataset?.tone||null};});
  await page.waitForTimeout(1020);
  const after=await readSave();
  await shot('08-after-serve-short-safari');

  if(after.coins===before.coins){
    // Diagnostic only: determines whether native programmatic click reaches the same delegated action.
    await page.evaluate(()=>document.querySelector('button[data-order="order-0"]')?.click());
    await page.waitForTimeout(100);
    afterProgrammatic=await readSave();
  }

  assert(after.coins===before.coins+45,`coins did not increase by 45 (${before.coins} -> ${after.coins}); trace=${JSON.stringify(clickTrace)} toast=${JSON.stringify(toastState)} programmaticCoins=${afterProgrammatic?.coins??'n/a'}`);
  assert(after.stars===before.stars+2,`stars did not increase by 2 (${before.stars} -> ${after.stars})`);
  assert(!after.currentOrders.some(order=>order.id==='order-0'),'served order still exists');
  assert(after.currentOrders.some(order=>order.id==='order-3'),'replacement order was not created');
  assert(!after.board.some(item=>item?.id==='qa-ready-coffee'),'served item was not consumed');
  assert(after.stats.orders===before.stats.orders+1,'order statistic did not increment');
  assert(await page.locator('.view-orders').isVisible(),'orders view disappeared after serving');

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
  await writeFile(`${outDir}/qa-report.json`,JSON.stringify({baseURL,screen:'390x844',testedViewports:['390x844','390x720 short Safari'],viewportReports,consoleProblems,clickTrace,toastState,afterImmediate,afterProgrammatic,failure:failure?.message||null},null,2));
  await browser.close();
}
if(failure)throw failure;
console.log('Mobile WebKit QA passed.');
