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
const assertNoScroll=async label=>{const m=await page.evaluate(()=>({scroll:document.documentElement.scrollHeight,inner:innerHeight,visual:window.visualViewport?.height||innerHeight}));assert(m.scroll<=m.inner+1,`${label}: document scrolls ${JSON.stringify(m)}`);};
const assertWithin=async(locator,label)=>{const box=await locator.boundingBox(),height=await page.evaluate(()=>window.visualViewport?.height||innerHeight);assert(box&&box.y>=-1&&box.y+box.height<=height+1,`${label} outside viewport ${JSON.stringify(box)}`);};
const clearSave=()=>page.evaluate(()=>{localStorage.removeItem('poply-v2-state-1');localStorage.removeItem('poply-v2-state-1-backup');});
const reload=async()=>{await page.reload({waitUntil:'networkidle'});await page.waitForSelector('.game-view');};
const view=async name=>{await page.locator(`.nav-tab[data-view="${name}"]`).tap();await page.waitForSelector(`.view-${name}`);};
const seed=async mode=>{
  await page.evaluate(async mode=>{
    const game=await import('./src/v2-game.js'),specials=await import('./src/aaa-specials.js');
    let state=game.createInitialState();
    if(mode==='preview'){state.stars=0;}
    if(mode==='build'){state.stars=4;}
    if(mode==='lights'){
      state.placeUpgrades=['lights'];
      state.currentOrders=[game.createOpeningOrder(1),game.createOpeningOrder(0),game.createOpeningOrder(2)];
      state=specials.ensureServiceSpecials(state).state;
      state.currentOrders[0].special={...state.currentOrders[0].special,progress:state.currentOrders[0].special.target,completed:true};
      state.board[30]=game.makeItem('bakery',2,'qa-bakery-2');state.board[31]=game.makeItem('coffee',2,'qa-coffee-2');
    }
    if(mode==='counter'){
      state.placeUpgrades=['lights','counter'];
      state.currentOrders=[game.createOpeningOrder(0),game.createOpeningOrder(1),game.createOpeningOrder(2)];
      state=specials.ensureServiceSpecials(state).state;state.board[30]=game.makeItem('coffee',2,'qa-ready-coffee');
    }
    if(mode==='menu'){
      state.placeUpgrades=['lights','counter','menu'];state=specials.ensureServiceSpecials(state).state;
    }
    localStorage.setItem('poply-v2-state-1',JSON.stringify(state));localStorage.removeItem('poply-v2-state-1-backup');
  },mode);
  await reload();
};

