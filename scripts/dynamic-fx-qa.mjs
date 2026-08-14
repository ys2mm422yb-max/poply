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
const seedFresh=async()=>{
  await page.evaluate(async()=>{const game=await import('./src/v2-game.js');const state=game.createInitialState();state.playerXp=0;delete state.discoveries;localStorage.setItem('poply-v2-state-1',JSON.stringify(state));});
  await page.reload({waitUntil:'networkidle'});await page.waitForSelector('.view-board');
};
const mergeCoffee=async()=>{
  const from=await page.locator('.board-cell[data-index="9"]').boundingBox(),to=await page.locator('.board-cell[data-index="10"]').boundingBox();assert(from&&to,'merge-ready coffee cells missing');
  await page.mouse.move(from.x+from.width/2,from.y+from.height/2);await page.mouse.down();await page.mouse.move(to.x+to.width/2,to.y+to.height/2,{steps:8});await page.mouse.up();
};
const assertFits=async label=>{
  const m=await page.evaluate(()=>{const box=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right};};return {h:visualViewport?.height||innerHeight,app:box('.app-shell'),board:box('.board-frame'),nav:box('.main-nav'),scroll:document.documentElement.scrollHeight,inner:innerHeight};});
  assert(m.app&&m.board&&m.nav,`${label}: app/board/nav missing`);assert(m.nav.bottom<=m.h+1,`${label}: nav clipped ${JSON.stringify(m)}`);assert(m.board.bottom<=m.nav.top+1,`${label}: board overlaps nav ${JSON.stringify(m)}`);assert(m.scroll<=m.inner+1,`${label}: document scrolls ${JSON.stringify(m)}`);return m;
};
let report={},failure=null;

try{
  await page.goto(baseURL,{waitUntil:'networkidle'});await seedFresh();await assertFits('dynamic FX 390x844');

  /* Scenario A: capture the merge at its impact peak. */
  await mergeCoffee();
  const mergeCell=page.locator('.board-cell.fx-merge');await mergeCell.waitFor({state:'visible'});await page.waitForTimeout(170);
  const mergeFx=await mergeCell.evaluate(el=>{const style=getComputedStyle(el),before=getComputedStyle(el,'::before'),after=getComputedStyle(el,'::after');return {animation:style.animationName,beforeAnimation:before.animationName,beforeOpacity:Number(before.opacity),beforeBorder:before.borderTopColor,afterAnimation:after.animationName,afterOpacity:Number(after.opacity),afterBackground:after.backgroundImage};});
  assert(mergeFx.animation.includes('merge-snap'),`merge snap not active ${JSON.stringify(mergeFx)}`);assert(mergeFx.beforeAnimation.includes('tier-ring'),`tier ring not active ${JSON.stringify(mergeFx)}`);assert(mergeFx.afterAnimation.includes('tier-flash'),`tier flash not active ${JSON.stringify(mergeFx)}`);assert(mergeFx.beforeOpacity>.05||mergeFx.afterOpacity>.05,`merge burst is visually absent ${JSON.stringify(mergeFx)}`);await shot('70-dynamic-merge-burst');

  /* Scenario B: fresh state so the previous screenshot cannot consume Discovery's short peak window. */
  await seedFresh();await mergeCoffee();
  const discovery=page.locator('.discovery-reveal');await discovery.waitFor({state:'visible'});
  await page.waitForFunction(()=>{
    const el=document.querySelector('.discovery-reveal');if(!el)return false;
    const opacity=Number(getComputedStyle(el).opacity),rays=Number(getComputedStyle(el,'::before').opacity);
    const sparks=[...el.querySelectorAll('.discovery-sparks span')].map(node=>Number(getComputedStyle(node).opacity));
    return el.classList.contains('is-visible')&&!el.classList.contains('is-leaving')&&opacity>=.8&&rays>.08&&sparks.some(value=>value>.08);
  },null,{timeout:1200});
  const discoveryFx=await discovery.evaluate(el=>{const style=getComputedStyle(el),rays=getComputedStyle(el,'::before'),sparks=[...el.querySelectorAll('.discovery-sparks span')].map(node=>{const s=getComputedStyle(node);return {animation:s.animationName,opacity:s.opacity,transform:s.transform};});return {className:el.className,opacity:Number(style.opacity),raysAnimation:rays.animationName,raysOpacity:Number(rays.opacity),sparkCount:sparks.length,sparks};});
  assert(discoveryFx.className.includes('family-coffee'),`Discovery lost family identity ${JSON.stringify(discoveryFx)}`);assert(discoveryFx.opacity>=.8,`Discovery card is not screenshot-stable ${JSON.stringify(discoveryFx)}`);assert(discoveryFx.raysAnimation.includes('poply-discovery-rays'),`Discovery rays not active ${JSON.stringify(discoveryFx)}`);assert(discoveryFx.sparkCount===6&&discoveryFx.sparks.some(s=>s.animation.includes('poply-discovery-spark')&&Number(s.opacity)>.08),`Discovery sparks not visibly active ${JSON.stringify(discoveryFx)}`);await shot('71-dynamic-discovery-burst');

  /* Scenario C: another fresh Board so generator impact is not visually covered by Discovery. */
  await seedFresh();
  const generator=page.locator('.board-cell.generator-coffee-gen').first();assert(await generator.isVisible(),'coffee generator missing');await generator.evaluate(el=>el.click());
  const activeGenerator=page.locator('.board-cell.fx-generator-dispense');await activeGenerator.waitFor({state:'visible'});await page.waitForTimeout(145);
  const generatorFx=await activeGenerator.evaluate(el=>{const style=getComputedStyle(el),pedestal=getComputedStyle(el,'::before'),art=el.querySelector('.item-art');return {animation:style.animationName,boxShadow:style.boxShadow,filter:style.filter,pedestalAnimation:pedestal.animationName,pedestalFilter:pedestal.filter,pedestalTransform:pedestal.transform,itemAnimation:art?getComputedStyle(art).animationName:''};});
  assert(generatorFx.animation.includes('generator-dispense'),`generator pulse not active ${JSON.stringify(generatorFx)}`);assert(generatorFx.pedestalAnimation.includes('generator-pedestal-pulse'),`generator pedestal pulse not active ${JSON.stringify(generatorFx)}`);await shot('72-dynamic-generator-pulse');

  await page.waitForTimeout(500);await page.setViewportSize({width:390,height:720});await page.waitForTimeout(120);await assertFits('dynamic FX 390x720');await shot('73-dynamic-board-short-safari');
  report={mergeFx,discoveryFx,generatorFx};if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){failure=error;try{await shot('79-dynamic-fx-failure');}catch{}}
finally{await writeFile(`${outDir}/dynamic-fx-report.json`,JSON.stringify({report,problems,failure:failure?.message||null},null,2));await browser.close();}
if(failure)throw failure;
console.log('Dynamic FX WebKit QA passed.');
