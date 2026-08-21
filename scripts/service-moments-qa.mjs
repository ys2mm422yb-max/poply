import { webkit } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const baseURL=process.env.QA_BASE_URL||'http://127.0.0.1:4173';
const outDir=process.env.QA_OUT_DIR||'qa-artifacts';
await mkdir(outDir,{recursive:true});
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},screen:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:'de-DE',reducedMotion:'reduce'});
const page=await context.newPage();
const problems=[];page.on('console',msg=>{if(['error','warning'].includes(msg.type()))problems.push(`${msg.type()}: ${msg.text()}`);});page.on('pageerror',error=>problems.push(`pageerror: ${error.message}`));
const assert=(value,message)=>{if(!value)throw new Error(message);};
const shot=name=>page.screenshot({path:`${outDir}/${name}.png`,fullPage:false});
const readSave=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('poply-v2-state-1')||'null'));
const assertNoScroll=async label=>{const m=await page.evaluate(()=>({scroll:document.documentElement.scrollHeight,inner:innerHeight,visual:window.visualViewport?.height||innerHeight}));assert(m.scroll<=m.inner+1,`${label}: document scrolls ${JSON.stringify(m)}`);};
const assertWithin=async(locator,label)=>{const box=await locator.boundingBox(),height=await page.evaluate(()=>window.visualViewport?.height||innerHeight);assert(box&&box.x>=-1&&box.x+box.width<=391&&box.y>=-1&&box.y+box.height<=height+1,`${label} outside viewport ${JSON.stringify(box)}`);};
const assertAboveNav=async(locator,label)=>{const [box,nav]=await Promise.all([locator.boundingBox(),page.locator('.main-nav').boundingBox()]);assert(box&&nav&&box.y+box.height<=nav.y-2,`${label} overlaps nav: ${JSON.stringify({box,nav})}`);};
const openOrders=async()=>{await page.locator('.nav-tab[data-view="orders"]').click();await page.waitForSelector('.view-orders .customer-choice');};
const seed=async mode=>{
  await page.evaluate(async mode=>{
    const game=await import('./src/v2-game.js');let state=game.createInitialState();state.stats.orders=3;state.guestVisits={mika:0,nora:0,sam:0};state.placeUpgrades=[];
    let callsCompleted=0;
    if(mode==='sunset'){state.placeUpgrades=['lights'];callsCompleted=1;}
    if(mode==='regular'){
      const order=state.currentOrders[0],ids=['mika','nora','sam'],guest=ids[Math.abs(Number(order.sequence)||0)%ids.length];state.guestVisits[guest]=5;
    }
    state.serviceCallState={nextAt:3,orderId:null,mode:null,generatorProgress:0,callsCompleted,callsExpired:0};
    localStorage.setItem('poply-v2-state-1',JSON.stringify(state));localStorage.setItem('poply-v2-state-1-backup',JSON.stringify(state));
  },mode);
  await page.reload({waitUntil:'networkidle'});await page.waitForSelector('.game-view');
};
const focusMoment=async()=>{
  const panel=page.locator('.service-call-choice-panel.has-service-moment');await panel.waitFor();const orderId=await panel.getAttribute('data-service-moment-order');
  const selected=await page.locator('.service-card[data-service-order]').getAttribute('data-service-order');
  if(selected!==orderId)await page.locator(`.customer-choice[data-select-order="${orderId}"]`).click();
  await page.waitForSelector(`.service-card[data-service-order="${orderId}"]`);await page.waitForSelector('.service-call-choice-panel.has-service-moment .service-moment-recommended');return orderId;
};

