import { webkit } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const baseURL=process.env.QA_BASE_URL||'http://127.0.0.1:4173';
const outDir=process.env.QA_OUT_DIR||'qa-artifacts';
await mkdir(outDir,{recursive:true});
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},screen:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:'de-DE'});
const page=await context.newPage();
const problems=[];page.on('console',msg=>{if(['error','warning'].includes(msg.type()))problems.push(`${msg.type()}: ${msg.text()}`);});page.on('pageerror',error=>problems.push(`pageerror: ${error.message}`));
const assert=(value,message)=>{if(!value)throw new Error(message);};
const shot=name=>page.screenshot({path:`${outDir}/${name}.png`,fullPage:false});
const readSave=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('poply-v2-state-1')||'null'));
const waitForCallCounter=(field,expected)=>page.waitForFunction(({field,expected})=>{const state=JSON.parse(localStorage.getItem('poply-v2-state-1')||'null');return state?.serviceCallState?.[field]===expected;},{field,expected});
const assertNoScroll=async label=>{const m=await page.evaluate(()=>({scroll:document.documentElement.scrollHeight,inner:innerHeight,visual:window.visualViewport?.height||innerHeight}));assert(m.scroll<=m.inner+1,`${label}: document scrolls ${JSON.stringify(m)}`);};
const assertWithin=async(locator,label)=>{const box=await locator.boundingBox(),height=await page.evaluate(()=>window.visualViewport?.height||innerHeight);assert(box&&box.y>=-1&&box.y+box.height<=height+1,`${label} outside viewport ${JSON.stringify(box)}`);};
const assertAboveNav=async(locator,label)=>{const [box,nav]=await Promise.all([locator.boundingBox(),page.locator('.main-nav').boundingBox()]);assert(box&&nav&&box.y+box.height<=nav.y-4,`${label} overlaps bottom nav: element=${JSON.stringify(box)} nav=${JSON.stringify(nav)}`);};
const reset=async()=>{await page.evaluate(()=>{localStorage.removeItem('poply-v2-state-1');localStorage.removeItem('poply-v2-state-1-backup');});await page.reload({waitUntil:'networkidle'});await page.waitForSelector('.view-board');};
const openOrders=async()=>{await page.locator('.nav-tab[data-view="orders"]').click();await page.waitForSelector('.view-orders .customer-choice');};
const selectOrder=async orderId=>{
  const active=page.locator(`.service-card[data-service-order="${orderId}"]`);if(await active.count())return;
  const choice=page.locator(`[data-select-order="${orderId}"]`);
  const point=await choice.evaluate(element=>{
    const rect=element.getBoundingClientRect(),xs=[.18,.5,.82].map(ratio=>rect.left+rect.width*ratio),ys=[4,9,15,22,30].map(offset=>rect.top+offset);
    for(const y of ys)for(const x of xs){if(x<0||x>=innerWidth||y<0||y>=innerHeight)continue;const hit=document.elementFromPoint(x,y);if(hit&&(hit===element||element.contains(hit)))return {x,y};}
    return null;
  });
  assert(point,`order ${orderId} has no real visible touch point while another guest is selected`);
  await page.touchscreen.tap(point.x,point.y);await active.waitFor();
};
const forceReady=async()=>{await page.evaluate(()=>{const key='poply-v2-state-1',state=JSON.parse(localStorage.getItem(key)||'{}');state.stats=state.stats||{};state.stats.orders=Math.max(3,Number(state.stats.orders)||0);state.serviceCallState={nextAt:state.stats.orders,orderId:null,mode:null,generatorProgress:0,callsCompleted:Number(state.serviceCallState?.callsCompleted)||0,callsExpired:Number(state.serviceCallState?.callsExpired)||0};localStorage.setItem(key,JSON.stringify(state));localStorage.setItem('poply-v2-state-1-backup',JSON.stringify(state));});await page.reload({waitUntil:'networkidle'});};
const prepareOrder=async orderId=>{await page.evaluate(id=>{const key='poply-v2-state-1',state=JSON.parse(localStorage.getItem(key)||'{}'),order=state.currentOrders.find(entry=>entry.id===id);if(!order)throw new Error(`unknown order ${id}`);for(const req of order.requirements){let have=state.board.filter(item=>item?.kind==='item'&&item.family===req.family&&item.level===req.level).length;while(have<req.qty){const index=state.board.findIndex(item=>!item);if(index<0)throw new Error('no empty board slot');state.nextId=(Number(state.nextId)||1000)+1;state.board[index]={id:`qa-call-${state.nextId}`,kind:'item',family:req.family,level:req.level};have+=1;}}localStorage.setItem(key,JSON.stringify(state));localStorage.setItem('poply-v2-state-1-backup',JSON.stringify(state));},orderId);await page.reload({waitUntil:'networkidle'});};

