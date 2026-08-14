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
const assertFits=async label=>{
  const m=await page.evaluate(()=>{const r=s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();return {top:b.top,bottom:b.bottom,left:b.left,right:b.right,width:b.width,height:b.height};};return {h:visualViewport?.height||innerHeight,app:r('.app-shell'),board:r('.board-frame'),nav:r('.main-nav'),scroll:document.documentElement.scrollHeight,inner:innerHeight};});
  assert(m.app&&m.board&&m.nav,`${label}: shell/board/nav missing`);assert(m.nav.bottom<=m.h+1,`${label}: nav clipped ${JSON.stringify(m)}`);assert(m.app.bottom<=m.h+1,`${label}: app exceeds viewport ${JSON.stringify(m)}`);assert(m.scroll<=m.inner+1,`${label}: document scrolls ${JSON.stringify(m)}`);assert(m.board.bottom<=m.nav.top+1,`${label}: board overlaps navigation ${JSON.stringify(m)}`);return m;
};
let report={},failure=null;

try{
  await page.goto(baseURL,{waitUntil:'networkidle'});
  await page.evaluate(async()=>{const game=await import('./src/v2-game.js');const state=game.createInitialState();state.playerXp=0;delete state.discoveries;localStorage.setItem('poply-v2-state-1',JSON.stringify(state));});
  await page.reload({waitUntil:'networkidle'});await page.waitForSelector('.view-board');await assertFits('390x844 color board');

  const staticVisual=await page.evaluate(()=>{
    const style=s=>{const e=document.querySelector(s);if(!e)return null;const c=getComputedStyle(e);return {background:c.backgroundImage,boxShadow:c.boxShadow,filter:c.filter};};
    return {boardArea:style('.qa-board .board-area'),frame:style('.production-board .board-frame'),coffee:style('.board-cell.family-coffee'),bakery:style('.board-cell.family-bakery'),sweet:style('.board-cell.family-sweet'),coffeeGen:style('.board-cell.generator-coffee-gen'),pantryGen:style('.board-cell.generator-pantry-gen')};
  });
  assert(staticVisual.boardArea?.background.includes('radial-gradient'),'color board has no authored ambient light pools');
  assert(staticVisual.frame?.background.includes('radial-gradient'),'board frame lost authored color pools');
  await shot('60-color-board-390x844');

  const from=await page.locator('.board-cell[data-index="9"]').boundingBox(),to=await page.locator('.board-cell[data-index="10"]').boundingBox();assert(from&&to,'merge-ready coffee cells missing');
  await page.mouse.move(from.x+from.width/2,from.y+from.height/2);await page.mouse.down();await page.mouse.move(to.x+to.width/2,to.y+to.height/2,{steps:8});await page.mouse.up();
  await page.waitForSelector('.board-cell.fx-merge');await page.waitForTimeout(105);
  const mergeFx=await page.locator('.board-cell.fx-merge').evaluate(el=>{const c=getComputedStyle(el),before=getComputedStyle(el,'::before'),after=getComputedStyle(el,'::after');return {animation:c.animationName,beforeBorder:before.borderTopColor,beforeShadow:before.boxShadow,afterBackground:after.backgroundImage,afterOpacity:after.opacity};});
  assert(mergeFx.animation.includes('merge-snap'),`merge animation missing: ${JSON.stringify(mergeFx)}`);assert(mergeFx.afterBackground.includes('conic-gradient'),`merge burst rays missing: ${JSON.stringify(mergeFx)}`);await shot('61-color-merge-burst');

  const discovery=page.locator('.discovery-reveal');await discovery.waitFor({state:'visible'});await page.waitForTimeout(220);
  const discoveryFx=await discovery.evaluate(el=>{const c=getComputedStyle(el),before=getComputedStyle(el,'::before'),after=getComputedStyle(el,'::after');return {background:c.backgroundImage,border:c.borderTopColor,shadow:c.boxShadow,beforeAnimation:before.animationName,afterAnimation:after.animationName,opacity:c.opacity};});
  assert(Number(discoveryFx.opacity)>=.8,`discovery is not screenshot-stable: ${JSON.stringify(discoveryFx)}`);assert(discoveryFx.beforeAnimation.includes('discovery-rays'),'discovery rays not active');assert(discoveryFx.afterAnimation.includes('discovery-sparks'),'discovery sparks not active');await shot('62-color-discovery-burst');

  await page.waitForTimeout(1050);await page.setViewportSize({width:390,height:720});await page.waitForTimeout(140);await assertFits('390x720 color board');await shot('63-color-board-short-safari');
  report={staticVisual,mergeFx,discoveryFx};
  if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){failure=error;try{await shot('69-color-fx-failure');}catch{}}
finally{await writeFile(`${outDir}/color-fx-report.json`,JSON.stringify({report,problems,failure:failure?.message||null},null,2));await browser.close();}
if(failure)throw failure;
console.log('Color/FX WebKit QA passed.');
