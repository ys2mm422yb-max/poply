import { webkit } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const baseURL=process.env.QA_BASE_URL||'http://127.0.0.1:4173';
const outDir=process.env.QA_OUT_DIR||'qa-artifacts';
const SAFE_TOP=47,SAFE_BOTTOM=34;
await mkdir(outDir,{recursive:true});
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},screen:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:'de-DE'});
const page=await context.newPage();
const problems=[];page.on('console',msg=>{if(['error','warning'].includes(msg.type()))problems.push(`${msg.type()}: ${msg.text()}`);});page.on('pageerror',error=>problems.push(`pageerror: ${error.message}`));
const assert=(value,message)=>{if(!value)throw new Error(message);};
const shot=name=>page.screenshot({path:`${outDir}/${name}.png`,fullPage:false});
const applyInsets=()=>page.evaluate(({top,bottom})=>{document.documentElement.style.setProperty('--poply-safe-top',`${top}px`);document.documentElement.style.setProperty('--poply-safe-bottom',`${bottom}px`);},{top:SAFE_TOP,bottom:SAFE_BOTTOM});
const go=async view=>{await page.locator(`.nav-tab[data-view="${view}"]`).click();await page.waitForSelector(`.view-${view}`);await page.waitForTimeout(140);};
const aboveDock=async(locator,label)=>{const [box,nav]=await Promise.all([locator.boundingBox(),page.locator('.main-nav').boundingBox()]);assert(box&&nav,`${label}: geometry missing`);assert(box.y+box.height<=nav.y-3,`${label}: overlaps dock ${JSON.stringify({box,nav})}`);};

const seed=async()=>{
  await page.evaluate(async()=>{
    const game=await import('./src/v2-game.js');
    const state=game.createInitialState();
    state.placeUpgrades=['lights','counter','menu','seating'];state.stars=10;
    const order=state.currentOrders[0];order.title='Eiskaffee-Date';order.requirements=[{family:'coffee',level:3,qty:1},{family:'bakery',level:2,qty:1}];order.rewards={coins:85,stars:3};order.sequence=1;
    state.board=state.board.map(item=>item?.kind==='generator'?item:null);
    const empty=[];state.board.forEach((item,index)=>{if(item===null)empty.push(index);});
    state.board[empty[0]]=game.makeItem('coffee',3,'guide-coffee-a');
    state.board[empty[1]]=game.makeItem('coffee',3,'guide-coffee-b');
    state.discoveries=['item:coffee:1','item:coffee:2','item:coffee:3','item:bakery:1','item:bakery:2','item:sweet:1','item:sweet:2','place:coast','generator:coffee-gen','generator:pantry-gen'];
    localStorage.setItem('poply-v2-state-1',JSON.stringify(state));localStorage.setItem('poply-v2-state-1-backup',JSON.stringify(state));
  });
  await page.reload({waitUntil:'networkidle'});await applyInsets();await page.waitForTimeout(180);
};

let report={},failure=null;
try{
  await page.goto(baseURL,{waitUntil:'networkidle'});
  for(const height of [844,720]){
    await page.setViewportSize({width:390,height});await seed();await go('orders');
    const card=page.locator('.service-card[data-service-order]').first();await card.waitFor({state:'visible'});
    const dynamics=card.locator('.guest-dynamic-line');await dynamics.waitFor({state:'visible'});const dynamicText=((await dynamics.textContent())||'').replace(/\s+/g,' ');assert(dynamicText.includes('Nora')&&dynamicText.includes('Heute:'),`guest dynamics missing at ${height}: ${dynamicText}`);
    const needs=card.locator('.service-needs .need');assert(await needs.count()>=2,`needs missing at ${height}`);
    const flour=needs.nth(1);assert(((await flour.getAttribute('aria-label'))||'').includes('Mehl'),`Mehl need is not self-explanatory at ${height}`);
    await flour.click();await page.waitForSelector('.production-guide-sheet');
    const guideText=((await page.locator('.production-guide-sheet').textContent())||'').replace(/\s+/g,' ');assert(guideText.includes('Mehl')&&guideText.includes('Vorratskiste')&&guideText.includes('Weizen'),`production guide incomplete at ${height}: ${guideText}`);
    await shot(`300-item-guide-mehl-390x${height}`);
    await page.locator('[data-guide-show-board="pantry-gen"]').click();await page.waitForSelector('.view-board');await page.waitForTimeout(180);
    const focused=page.locator('.board-cell.generator-pantry-gen.generator-guide-focus');await focused.waitFor({state:'visible'});await aboveDock(focused,`focused pantry ${height}`);await shot(`301-generator-focus-pantry-390x${height}`);
    const info=focused.locator('[data-generator-info="pantry-gen"]');await info.click();await page.waitForSelector('.production-guide-sheet.generator-sheet');
    const generatorText=((await page.locator('.generator-sheet').textContent())||'').replace(/\s+/g,' ');assert(generatorText.includes('Vorratskiste')&&generatorText.includes('Backwaren')&&generatorText.includes('Süßes')&&generatorText.includes('Eiskaffee-Date'),`generator inspector incomplete at ${height}: ${generatorText}`);await shot(`302-generator-inspector-pantry-390x${height}`);
    await page.locator('[data-guide-close]').last().click();await go('place');
    const scene=page.locator('.place-scene-svg');await scene.waitFor({state:'visible'});assert(await scene.locator('.place-life-guests-v2').count()===1,`living guest layer missing at ${height}`);assert(await scene.locator('.place-life-person').count()===2,`expected two primary seated guests at ${height}`);
    const oldVisible=await scene.locator('.cafe-guest').evaluateAll(nodes=>nodes.some(node=>getComputedStyle(node).display!=='none'));assert(!oldVisible,`old stiff guests still visible at ${height}`);await shot(`303-place-living-guests-390x${height}`);
  }
  report={viewports:['390x844','390x720'],safeInsets:{top:SAFE_TOP,bottom:SAFE_BOTTOM},screenshots:8,states:['Mehl provenance sheet','Vorratskiste Board focus','generator inspector','living Place guests'],guestDynamics:true};
  if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){failure=error;try{await shot('309-item-guidance-place-life-failure');}catch{}}
finally{await writeFile(`${outDir}/item-guidance-place-life-report.json`,JSON.stringify({report,problems,failure:failure?.message||null},null,2));await browser.close();}
if(failure)throw failure;
console.log('Item guidance + living Place WebKit QA passed.');
