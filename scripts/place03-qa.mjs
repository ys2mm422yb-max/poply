import { webkit } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const baseURL=process.env.QA_BASE_URL||'http://127.0.0.1:4173';
const outDir=process.env.QA_OUT_DIR||'qa-artifacts';
await mkdir(outDir,{recursive:true});
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},screen:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:'de-DE'});
const page=await context.newPage();
const problems=[],badResponses=[],requestFailures=[];
page.on('console',msg=>{if(['error','warning'].includes(msg.type()))problems.push(`${msg.type()}: ${msg.text()}`);});
page.on('pageerror',error=>problems.push(`pageerror: ${error.message}`));
page.on('response',response=>{if(response.status()>=400)badResponses.push({status:response.status(),url:response.url(),resourceType:response.request().resourceType()});});
page.on('requestfailed',request=>requestFailures.push({url:request.url(),resourceType:request.resourceType(),failure:request.failure()?.errorText||'unknown'}));
const assert=(value,message)=>{if(!value)throw new Error(message);};
const shot=name=>page.screenshot({path:`${outDir}/${name}.png`,fullPage:false});
const readSave=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('poply-v2-state-1')||'null'));
const realGreenhouseCount=()=>page.evaluate(()=>[...document.querySelectorAll('.garden-greenhouse-built')].filter(node=>!node.closest('.scene-upgrade-preview')).length);
const assertFits=async label=>{const m=await page.evaluate(()=>{const pick=s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();return {top:b.top,bottom:b.bottom,left:b.left,right:b.right,width:b.width,height:b.height};};return {h:window.visualViewport?.height||innerHeight,inner:innerHeight,scroll:document.documentElement.scrollHeight,app:pick('.app-shell'),view:pick('.game-view'),board:pick('.board-frame'),nav:pick('.main-nav')};});assert(m.app&&m.view&&m.nav,`${label}: shell missing`);assert(m.app.bottom<=m.h+1,`${label}: app clipped ${JSON.stringify(m)}`);assert(m.nav.bottom<=m.h+1,`${label}: nav clipped ${JSON.stringify(m)}`);assert(m.scroll<=m.inner+1,`${label}: document scrolls ${JSON.stringify(m)}`);return m;};
const pointerTap=async locator=>{const box=await locator.boundingBox();assert(box,'pointer tap target has no box');const x=box.x+box.width/2,y=box.y+box.height/2;await page.mouse.move(x,y);await page.mouse.down();await page.waitForTimeout(45);await page.mouse.up();};
let report={},failure=null;

