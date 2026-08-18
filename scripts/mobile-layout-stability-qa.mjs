import { webkit } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const baseURL=process.env.QA_BASE_URL||'http://127.0.0.1:4173';
const outDir=process.env.QA_OUT_DIR||'qa-artifacts';
const SAFE_TOP=47,SAFE_BOTTOM=34;
await mkdir(outDir,{recursive:true});
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},screen:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:'de-DE'});
const page=await context.newPage();
const problems=[];
page.on('console',msg=>{if(['error','warning'].includes(msg.type()))problems.push(`${msg.type()}: ${msg.text()}`);});
page.on('pageerror',error=>problems.push(`pageerror: ${error.message}`));
const assert=(value,message)=>{if(!value)throw new Error(message);};
const shot=name=>page.screenshot({path:`${outDir}/${name}.png`,fullPage:false});
const box=async locator=>{const value=await locator.boundingBox();assert(value,`missing geometry for ${locator}`);return value;};
const assertAboveNav=async(locator,label,clearance=3)=>{const [item,nav]=await Promise.all([box(locator),box(page.locator('.main-nav'))]);assert(item.y+item.height<=nav.y-clearance,`${label} overlaps dock: item=${JSON.stringify(item)} nav=${JSON.stringify(nav)}`);};
const assertVerticalOrder=async(locators,label)=>{for(let i=1;i<locators.length;i++){const [a,b]=await Promise.all([box(locators[i-1]),box(locators[i])]);assert(a.y+a.height<=b.y+1,`${label}: ${i-1} overlaps ${i}: ${JSON.stringify({a,b})}`);}};
const assertNoDocumentScroll=async label=>{const m=await page.evaluate(()=>({scroll:document.documentElement.scrollHeight,inner:innerHeight,visual:window.visualViewport?.height||innerHeight}));assert(m.scroll<=m.inner+1,`${label}: document scrolls ${JSON.stringify(m)}`);};
const assertDirectRows=async(view,expected,label)=>{
  const rows=await view.evaluate(node=>Array.from(node.children).map(child=>{const r=child.getBoundingClientRect();return {className:child.className,top:r.top,bottom:r.bottom,height:r.height};}));
  assert(rows.length===expected.length,`${label}: expected ${expected.length} direct rows, got ${JSON.stringify(rows)}`);
  expected.forEach((name,index)=>assert(String(rows[index].className).includes(name),`${label}: row ${index} expected ${name}, got ${JSON.stringify(rows[index])}`));
  const visible=rows.filter(row=>row.height>.5);
  for(let index=1;index<visible.length;index++)assert(visible[index-1].bottom<=visible[index].top+1,`${label}: visible rows overlap ${JSON.stringify({previous:visible[index-1],current:visible[index]})}`);
  return rows;
};
const applyInstalledInsets=async()=>{await page.evaluate(({top,bottom})=>{document.documentElement.style.setProperty('--poply-safe-top',`${top}px`);document.documentElement.style.setProperty('--poply-safe-bottom',`${bottom}px`);},{top:SAFE_TOP,bottom:SAFE_BOTTOM});await page.waitForTimeout(100);};
const seed=async()=>{
  await page.evaluate(async()=>{
    const game=await import('./src/v2-game.js');
    const state=game.createInitialState();
    state.placeUpgrades=['lights','counter','menu','seating'];
    state.stars=10;
    state.stats=state.stats||{};
    state.stats.orders=3;
    state.serviceCallState={nextAt:3,orderId:null,mode:null,generatorProgress:0,callsCompleted:0,callsExpired:0};
    localStorage.setItem('poply-v2-state-1',JSON.stringify(state));
    localStorage.setItem('poply-v2-state-1-backup',JSON.stringify(state));
  });
  await page.reload({waitUntil:'networkidle'});await applyInstalledInsets();
};
const go=async view=>{await page.locator(`.nav-tab[data-view="${view}"]`).click();await page.waitForSelector(`.view-${view}`);await page.waitForTimeout(160);};

