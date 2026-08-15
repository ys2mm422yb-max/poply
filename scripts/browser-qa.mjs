import { webkit } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const baseURL=process.env.QA_BASE_URL||'http://127.0.0.1:4173';
const outDir=process.env.QA_OUT_DIR||'qa-artifacts';
await mkdir(outDir,{recursive:true});

const browser=await webkit.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},screen:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:'de-DE'});
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
    return {innerHeight:window.innerHeight,visualHeight:window.visualViewport?.height||window.innerHeight,app:rect('.app-shell'),view:rect('.game-view'),nav:rect('.main-nav'),board:rect('.board-frame'),scrollHeight:document.documentElement.scrollHeight};
  });
  assert(metrics.app&&metrics.view&&metrics.nav,`${label}: shell elements missing`);
  assert(metrics.nav.top>=0&&metrics.nav.bottom<=metrics.visualHeight+1,`${label}: bottom navigation is outside visible viewport ${JSON.stringify(metrics)}`);
  assert(metrics.app.bottom<=metrics.visualHeight+1,`${label}: app shell exceeds visual viewport ${JSON.stringify(metrics)}`);
  assert(metrics.scrollHeight<=metrics.innerHeight+1,`${label}: document scrolls vertically ${JSON.stringify(metrics)}`);
  if(metrics.board)assert(metrics.board.bottom<=metrics.nav.top+1,`${label}: board overlaps navigation ${JSON.stringify(metrics)}`);
  return metrics;
};
let clickTrace=[],toastState=null,afterImmediate=null,afterProgrammatic=null;
let viewportReports={},sunsetReport={};