try{
  await page.goto(baseURL,{waitUntil:'networkidle'});
  await page.evaluate(async()=>{
    const game=await import('./src/v2-game.js');
    const state=game.createInitialState();
    state.placeUpgrades=[...game.PLACE_01_UPGRADES.map(u=>u.id),...game.PLACE_02_UPGRADES.map(u=>u.id)];
    state.stars=99;state.coins=900;state.energy=20;
    game.syncProgressionContent(state);
    const gardenIndex=state.board.findIndex(item=>item?.generator==='garden-gen');
    state.board[gardenIndex]={...state.board[gardenIndex],taps:3};
    const empty=state.board.findIndex((slot,index)=>slot===null&&index!==gardenIndex);
    state.board[empty]=game.makeItem('herb',1,'qa-herb-known');
    state.currentOrders=[game.createProgressionOrder(state,40,'garden'),game.createProgressionOrder(state,41,'garden'),game.createProgressionOrder(state,42,'garden')];
    state.orderSequence=43;
    delete state.discoveries;
    localStorage.setItem('poply-v2-state-1',JSON.stringify(state));
  });
  await page.reload({waitUntil:'networkidle'});await page.waitForSelector('.view-board');
  const initial=await readSave();const gardenIndex=initial.board.findIndex(item=>item?.generator==='garden-gen');assert(gardenIndex>=0,'Gewächshaus missing after Sonnenkai completion');
  const gardenCell=page.locator(`.board-cell[data-index="${gardenIndex}"]`);assert(await gardenCell.isVisible(),'Gewächshaus cell not visible');assert((await gardenCell.getAttribute('aria-label'))?.includes('Erntebonus bereit'),'ready harvest bonus is not exposed to player');assert(await gardenCell.locator('.generator-cycle.bonus-ready').count()===1,'visible bonus-ready cycle missing');
  await assertFits('390x844 garden board');await shot('80-place03-board-bonus-ready');

  const beforeEnergy=initial.energy,beforeGenerated=initial.stats.generated;
  await pointerTap(gardenCell);
  await page.waitForFunction(index=>{try{const s=JSON.parse(localStorage.getItem('poply-v2-state-1')||'null');const gen=s?.board?.[index];return gen?.generator==='garden-gen'&&gen.taps===4;}catch{return false;}},gardenIndex,{timeout:1800});
  const afterHarvest=await readSave();const newHerbs=afterHarvest.board.filter(item=>item?.kind==='item'&&item.family==='herb'&&item.id!=='qa-herb-known');assert(newHerbs.some(item=>item.level===2),'fourth Gewächshaus production did not create herb tier 2');
  assert(afterHarvest.energy===beforeEnergy-1,`harvest should cost exactly one energy, got ${beforeEnergy} -> ${afterHarvest.energy}`);assert(afterHarvest.stats.generated===beforeGenerated+1,'harvest did not increment generated exactly once');assert(afterHarvest.board[gardenIndex].taps===4,'harvest cycle did not persist fourth tap');assert(await page.locator(`.board-cell[data-index="${gardenIndex}"] .generator-cycle.bonus-ready`).count()===0,'bonus-ready state did not reset after fourth production');await shot('81-place03-harvest-tier2');

  await page.locator('.nav-tab[data-view="collection"]').click();await page.waitForSelector('.view-collection');await page.locator('[data-collection-family="herb"]').click();assert((await page.locator('.collection-focus h2').textContent())?.includes('Dachgarten'),'herb Collection family did not open');const collectionText=await page.locator('.collection-focus').textContent();assert(collectionText?.includes('Minze'),'known herb tier 1 missing from Collection');assert(collectionText?.includes('Kräuterbund'),'bonus-produced herb tier 2 missing from Collection');await shot('82-place03-collection-herb');

  await page.locator('.nav-tab[data-view="place"]').click();await page.waitForSelector('.view-place.place-garden');assert((await page.locator('.world-copy h1').textContent())==='Dachgarten','Dachgarten Place did not render');assert(await page.locator('.garden-place-svg').count()===1,'authored Dachgarten scene missing');assert(await page.locator('.garden-construction-base').count()===1,'stage zero construction base missing');assert(await realGreenhouseCount()===0,'Gewächshaus must not be actually built at stage zero');assert(await page.locator('.scene-upgrade-preview.garden-glass.garden-greenhouse-built').count()===1,'stage zero must preview the exact authored Gewächshaus build');assert((await page.locator('.place-current-goal').textContent())?.includes('Glasdach'),'first Dachgarten restoration goal missing');await shot('83-place03-place-stage0');
  const beforeBuild=await readSave();await page.locator('[data-action="build"]').click();await page.waitForFunction(()=>{try{return JSON.parse(localStorage.getItem('poply-v2-state-1')||'null')?.placeUpgrades?.includes('garden-glass');}catch{return false;}},null,{timeout:1500});const afterBuild=await readSave();assert(afterBuild.stars===beforeBuild.stars-12,`Glasdach should cost 12 stars, got ${beforeBuild.stars} -> ${afterBuild.stars}`);assert((await page.locator('.world-progress b').textContent())==='1','Dachgarten stage did not advance to 1');assert(await realGreenhouseCount()===1,'Glasdach build did not visibly create exactly one real greenhouse');await page.waitForTimeout(1850);assert(await page.locator('.restoration-reveal').count()===0,'restoration reveal did not clear before stable screenshot');await shot('84-place03-place-stage1');

  await page.locator('[data-action="place-map"]').click();await page.waitForSelector('.place-map-sheet');assert(await page.locator('[data-map-place="garden"]').isEnabled(),'Dachgarten map node not enabled');assert((await page.locator('[data-map-place="garden"] small').textContent())?.includes('1/6'),'Dachgarten map progress did not reflect build');await page.locator('[data-map-place="garden"]').click();assert((await page.locator('.place-map-preview h3').textContent())==='Dachgarten','Dachgarten map preview missing');await shot('85-place03-map');await page.locator('[data-place-map-close]').last().click();

  await page.setViewportSize({width:390,height:720});await page.waitForTimeout(120);await page.locator('.nav-tab[data-view="board"]').click();await page.waitForSelector('.view-board');const short=await assertFits('390x720 garden board');assert(short.board?.width===376&&short.board?.height===376,`short Safari changed 7x7 Board geometry ${JSON.stringify(short.board)}`);await shot('86-place03-short-safari');
  const final=await readSave();report={gardenGeneratorTaps:final.board.find(item=>item?.generator==='garden-gen')?.taps,herbTier2:final.board.some(item=>item?.family==='herb'&&item.level===2),gardenStage:final.placeUpgrades.filter(id=>id.startsWith('garden-')).length,stars:final.stars,shortBoard:short.board};
  if(problems.length||badResponses.length||requestFailures.length)throw new Error(`network/console problems: ${JSON.stringify({problems,badResponses,requestFailures})}`);
}catch(error){failure=error;try{await shot('89-place03-failure');}catch{}}
finally{await writeFile(`${outDir}/place03-report.json`,JSON.stringify({report,problems,badResponses,requestFailures,failure:failure?.message||null},null,2));await browser.close();}
if(failure)throw failure;
console.log('Place 03 WebKit QA passed.');