const inspectPlace=async height=>{
  await go('place');
  const hero=page.locator('.view-place .world-hero'),command=page.locator('.view-place .place-command'),goal=page.locator('.view-place .place-current-goal'),journey=page.locator('.view-place .journey-wrap');
  const text=(await goal.textContent())?.replace(/\s+/g,' ')||'';
  assert(text.includes('Meerterrasse')&&text.includes('10/11')&&text.includes('Noch 1 Stern'),`Place ${height}: exact Meerterrasse 10/11 state missing: ${text}`);
  assert((await goal.locator('[data-place-v4-orders]').count())===1,`Place ${height}: active star route missing`);
  assert((await hero.locator('.purpose-blueprint-tag').count())===0,`Place ${height}: duplicate next-upgrade scene badge still exists`);
  await assertVerticalOrder([hero,command],`Place ${height}`);
  await assertAboveNav(journey,`Place progress ${height}`,6);
  await assertAboveNav(goal,`Place action tray ${height}`,6);
  await assertNoDocumentScroll(`Place ${height}`);
  await shot(`200-hierarchy-place-10of11-390x${height}`);
};

const inspectOrdersReady=async height=>{
  await go('orders');
  const view=page.locator('.view-orders'),queue=view.locator(':scope > .customer-queue'),choice=view.locator(':scope > .service-call-choice-panel.is-ready'),card=view.locator(':scope > .service-card'),deliver=card.locator(':scope > .service-deliver');
  await choice.waitFor();
  assert((await view.locator(':scope > .service-call-strip').count())===0,`Orders ready ${height}: duplicate top Service-Ruf strip still exists`);
  assert(await view.evaluate(node=>node.classList.contains('has-service-call-ready')),`Orders ready ${height}: ready row class missing`);
  assert(await view.evaluate(node=>node.classList.contains('has-daily-ribbon')),`Orders ready ${height}: Daily row missing in combined state`);
  assert((await card.locator(':scope > .service-call-panel').count())===0,`Orders ready ${height}: ready Ruf panel is still nested inside service card`);
  await assertDirectRows(view,['service-hero','daily-ribbon','customer-queue','service-call-choice-panel','service-card','service-footnote'],`Orders ready ${height}`);
  await assertVerticalOrder([queue,choice,card],`Orders ready hierarchy ${height}`);
  const [choiceBox,cardBox,deliverBox]=await Promise.all([box(choice),box(card),box(deliver)]);
  assert(choiceBox.y+choiceBox.height<=cardBox.y+1,`Orders ready ${height}: Ruf choice overlaps underlying order card ${JSON.stringify({choiceBox,cardBox})}`);
  assert(deliverBox.y>=cardBox.y&&deliverBox.y+deliverBox.height<=cardBox.y+cardBox.height+1,`Orders ready ${height}: delivery action escapes its own card ${JSON.stringify({cardBox,deliverBox})}`);
  assert((await deliver.evaluate(node=>getComputedStyle(node).display))!=='none',`Orders ready ${height}: optional Ruf incorrectly hides normal delivery`);
  await assertAboveNav(deliver,`Orders ready delivery ${height}`,6);
  await assertNoDocumentScroll(`Orders ready ${height}`);
  await shot(`201-hierarchy-orders-ruf-ready-390x${height}`);
};

const activateDirect=async height=>{
  const selected=page.locator('.view-orders .service-card[data-service-order]');
  const orderId=await selected.getAttribute('data-service-order');
  const orderTitle=((await selected.locator('.service-heading h2').textContent())||'').trim();
  const direct=page.locator(`.service-call-choice-panel [data-service-call-mode="direct"][data-service-call-order="${orderId}"]`);
  await direct.click();
  await page.waitForSelector('.view-orders.has-service-call-active');await page.waitForTimeout(180);
  return {orderId,orderTitle};
};