let failure=null;
try{
  await page.goto(baseURL,{waitUntil:'networkidle'});
  await page.waitForSelector('.game-view');
  assert((await page.title()).toLowerCase().includes('poply'),'page title is not Poply');
  viewportReports.board844=await assertShellFits('390x844 board');
  await shot('01-board-390x844');

  await page.locator('.nav-tab[data-view="place"]').click();
  await page.waitForSelector('.view-place');
  viewportReports.place844=await assertShellFits('390x844 place');
  await shot('02-place-390x844');

  await page.locator('.nav-tab[data-view="orders"]').click();
  await page.waitForSelector('.view-orders');
  viewportReports.orders844=await assertShellFits('390x844 orders');
  await shot('03-orders-390x844');

  await page.setViewportSize({width:390,height:720});
  await page.waitForTimeout(120);
  await page.locator('.nav-tab[data-view="board"]').click();
  viewportReports.board720=await assertShellFits('390x720 board');
  await shot('04-board-short-safari');
  await page.locator('.nav-tab[data-view="place"]').click();
  viewportReports.place720=await assertShellFits('390x720 place');
  await shot('05-place-short-safari');
  await page.locator('.nav-tab[data-view="orders"]').click();
  viewportReports.orders720=await assertShellFits('390x720 orders');
  await shot('06-orders-short-safari');

  // Existing real service regression, including first real Guest-loyalty milestone.
  await page.evaluate(async()=>{
    const game=await import('./src/v2-game.js');
    const state=game.createInitialState();
    state.board[9]=game.makeItem('coffee',2,'qa-ready-coffee');state.board[10]=null;
    localStorage.setItem('poply-v2-state-1',JSON.stringify(state));
  });
  await page.reload({waitUntil:'networkidle'});
  await page.locator('.nav-tab[data-view="orders"]').click();
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
    const record=(scope,event)=>{const target=event.target instanceof Element?event.target:event.target?.parentElement;window.__qaClickTrace.push({scope,tag:target?.tagName||null,className:typeof target?.className==='string'?target.className:null,dataOrder:target?.closest?.('[data-order]')?.dataset?.order||null,dataAction:target?.closest?.('[data-action]')?.dataset?.action||null,defaultPrevented:event.defaultPrevented});};
    document.addEventListener('click',event=>record('document-capture',event),true);document.querySelector('#app')?.addEventListener('click',event=>record('app-bubble',event));
  });
  const before=await readSave();
  await serve.click();await page.waitForTimeout(80);afterImmediate=await readSave();
  clickTrace=await page.evaluate(()=>window.__qaClickTrace||[]);toastState=await page.evaluate(()=>{const el=document.querySelector('#toast');return {text:el?.textContent||'',show:el?.classList.contains('show')||false,tone:el?.dataset?.tone||null};});
  await page.waitForTimeout(1020);const after=await readSave();await shot('08-after-serve-short-safari');
  if(after.coins===before.coins){await page.evaluate(()=>document.querySelector('button[data-order="order-0"]')?.click());await page.waitForTimeout(100);afterProgrammatic=await readSave();}
  assert(after.coins===before.coins+70,`coins did not increase by 70 (45 order + 25 first guest milestone) (${before.coins} -> ${after.coins}); trace=${JSON.stringify(clickTrace)} toast=${JSON.stringify(toastState)} programmaticCoins=${afterProgrammatic?.coins??'n/a'}`);
  assert(after.guestVisits?.mika===1&&after.guestVisits?.nora===0&&after.guestVisits?.sam===0,`first service did not record Mika exactly once: ${JSON.stringify(after.guestVisits)}`);
  assert(toastState?.text?.includes('Mika: Bekannt +25'),`guest milestone reward is not explained in delivery feedback: ${JSON.stringify(toastState)}`);
  assert(after.stars===before.stars+2,`stars did not increase by 2 (${before.stars} -> ${after.stars})`);
  assert(!after.currentOrders.some(order=>order.id==='order-0'),'served order still exists');
  assert(after.currentOrders.some(order=>order.id==='order-3'),'replacement order was not created');
  assert(!after.board.some(item=>item?.id==='qa-ready-coffee'),'served item was not consumed');
  assert(after.stats.orders===before.stats.orders+1,'order statistic did not increment');
  assert(await page.locator('.view-orders').isVisible(),'orders view disappeared after serving');

  // Vertical Slice 02: real final Place-01 build -> Sonnenkai -> new generator -> first build -> reload.
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(async()=>{
    const game=await import('./src/v2-game.js');
    const state=game.createInitialState();
    state.placeUpgrades=game.PLACE_01_UPGRADES.slice(0,5).map(upgrade=>upgrade.id);
    state.stars=99;state.coins=900;
    localStorage.setItem('poply-v2-state-1',JSON.stringify(state));
  });
  await page.reload({waitUntil:'networkidle'});
  await page.locator('.nav-tab[data-view="place"]').click();
  await page.waitForSelector('.place-coast');
  assert((await page.locator('.world-copy h1').textContent())?.includes('Café am Meer'),'pre-unlock Place is not Café am Meer');
  const finalCoastBuild=page.locator('[data-action="build"]');
  assert(await finalCoastBuild.isEnabled(),'final Café build is not enabled in deterministic unlock state');
  await shot('09-before-sonnenkai-unlock');
  await finalCoastBuild.click();
  await page.waitForSelector('.place-sunset');
  await page.waitForTimeout(180);
  const unlocked=await readSave();
  sunsetReport.unlock={placeUpgrades:unlocked.placeUpgrades,stars:unlocked.stars,generators:unlocked.board.filter(item=>item?.kind==='generator').map(item=>item.generator)};
  assert(unlocked.placeUpgrades.includes('sign'),'final Place-01 sign was not persisted');
  assert(unlocked.board.filter(item=>item?.generator==='sunset-gen').length===1,'Sonnenkai generator was not unlocked exactly once');
  assert((await page.locator('.world-copy h1').textContent())?.includes('Sonnenkai'),'Place view did not transition to Sonnenkai');
  assert((await page.locator('body').innerText()).includes('Place 02')||(await page.locator('body').innerText()).includes('POPLY PLACE 02'),'Sonnenkai does not identify as Place 02');
  viewportReports.sunsetPlace844=await assertShellFits('390x844 Sonnenkai unlock');
  await shot('10-sonnenkai-unlocked-place');

  await page.locator('.nav-tab[data-view="board"]').click();
  await page.waitForSelector('.view-board.chapter-sunset');
  const sunsetGenerator=page.locator('.board-cell.generator-sunset-gen');
  await sunsetGenerator.waitFor({state:'visible'});
  const beforeGenerate=await readSave();
  await sunsetGenerator.tap();
  await page.waitForTimeout(160);
  const afterGenerate=await readSave();
  assert(afterGenerate.energy===beforeGenerate.energy-1,'Tropenbar did not consume one energy');
  assert(afterGenerate.board.some(item=>item?.family==='fruit'&&item.level===1),'Tropenbar did not produce a tier-1 fruit item');
  sunsetReport.generator={energyBefore:beforeGenerate.energy,energyAfter:afterGenerate.energy,fruitItems:afterGenerate.board.filter(item=>item?.family==='fruit').length};
  await shot('11-sonnenkai-board-fruit-spawn');

  await page.locator('.nav-tab[data-view="place"]').click();
  const firstSunsetBuild=page.locator('[data-action="build"]');
  assert(await firstSunsetBuild.isEnabled(),'first Sonnenkai build is not enabled with remaining stars');
  await firstSunsetBuild.click();
  await page.waitForTimeout(220);
  const afterSunsetBuild=await readSave();
  assert(afterSunsetBuild.placeUpgrades.includes('sunset-lanterns'),'first Sonnenkai upgrade was not persisted');
  assert(afterSunsetBuild.board.filter(item=>item?.generator==='sunset-gen').length===1,'Tropenbar duplicated after Sonnenkai build');
  sunsetReport.firstBuild={stars:afterSunsetBuild.stars,upgrades:afterSunsetBuild.placeUpgrades};
  await shot('12-sonnenkai-first-restoration');

  await page.reload({waitUntil:'networkidle'});
  await page.locator('.nav-tab[data-view="place"]').click();
  await page.waitForSelector('.place-sunset');
  const reloaded=await readSave();
  assert(reloaded.placeUpgrades.includes('sunset-lanterns'),'Sonnenkai progress was lost on reload');
  assert(reloaded.board.filter(item=>item?.generator==='sunset-gen').length===1,'Tropenbar missing/duplicated after reload');
  await page.locator('.nav-tab[data-view="orders"]').click();await page.waitForSelector('.view-orders.chapter-sunset');
  await page.locator('.nav-tab[data-view="board"]').click();await page.waitForSelector('.view-board.chapter-sunset');
  viewportReports.sunsetBoard844=await assertShellFits('390x844 Sonnenkai board');

  const visibleText=(await page.locator('body').innerText()).trim();
  assert(visibleText.length>80,'app rendered an unexpectedly blank state');
  if(consoleProblems.length)throw new Error(`console problems: ${consoleProblems.join(' | ')}`);
}catch(error){failure=error;try{await shot('99-failure');}catch{}}
finally{
  await writeFile(`${outDir}/qa-report.json`,JSON.stringify({baseURL,screen:'390x844',testedViewports:['390x844','390x720 short Safari'],viewportReports,sunsetReport,consoleProblems,clickTrace,toastState,afterImmediate,afterProgrammatic,failure:failure?.message||null},null,2));
  await browser.close();
}
if(failure)throw failure;
console.log('Mobile WebKit QA passed.');
