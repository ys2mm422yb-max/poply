import { webkit } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const baseURL=process.env.QA_BASE_URL||'http://127.0.0.1:4173';
const outDir=process.env.QA_OUT_DIR||'qa-artifacts';
const SAFE_TOP=47,SAFE_BOTTOM=34,SOURCE_INDEX=9;
await mkdir(outDir,{recursive:true});
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},screen:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:'de-DE'});
const page=await context.newPage();
const problems=[];page.on('console',message=>{if(['error','warning'].includes(message.type()))problems.push(`${message.type()}: ${message.text()}`);});page.on('pageerror',error=>problems.push(`pageerror: ${error.message}`));
const assert=(value,message)=>{if(!value)throw new Error(message);};
const shot=name=>page.screenshot({path:`${outDir}/${name}.png`,fullPage:false});
const applyInsets=()=>page.evaluate(({top,bottom})=>{document.documentElement.style.setProperty('--poply-safe-top',`${top}px`);document.documentElement.style.setProperty('--poply-safe-bottom',`${bottom}px`);},{top:SAFE_TOP,bottom:SAFE_BOTTOM});
const assertNoScroll=async label=>{const m=await page.evaluate(()=>({scroll:document.documentElement.scrollHeight,inner:innerHeight,visual:window.visualViewport?.height||innerHeight}));assert(m.scroll<=m.inner+1,`${label}: document scrolls ${JSON.stringify(m)}`);};
const assertAboveDock=async(locator,label)=>{const boxes=await Promise.all([locator.boundingBox(),page.locator('.main-nav').boundingBox()]),box=boxes[0],dock=boxes[1];assert(box&&dock&&box.y+box.height<=dock.y+1,`${label}: overlaps dock ${JSON.stringify({box,dock})}`);};

const seed=async()=>{
  await page.evaluate(async({sourceIndex})=>{
    const game=await import('./src/v2-game.js');
    const collection=await import('./src/aaa-collection.js');
    let state=game.createInitialState();
    state.board[sourceIndex]={kind:'item',family:'coffee',level:2};
    state.discoveries=[
      collection.discoveryItemKey('coffee',1),collection.discoveryItemKey('coffee',2),
      collection.discoveryItemKey('bakery',1),collection.discoveryItemKey('bakery',2),
      collection.discoveryItemKey('sweet',1),collection.discoveryItemKey('sweet',2),
    ];
    state.boardTradeState={serviceProgress:3,ready:true,uses:0};
    localStorage.setItem('poply-v2-state-1',JSON.stringify(state));localStorage.setItem('poply-v2-state-1-backup',JSON.stringify(state));
  },{sourceIndex:SOURCE_INDEX});
  await page.reload({waitUntil:'networkidle'});await applyInsets();await page.waitForSelector('.view-board .board-trade-ready-action');await page.waitForTimeout(140);
};

let report={},failure=null;
try{
  await page.goto(baseURL,{waitUntil:'networkidle'});
  for(const height of [844,720]){
    await page.setViewportSize({width:390,height});await seed();
    const board=page.locator('.board-frame'),ready=page.locator('.board-trade-ready-action');
    assert(await ready.textContent()==='↔ TAUSCH',`ready action missing at ${height}`);await assertAboveDock(board,`Board ${height}`);await assertNoScroll(`trade ready ${height}`);
    await ready.tap();await page.waitForSelector('.board-trade-active .board-trade-source');
    const sources=page.locator('.board-trade-source');assert(await sources.count()>=1,`no legal source at ${height}`);
    assert(await page.locator(`.board-cell[data-index="${SOURCE_INDEX}"]`).evaluate(node=>node.classList.contains('board-trade-source')),`seed source not highlighted at ${height}`);
    assert(!await page.locator('.board-cell.generator.board-trade-source').count(),`generator became trade source at ${height}`);
    await shot(`320-board-trade-source-390x${height}`);

    await page.locator(`.board-cell[data-index="${SOURCE_INDEX}"]`).tap();await page.waitForSelector('.board-trade-sheet');
    const sheet=page.locator('.board-trade-sheet'),copy=((await sheet.textContent())||'').replace(/\s+/g,' ');
    assert(copy.includes('Kaffeetasse')&&copy.includes('Mehl')&&copy.includes('Zucker'),`target sheet incomplete at ${height}: ${copy}`);
    assert(!copy.includes('Fruchtmix'),`undiscovered target leaked into sheet at ${height}`);
    await assertAboveDock(sheet,`trade sheet ${height}`);await assertNoScroll(`trade sheet ${height}`);await shot(`321-board-trade-targets-390x${height}`);

    await sheet.locator('[data-board-trade-family="bakery"]').tap();await page.waitForSelector('.view-board .board-frame');await page.waitForTimeout(120);
    const saved=await page.evaluate(({sourceIndex})=>{const state=JSON.parse(localStorage.getItem('poply-v2-state-1')||'null');return {item:state?.board?.[sourceIndex],trade:state?.boardTradeState,coins:state?.coins,stars:state?.stars,energy:state?.energy};},{sourceIndex:SOURCE_INDEX});
    assert(saved.item?.family==='bakery'&&saved.item?.level===2,`real trade did not preserve tier at ${height}: ${JSON.stringify(saved)}`);
    assert(saved.trade?.ready===false&&saved.trade?.serviceProgress===0&&saved.trade?.uses===1,`trade charge not consumed at ${height}: ${JSON.stringify(saved.trade)}`);
    assert(!await page.locator('.board-trade-ready-action').count(),`ready action survived consumed trade at ${height}`);
    await assertNoScroll(`trade complete ${height}`);await shot(`322-board-trade-complete-390x${height}`);

    await page.reload({waitUntil:'networkidle'});await applyInsets();await page.waitForSelector('.view-board');
    const persisted=await page.evaluate(({sourceIndex})=>{const state=JSON.parse(localStorage.getItem('poply-v2-state-1')||'null');return {item:state?.board?.[sourceIndex],trade:state?.boardTradeState};},{sourceIndex:SOURCE_INDEX});
    assert(persisted.item?.family==='bakery'&&persisted.item?.level===2&&persisted.trade?.uses===1&&!persisted.trade?.ready,`trade did not survive reload at ${height}: ${JSON.stringify(persisted)}`);
  }
  report={viewports:['390x844','390x720'],safeInsets:{top:SAFE_TOP,bottom:SAFE_BOTTOM},screenshots:6,sourceIndex:SOURCE_INDEX,sameTierSwap:true,discoveryGate:true,persistedAfterReload:true,noDocumentScroll:true};
  if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){failure=error;try{await shot('329-board-trade-failure');}catch{}}
finally{await writeFile(`${outDir}/board-trade-report.json`,JSON.stringify({report,problems,failure:failure?.message||null},null,2));await browser.close();}
if(failure)throw failure;
console.log('Board trade WebKit QA passed.');
