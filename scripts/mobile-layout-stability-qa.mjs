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
const applyInstalledInsets=async()=>{await page.evaluate(({top,bottom})=>{document.documentElement.style.setProperty('--poply-safe-top',`${top}px`);document.documentElement.style.setProperty('--poply-safe-bottom',`${bottom}px`);},{top:SAFE_TOP,bottom:SAFE_BOTTOM});await page.waitForTimeout(80);};
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
const go=async view=>{await page.locator(`.nav-tab[data-view="${view}"]`).click();await page.waitForSelector(`.view-${view}`);await page.waitForTimeout(100);};

const inspectPlace=async height=>{
  await go('place');
  const hero=page.locator('.view-place .world-hero'),command=page.locator('.view-place .place-command'),goal=page.locator('.view-place .place-current-goal'),journey=page.locator('.view-place .journey-wrap');
  const text=(await goal.textContent())?.replace(/\s+/g,' ')||'';
  assert(text.includes('Meerterrasse')&&text.includes('10/11')&&text.includes('Noch 1 Stern'),`Place ${height}: exact Meerterrasse 10/11 state missing: ${text}`);
  assert((await goal.locator('[data-place-v4-orders]').count())===1,`Place ${height}: active star route missing`);
  await assertVerticalOrder([hero,command],`Place ${height}`);
  await assertAboveNav(journey,`Place progress ${height}`,6);
  await assertAboveNav(goal,`Place action tray ${height}`,6);
  await assertNoDocumentScroll(`Place ${height}`);
  await shot(`200-layout-place-10of11-390x${height}`);
};
const inspectOrders=async height=>{
  await go('orders');
  const view=page.locator('.view-orders'),strip=view.locator(':scope > .service-call-strip.is-ready'),hero=view.locator(':scope > .service-hero'),queue=view.locator(':scope > .customer-queue'),card=view.locator(':scope > .service-card'),footer=view.locator(':scope > .service-footnote');
  const panel=card.locator(':scope > .service-call-panel.is-ready'),content=card.locator(':scope > .service-content'),deliver=card.locator(':scope > .service-deliver');
  await strip.waitFor();await panel.waitFor();
  assert(await view.evaluate(node=>node.classList.contains('has-service-call-strip')),`Orders ${height}: dynamic strip row class missing`);
  assert(await card.evaluate(node=>node.classList.contains('has-service-call')),`Orders ${height}: focus card class missing`);
  assert(await card.locator(':scope > .service-call-panel').count()===1,`Orders ${height}: Service-Ruf panel is not a direct card layout row`);
  await assertVerticalOrder([strip,hero,queue,card,footer],`Orders view ${height}`);
  const [contentBox,panelBox,deliverBox]=await Promise.all([box(content),box(panel),box(deliver)]);
  assert(contentBox.y+contentBox.height<=panelBox.y+1,`Orders ${height}: underlying order content overlaps Service-Ruf panel ${JSON.stringify({contentBox,panelBox})}`);
  assert(panelBox.y+panelBox.height<=deliverBox.y+1,`Orders ${height}: Service-Ruf panel overlaps delivery CTA ${JSON.stringify({panelBox,deliverBox})}`);
  await assertAboveNav(deliver,`Orders delivery ${height}`,6);
  await assertNoDocumentScroll(`Orders ${height}`);
  await shot(`201-layout-orders-service-call-390x${height}`);
};
const inspectBoard=async height=>{
  await go('board');
  const view=page.locator('.view-board'),strip=view.locator(':scope > .service-call-strip.is-ready'),mission=view.locator(':scope > .mission-card'),jobs=view.locator(':scope > .board-jobs'),area=view.locator(':scope > .board-area'),frame=area.locator('.board-frame');
  await strip.waitFor();
  assert(await view.evaluate(node=>node.classList.contains('has-service-call-strip')),`Board ${height}: dynamic strip row class missing`);
  await assertVerticalOrder([strip,mission,jobs,area],`Board view ${height}`);
  const [areaBox,frameBox]=await Promise.all([box(area),box(frame)]);
  assert(frameBox.y>=areaBox.y-1&&frameBox.y+frameBox.height<=areaBox.y+areaBox.height+1,`Board ${height}: square escapes remaining board area ${JSON.stringify({areaBox,frameBox})}`);
  assert(Math.abs(frameBox.width-frameBox.height)<=2,`Board ${height}: workbench is no longer square ${JSON.stringify(frameBox)}`);
  await assertAboveNav(frame,`Board workbench ${height}`,6);
  await assertNoDocumentScroll(`Board ${height}`);
  await shot(`202-layout-board-390x${height}`);
};

let report={},failure=null;
try{
  await page.goto(baseURL,{waitUntil:'networkidle'});
  for(const height of [844,720]){
    await page.setViewportSize({width:390,height});
    await seed();
    await inspectPlace(height);
    await inspectOrders(height);
    await inspectBoard(height);
  }
  report={viewports:['390x844','390x720'],safeInsets:{top:SAFE_TOP,bottom:SAFE_BOTTOM},screenshots:6,place:'Meerterrasse 10/11 above dock',orders:'Service-Ruf direct layout row without overlap',board:'dynamic strip row and remaining-area square'};
  if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){failure=error;try{await shot('203-layout-stability-failure');}catch{}}
finally{await writeFile(`${outDir}/mobile-layout-stability-report.json`,JSON.stringify({report,problems,failure:failure?.message||null},null,2));await browser.close();}
if(failure)throw failure;
console.log('Mobile layout stability WebKit QA passed.');