let report={},failure=null;
try{
  await page.goto(baseURL,{waitUntil:'networkidle'});await clearSave();await reload();

  await seed('preview');await view('place');
  const preview=(await page.locator('.purpose-place-unlock').textContent())||'';
  assert(preview.includes('Kombi-Aufträge'),`legacy Lichter unlock copy disappeared: ${preview}`);
  assert(preview.includes('Abendservice')&&preview.includes('+1 FLOW'),`mechanical Lichter preview missing: ${preview}`);
  await assertWithin(page.locator('.purpose-place-unlock'),'Lichter power preview 390x844');await assertNoScroll('Lichter preview 390x844');await shot('100-place-power-preview-lights-390x844');

  await seed('build');await view('place');await page.locator('.place-current-goal [data-action="build"]').tap();
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('poply-v2-state-1')||'{}').placeUpgrades?.includes('lights'));
  await page.waitForFunction(()=>document.querySelector('#toast')?.textContent?.includes('Neue Fähigkeit: Abendservice'));
  assert(((await page.locator('.purpose-place-unlock').textContent())||'').includes('Vorbereitung'),'next upgrade does not preview Theke power');
  await assertNoScroll('post-build Lichter 390x844');await shot('101-place-power-unlocked-lights-390x844');

  await seed('lights');await view('orders');
  assert(await page.locator('.service-deliver').isEnabled(),'completed Special order should be deliverable');await page.locator('.service-deliver').tap();
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('poply-v2-state-1')||'{}').mergeFlow?.charge===1);
  await view('board');
  assert(((await page.locator('.flow-hud').textContent())||'').includes('1/3'),'Abendservice did not visibly charge Flow');await assertNoScroll('Abendservice effect 390x844');await shot('102-place-power-abendservice-flow-390x844');

  await seed('counter');await view('orders');await page.locator('.service-deliver').tap();
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('poply-v2-state-1')||'{}').placePowerState?.prepReady===true);await view('board');
  assert(await page.locator('.prep-generator-badge').count()===2,'Vorbereitung did not mark both opening generator choices');
  assert(((await page.locator('.place-prep-hud').textContent())||'').includes('THEKE'),'Vorbereitung HUD missing');
  await assertNoScroll('Vorbereitung ready 390x844');await shot('103-place-power-preparation-ready-390x844');
  await page.locator('.board-cell.generator[data-index="0"]').tap();
  await page.waitForFunction(()=>{const s=JSON.parse(localStorage.getItem('poply-v2-state-1')||'{}');return s.stats?.generated===1&&s.placePowerState?.prepReady===false&&s.placePowerState?.prepsUsed===1;});
  const prepared=await readSave(),preparedDrop=prepared.board.find(item=>item?.id==='coffee-21');
  assert(preparedDrop?.level===2,`Vorbereitung did not create tier-2 coffee ${JSON.stringify(preparedDrop)}`);
  await page.waitForTimeout(500);await assertNoScroll('Vorbereitung used 390x844');await shot('104-place-power-preparation-used-390x844');

  await seed('menu');await view('orders');
  const beforeMenu=await readSave(),beforeSelected=beforeMenu.currentOrders[0];
  assert(await page.locator('.place-power-reroll').isVisible(),'Gastwahl button missing when charge is ready');await assertWithin(page.locator('.place-power-reroll'),'Gastwahl button 390x844');await assertNoScroll('Gastwahl ready 390x844');await shot('105-place-power-gastwahl-ready-390x844');
  await page.locator('.place-power-reroll').tap();
  await page.waitForFunction(()=>{const s=JSON.parse(localStorage.getItem('poply-v2-state-1')||'{}');return s.placePowerState?.rerollsUsed===1&&s.placePowerState?.menuChoiceReady===false;});
  const afterMenu=await readSave();assert(afterMenu.currentOrders.length===3,'Gastwahl changed queue size');assert(afterMenu.currentOrders.some(order=>!beforeMenu.currentOrders.some(before=>before.id===order.id)),'Gastwahl did not create a new deterministic order');assert(!afterMenu.currentOrders.some(order=>order.id===beforeSelected.id),'Gastwahl left replaced order in queue');
  assert(await page.locator('.place-power-reroll').count()===0,'Gastwahl button remained after consuming charge');await assertNoScroll('Gastwahl consumed 390x844');await shot('106-place-power-gastwahl-swapped-390x844');

  await page.setViewportSize({width:390,height:720});
  await seed('preview');await view('place');assert(((await page.locator('.purpose-place-unlock').textContent())||'').includes('Abendservice'),'390x720 lost Place power preview');await assertNoScroll('Lichter preview 390x720');await shot('107-place-power-preview-lights-390x720');
  await seed('counter');await view('orders');await page.locator('.service-deliver').tap();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('poply-v2-state-1')||'{}').placePowerState?.prepReady===true);await view('board');assert(await page.locator('.prep-generator-badge').count()===2,'390x720 lost Preparation choices');await assertNoScroll('Vorbereitung 390x720');await shot('108-place-power-preparation-ready-390x720');
  await seed('menu');await view('orders');assert(await page.locator('.place-power-reroll').isVisible(),'390x720 lost Gastwahl action');await assertWithin(page.locator('.place-power-reroll'),'Gastwahl button 390x720');await assertNoScroll('Gastwahl 390x720');await shot('109-place-power-gastwahl-ready-390x720');

  report={lights:{flowCharge:1},counter:{preparedDropLevel:preparedDrop.level},menu:{rerollsUsed:afterMenu.placePowerState.rerollsUsed},shortViewportNoScroll:true};
  if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){failure=error;try{await shot('109-place-power-failure');}catch{}}
finally{await writeFile(`${outDir}/place-powers-report.json`,JSON.stringify({report,problems,failure:failure?.message||null},null,2));await browser.close();}
if(failure)throw failure;
console.log('Cafe Place Powers WebKit QA passed.');