let report={},failure=null;
try{
  await page.goto(baseURL,{waitUntil:'networkidle'});

  await seed('coffee');await openOrders();
  let panel=page.locator('.service-call-choice-panel.has-service-moment[data-service-moment="coffee-day"]');await panel.waitFor();
  let text=(await panel.textContent())||'';assert(text.includes('Kaffee-Tag')&&text.includes('Nachschub')&&text.includes('2×'),`Kaffee-Tag copy incomplete: ${text}`);
  assert(await page.locator('.view-orders > .service-moment-card').count()===0,'Service moment created a seventh direct Orders row');
  const coffeeOrder=await focusMoment();assert(await page.locator(`[data-select-order="${coffeeOrder}"].service-moment-target`).count()===1,'Kaffee-Tag target not highlighted');
  const recommended=page.locator('.service-call-choice-panel [data-service-call-mode="stock"].service-moment-recommended');assert(await recommended.count()===1,'Kaffee-Tag did not recommend Nachschub');
  assert(await recommended.locator('.service-moment-recommendation').count()===1,'moment recommendation badge missing');
  assert((await panel.evaluate(node=>getComputedStyle(node).animationName))==='none','reduced motion still animates service moment');
  await assertWithin(panel,'Kaffee-Tag Ruf row 390x844');await assertNoScroll('Kaffee-Tag ready 390x844');await shot('340-service-moment-coffee-ready-390x844');

  await recommended.click();await page.waitForSelector(`.service-card[data-service-order="${coffeeOrder}"] .service-call-panel.has-service-moment[data-service-moment="coffee-day"]`);
  let active=page.locator('.service-call-panel.has-service-moment');text=(await active.textContent())||'';assert(text.includes('KAFFEE-TAG')&&text.includes('2×'),'active Kaffee-Tag lost its compact payoff');
  await assertWithin(active,'active Kaffee-Tag panel 390x844');await assertNoScroll('Kaffee-Tag active 390x844');await shot('341-service-moment-coffee-active-390x844');
  await page.locator('.nav-tab[data-view="board"]').click();await page.waitForSelector('.board-cell.generator[data-index="0"]');await page.locator('.board-cell.generator[data-index="0"]').click();
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('poply-v2-state-1')||'{}').serviceCallState?.generatorProgress===2);
  let save=await readSave();assert(save.serviceCallState.generatorProgress===2,'one coffee generator did not count 2× during Kaffee-Tag');
  assert(await page.locator(`.board-job[data-focus-order="${coffeeOrder}"].service-moment-target`).count()===1,'active service moment target missing on Board');await assertNoScroll('Kaffee-Tag board 390x844');await shot('342-service-moment-coffee-board-390x844');

  await seed('sunset');await openOrders();panel=page.locator('.service-call-choice-panel.has-service-moment[data-service-moment="sunset-service"]');await panel.waitFor();text=(await panel.textContent())||'';assert(text.includes('Sonnenuntergang-Service')&&text.includes('Abendservice'),'sunset moment missing existing Place Power synergy');await assertWithin(panel,'Sonnenuntergang Ruf row 390x844');await assertNoScroll('sunset moment 390x844');await shot('343-service-moment-sunset-390x844');

  await page.setViewportSize({width:390,height:720});await seed('coffee');await openOrders();panel=page.locator('.service-call-choice-panel.has-service-moment[data-service-moment="coffee-day"]');await panel.waitFor();const shortCoffee=await focusMoment();
  await assertWithin(panel,'Kaffee-Tag Ruf row 390x720');await assertAboveNav(page.locator('.service-card .service-deliver'),'delivery 390x720');await assertNoScroll('Kaffee-Tag ready 390x720');await shot('344-service-moment-coffee-ready-390x720');
  await page.locator('.service-call-choice-panel [data-service-call-mode="stock"].service-moment-recommended').click();await page.waitForSelector(`.service-card[data-service-order="${shortCoffee}"] .service-call-panel.has-service-moment`);active=page.locator('.service-call-panel.has-service-moment');await assertWithin(active,'active Kaffee-Tag panel 390x720');await assertAboveNav(page.locator('.service-card .service-deliver'),'active delivery 390x720');await assertNoScroll('Kaffee-Tag active 390x720');await shot('345-service-moment-coffee-active-390x720');

  await seed('regular');await openOrders();panel=page.locator('.service-call-choice-panel.has-service-moment[data-service-moment="regular-guest"]');await panel.waitFor();text=(await panel.textContent())||'';assert(text.includes('Stammgast kommt')&&text.includes('Loyalität'),'regular-guest moment missing loyalty context');await assertWithin(panel,'Stammgast Ruf row 390x720');await assertNoScroll('Stammgast moment 390x720');await shot('346-service-moment-regular-390x720');

  report={coffeeDay:{recommendedMode:'stock',singleCoffeeGeneratorProgress:2},sunsetService:true,regularGuest:true,reducedMotion:true,viewports:['390x844','390x720'],noDocumentScroll:true,noExtraOrdersRow:true};
  if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){failure=error;try{await shot('347-service-moment-failure');}catch{}}
finally{await writeFile(`${outDir}/service-moments-report.json`,JSON.stringify({report,problems,failure:failure?.message||null},null,2));await browser.close();}
if(failure)throw failure;
console.log('Service moments WebKit QA passed.');