const inspectOrdersActive=async(height,target)=>{
  const view=page.locator('.view-orders'),hero=view.locator(':scope > .service-hero'),card=view.locator(`.service-card[data-service-order="${target.orderId}"]`),panel=card.locator(':scope > .service-call-panel.is-active'),deliver=card.locator(':scope > .service-deliver');
  await panel.waitFor();
  assert((await view.locator(':scope > .service-call-strip').count())===0,`Orders active ${height}: duplicate top Service-Ruf strip exists`);
  assert((await view.locator(':scope > .service-call-choice-panel').count())===0,`Orders active ${height}: ready choice row survived activation`);
  const heroText=((await hero.textContent())||'').replace(/\s+/g,' ');
  assert(!heroText.includes('Wähle deinen nächsten Auftrag'),`Orders active ${height}: stale choose-order hero survived: ${heroText}`);
  assert(heroText.includes(target.orderTitle),`Orders active ${height}: hero does not name committed guest ${target.orderTitle}: ${heroText}`);
  assert((await card.locator(':scope > .service-call-panel').count())===1,`Orders active ${height}: expected one compact active Ruf panel`);
  const panelText=((await panel.textContent())||'').replace(/\s+/g,' ');
  assert(panelText.includes('Als Nächstes servieren'),`Orders active ${height}: compact direct instruction missing: ${panelText}`);
  await assertAboveNav(deliver,`Orders active delivery ${height}`,6);
  await assertNoDocumentScroll(`Orders active ${height}`);
  await shot(`202-hierarchy-orders-ruf-direct-390x${height}`);
};

const inspectBoardActive=async(height,target)=>{
  await go('board');
  const view=page.locator('.view-board'),strip=view.locator(':scope > .service-call-strip.is-active'),mission=view.locator(':scope > .mission-card'),jobs=view.locator(':scope > .board-jobs'),area=view.locator(':scope > .board-area'),frame=area.locator('.board-frame');
  await strip.waitFor();await page.waitForTimeout(120);
  assert(await view.evaluate(node=>node.classList.contains('has-service-call-strip')),`Board active ${height}: Ruf row class missing`);
  assert((await view.locator(`.board-job[data-focus-order="${target.orderId}"].service-call-active`).count())===1,`Board active ${height}: focused Ruf guest is not marked`);
  await assertVerticalOrder([strip,mission,jobs,area],`Board active view ${height}`);
  const [areaBox,frameBox]=await Promise.all([box(area),box(frame)]);
  assert(frameBox.y>=areaBox.y-1&&frameBox.y+frameBox.height<=areaBox.y+areaBox.height+1,`Board active ${height}: square escapes remaining board area ${JSON.stringify({areaBox,frameBox})}`);
  assert(Math.abs(frameBox.width-frameBox.height)<=2,`Board active ${height}: workbench is no longer square ${JSON.stringify(frameBox)}`);
  assert(frameBox.height>=Math.min(330,height*.43),`Board active ${height}: meta chrome pushes workbench too small ${JSON.stringify(frameBox)}`);
  const measured=await frame.evaluate(node=>node.style.getPropertyValue('--board-square'));
  assert(/^\d+px$/.test(measured),`Board active ${height}: available-area square was not measured: ${measured}`);
  await assertAboveNav(frame,`Board active workbench ${height}`,6);
  await assertNoDocumentScroll(`Board active ${height}`);
  await shot(`203-hierarchy-board-ruf-direct-390x${height}`);
};

let report={},failure=null;
try{
  await page.goto(baseURL,{waitUntil:'networkidle'});
  for(const height of [844,720]){
    await page.setViewportSize({width:390,height});
    await seed();
    await inspectPlace(height);
    await inspectOrdersReady(height);
    const target=await activateDirect(height);
    await inspectOrdersActive(height,target);
    await inspectBoardActive(height,target);
  }
  report={viewports:['390x844','390x720'],safeInsets:{top:SAFE_TOP,bottom:SAFE_BOTTOM},screenshots:8,place:'single Meerterrasse 10/11 objective above dock',orders:'ready choice is direct row with no delivery ghost; active Direct has contextual hero and one compact card status',board:'one compact Ruf row + focused guest + measured square workbench'};
  if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){failure=error;try{await shot('204-hierarchy-failure');}catch{}}
finally{await writeFile(`${outDir}/mobile-layout-stability-report.json`,JSON.stringify({report,problems,failure:failure?.message||null},null,2));await browser.close();}
if(failure)throw failure;
console.log('Mobile real-device hierarchy WebKit QA passed.');