import { webkit } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const baseURL=process.env.QA_BASE_URL||'http://127.0.0.1:4173';
const outDir=process.env.QA_OUT_DIR||'qa-artifacts';
await mkdir(outDir,{recursive:true});
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},screen:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:'de-DE'});
const page=await context.newPage();
const problems=[];
page.on('console',msg=>{if(['error','warning'].includes(msg.type()))problems.push(`${msg.type()}: ${msg.text()}`);});
page.on('pageerror',error=>problems.push(`pageerror: ${error.message}`));
const assert=(value,message)=>{if(!value)throw new Error(message);};
const shot=name=>page.screenshot({path:`${outDir}/${name}.png`,fullPage:false});
const readSave=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('poply-v2-state-1')||'null'));
const assertFits=async label=>{
  const m=await page.evaluate(()=>{const r=s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();return {top:b.top,bottom:b.bottom,left:b.left,right:b.right,height:b.height};};return {h:window.visualViewport?.height||innerHeight,app:r('.app-shell'),view:r('.game-view'),nav:r('.main-nav'),scroll:document.documentElement.scrollHeight,inner:innerHeight};});
  assert(m.app&&m.view&&m.nav,`${label}: shell missing`);assert(m.nav.bottom<=m.h+1,`${label}: nav clipped ${JSON.stringify(m)}`);assert(m.app.bottom<=m.h+1,`${label}: app exceeds viewport ${JSON.stringify(m)}`);assert(m.scroll<=m.inner+1,`${label}: document scrolls ${JSON.stringify(m)}`);return m;
};
let report={},failure=null;

try{
  await page.goto(baseURL,{waitUntil:'networkidle'});
  await page.evaluate(async()=>{const game=await import('./src/v2-game.js');const state=game.createInitialState();state.playerXp=0;delete state.discoveries;localStorage.setItem('poply-v2-state-1',JSON.stringify(state));});
  await page.reload({waitUntil:'networkidle'});await page.waitForSelector('.view-board');
  assert(await page.locator('.nav-tab[data-view="collection"]').isVisible(),'Collection tab is not visible');
  const before=await readSave();assert(before.discoveries.includes('item:coffee:1'),'starting coffee tier 1 not backfilled');assert(!before.discoveries.includes('item:coffee:2'),'future coffee tier leaked into collection');

  const from=await page.locator('.board-cell[data-index="9"]').boundingBox(),to=await page.locator('.board-cell[data-index="10"]').boundingBox();
  assert(from&&to,'merge-ready coffee cells missing');
  await page.mouse.move(from.x+from.width/2,from.y+from.height/2);await page.mouse.down();await page.mouse.move(to.x+to.width/2,to.y+to.height/2,{steps:8});await page.mouse.up();
  await page.waitForTimeout(600);
  const discovered=await readSave();
  assert(discovered.discoveries.includes('item:coffee:2'),'real merge did not persist coffee tier 2 discovery');
  assert(discovered.playerXp===40,`first coffee tier 2 discovery should grant 40 XP, got ${discovered.playerXp}`);
  const discoveryReveal=page.locator('.discovery-reveal');assert(await discoveryReveal.isVisible(),'discovery reveal did not appear after real merge');
  const reveal=await discoveryReveal.textContent();assert(reveal?.includes('Kaffeetasse')&&reveal?.includes('+40 XP'),`discovery reveal copy incorrect: ${reveal}`);
  const revealVisual=await discoveryReveal.evaluate(el=>{const box=el.getBoundingClientRect(),style=getComputedStyle(el);return {width:box.width,height:box.height,top:box.top,bottom:box.bottom,opacity:Number(style.opacity),position:style.position,zIndex:style.zIndex};});
  assert(revealVisual.position==='fixed',`discovery reveal is not viewport anchored: ${JSON.stringify(revealVisual)}`);
  assert(revealVisual.width>=270&&revealVisual.height>=100,`discovery reveal is too small to read in screenshot: ${JSON.stringify(revealVisual)}`);
  assert(revealVisual.top>=56&&revealVisual.bottom<=430,`discovery reveal is outside useful mobile area: ${JSON.stringify(revealVisual)}`);
  assert(revealVisual.opacity>=0.8,`discovery reveal screenshot state is too transparent: ${JSON.stringify(revealVisual)}`);
  await shot('30-item-discovery-reveal');

  await page.waitForTimeout(1050);
  await page.locator('.nav-tab[data-view="collection"]').click();await page.waitForSelector('.view-collection');
  await assertFits('390x844 collection');
  assert((await page.locator('.collection-total strong').textContent())==='4/24','collection total does not include the new tier');
  const coffee2=page.locator('[data-discovery-key="item:coffee:2"]');assert(await coffee2.evaluate(el=>el.classList.contains('discovered')),'coffee tier 2 is not shown discovered');
  assert((await coffee2.textContent())?.includes('Kaffeetasse'),'discovered tier does not show its real name');
  await shot('31-collection-coffee');

  await page.locator('[data-collection-family="fruit"]').click();
  assert((await page.locator('.collection-focus h2').textContent())?.includes('Sonnenfrüchte'),'fruit family did not open');
  assert(await page.locator('.collection-tier.locked').count()===6,'undiscovered fruit tiers should all remain silhouettes');
  await shot('32-collection-locked-fruit');

  await page.setViewportSize({width:390,height:720});await page.waitForTimeout(120);await assertFits('390x720 collection');await shot('33-collection-short-safari');
  await page.reload({waitUntil:'networkidle'});await page.locator('.nav-tab[data-view="collection"]').click();
  const reloaded=await readSave();assert(reloaded.discoveries.includes('item:coffee:2'),'collection discovery was lost after reload');assert(reloaded.playerXp===40,'discovery XP was lost after reload');
  report={discoveries:reloaded.discoveries,playerXp:reloaded.playerXp,revealVisual};
  if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){failure=error;try{await shot('39-collection-failure');}catch{}}
finally{await writeFile(`${outDir}/collection-report.json`,JSON.stringify({report,problems,failure:failure?.message||null},null,2));await browser.close();}
if(failure)throw failure;
console.log('Collection Book WebKit QA passed.');