let report={},failure=null;
try{
  await page.goto(baseURL,{waitUntil:'networkidle'});await reset();await forceReady();await openOrders();
  const readyPanel=page.locator('.view-orders>.service-call-choice-panel.is-ready');
  await readyPanel.waitFor();
  assert(await page.locator('.view-orders>.service-call-strip').count()===0,'Orders ready must not duplicate Service-Ruf in a top strip');
  assert(await page.locator('.service-card>.service-call-panel').count()===0,'ready Service-Ruf must not be layered inside the service card');
  const readyText=(await readyPanel.textContent())||'';assert(readyText.includes('Direkt')&&readyText.includes('Nachschub')&&readyText.includes('2× Generator'),`ready choice missing: ${readyText}`);
  assert(await readyPanel.locator('[data-service-call-mode="direct"]').count()===1,'Direkt choice missing');assert(await readyPanel.locator('[data-service-call-mode="stock"]').count()===1,'Nachschub choice missing');
  await assertWithin(readyPanel,'Service-Ruf ready choice 390x844');await assertNoScroll('Service-Ruf ready 390x844');await shot('110-service-call-ready-390x844');

  const targetId=await page.locator('.service-card').getAttribute('data-service-order');
  await readyPanel.locator('[data-service-call-mode="stock"]').click();
  await page.waitForSelector('.view-orders.has-service-call-active .service-call-panel.is-active.mode-stock');
  let save=await readSave();assert(save.serviceCallState.orderId===targetId&&save.serviceCallState.mode==='stock','Nachschub choice not persisted');assert(save.serviceCallState.generatorProgress===0,'Nachschub should start at 0');
  await page.locator('.nav-tab[data-view="board"]').click();await page.waitForSelector('.view-board .board-cell.generator');
  const generator=page.locator('.view-board .board-cell.generator').first();await generator.click();await page.waitForTimeout(120);await generator.click();await page.waitForTimeout(160);
  save=await readSave();assert(save.serviceCallState.generatorProgress===2,`Nachschub did not reach 2/2: ${save.serviceCallState.generatorProgress}`);
  const boardStrip=page.locator('.view-board>.service-call-strip.mode-stock');await boardStrip.waitFor();assert(((await boardStrip.textContent())||'').includes('2/2'),'board strip does not show completed Nachschub');await assertWithin(boardStrip,'active board strip');await assertNoScroll('Service-Ruf active board 390x844');await shot('111-service-call-stock-ready-390x844');

  await prepareOrder(targetId);await openOrders();await selectOrder(targetId);
  const activePanel=page.locator(`.service-card[data-service-order="${targetId}"] .service-call-panel.is-active`);await activePanel.waitFor();assert(((await activePanel.textContent())||'').includes('Nachschub 2/2'),'active target panel lost Nachschub progress');
  assert(await page.locator('.view-orders>.service-call-strip').count()===0,'active Orders must not duplicate Ruf in a top strip');
  const beforeSuccess=await readSave(),beforeCoins=beforeSuccess.coins,callsCompleted=beforeSuccess.serviceCallState.callsCompleted;
  await page.locator(`.service-card[data-service-order="${targetId}"] button[data-order="${targetId}"]`).click();
  await waitForCallCounter('callsCompleted',callsCompleted+1);
  await page.waitForTimeout(380);save=await readSave();assert(save.serviceCallState.callsCompleted===callsCompleted+1,'successful Service-Ruf was not counted');assert(save.coins>beforeCoins,'successful Service-Ruf did not pay Coins');assert(save.serviceCallState.orderId===null,'Service-Ruf stayed active after success');
  await shot('112-service-call-success-390x844');

  await forceReady();await openOrders();const directTarget=await page.locator('.service-card').getAttribute('data-service-order');
  await page.locator('.view-orders>.service-call-choice-panel [data-service-call-mode="direct"]').click();await page.waitForSelector('.view-orders.has-service-call-active .service-call-panel.is-active.mode-direct');
  save=await readSave();const other=save.currentOrders.find(order=>order.id!==directTarget);assert(other,'no second order available for expiry path');const expiredBefore=save.serviceCallState.callsExpired;
  await prepareOrder(other.id);await openOrders();await selectOrder(other.id);await page.locator(`.service-card[data-service-order="${other.id}"] button[data-order="${other.id}"]`).click();
  await waitForCallCounter('callsExpired',expiredBefore+1);await page.waitForTimeout(380);save=await readSave();assert(save.serviceCallState.callsExpired===expiredBefore+1,'other delivery did not expire the call');assert(save.serviceCallState.orderId===null,'expired call stayed active');

  await page.setViewportSize({width:390,height:720});await forceReady();await openOrders();
  const shortPanel=page.locator('.view-orders>.service-call-choice-panel.is-ready'),shortDeliver=page.locator('.service-card>.service-deliver');await shortPanel.waitFor();
  assert(await page.locator('.view-orders>.service-call-strip').count()===0,'390x720 reintroduced duplicate Orders Ruf strip');
  assert(((await shortPanel.textContent())||'').includes('Nachschub'),'390x720 lost Service-Ruf choices');await assertWithin(shortPanel,'Service-Ruf choice 390x720');await assertWithin(shortDeliver,'service button 390x720');await assertAboveNav(shortDeliver,'service button 390x720');await assertNoScroll('Service-Ruf ready 390x720');await shot('113-service-call-ready-390x720');

  report={readyAfterOrders:3,modes:['direct','stock'],stockGeneratorTarget:2,successfulBonus:true,otherDeliveryExpiresOnlyBonus:true,ordersSingleFocus:true,shortViewportNoScroll:true,shortViewportNoNavOverlap:true,persistedDeliveryAssertions:true};
  if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){failure=error;try{await shot('114-service-call-failure');}catch{}}
finally{await writeFile(`${outDir}/service-call-report.json`,JSON.stringify({report,problems,failure:failure?.message||null},null,2));await browser.close();}
if(failure)throw failure;
console.log('Service-Ruf WebKit QA passed.');
