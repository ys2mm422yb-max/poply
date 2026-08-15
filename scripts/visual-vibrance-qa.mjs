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
  await page.evaluate(async()=>{const game=await import('./src/v2-game.js');localStorage.setItem('poply-v2-state-1',JSON.stringify(game.createInitialState()));});
  await page.reload({waitUntil:'networkidle'});await page.waitForSelector('.view-board');
};
const assertFits=async label=>{
  const metrics=await page.evaluate(()=>{const box=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right};};return {h:visualViewport?.height||innerHeight,app:box('.app-shell'),board:box('.board-frame'),nav:box('.main-nav'),scroll:document.documentElement.scrollHeight,inner:innerHeight};});
  assert(metrics.app&&metrics.nav,`${label}: app/nav missing`);assert(metrics.nav.bottom<=metrics.h+1,`${label}: nav clipped ${JSON.stringify(metrics)}`);assert(metrics.scroll<=metrics.inner+1,`${label}: document scrolls ${JSON.stringify(metrics)}`);if(metrics.board)assert(metrics.board.bottom<=metrics.nav.top+1,`${label}: board overlaps nav ${JSON.stringify(metrics)}`);return metrics;
};
const mergeCoffee=async()=>{
  const from=await page.locator('.board-cell[data-index="9"]').boundingBox(),to=await page.locator('.board-cell[data-index="10"]').boundingBox();
  assert(from&&to,'coffee merge pair missing');
  await page.mouse.move(from.x+from.width/2,from.y+from.height/2);await page.mouse.down();await page.mouse.move(to.x+to.width/2,to.y+to.height/2,{steps:9});await page.mouse.up();
};
let report={},failure=null;
try{
  await page.goto(baseURL,{waitUntil:'networkidle'});await seedFresh();await assertFits('vibrance board 390x844');
  const palette=await page.evaluate(()=>{
    const pseudo=index=>{const el=document.querySelector(`.board-cell[data-index="${index}"]`);const s=getComputedStyle(el,'::before');return {className:el?.className||'',background:s.backgroundImage,shadow:s.boxShadow,fx:getComputedStyle(el).getPropertyValue('--fx-rgb').trim()};};
    const frame=getComputedStyle(document.querySelector('.board-frame'));
    return {coffee:pseudo(9),bakery:pseudo(16),sweet:pseudo(23),frameBackground:frame.backgroundImage};
  });
  assert(palette.coffee.fx==='240,154,91',`coffee family color variable missing ${JSON.stringify(palette.coffee)}`);
  assert(palette.bakery.fx==='243,207,98',`bakery family color variable missing ${JSON.stringify(palette.bakery)}`);
  assert(palette.sweet.fx==='239,143,187',`sweet family color variable missing ${JSON.stringify(palette.sweet)}`);
  assert(palette.coffee.background!==palette.bakery.background&&palette.bakery.background!==palette.sweet.background,`family cell surfaces are not visually distinct ${JSON.stringify(palette)}`);
  await shot('70-vibrant-board-before-merge');

  await mergeCoffee();
  const mergeCell=page.locator('.board-cell.fx-merge');await mergeCell.waitFor({state:'visible'});await page.waitForTimeout(145);
  const mergeFx=await mergeCell.evaluate(el=>{const style=getComputedStyle(el),before=getComputedStyle(el,'::before'),after=getComputedStyle(el,'::after');return {className:el.className,fx:style.getPropertyValue('--fx-rgb').trim(),animation:style.animationName,beforeBorder:before.borderTopColor,beforeShadow:before.boxShadow,afterAnimation:after.animationName,afterBackground:after.backgroundImage,afterOpacity:Number(after.opacity)};});
  assert(mergeFx.className.includes('family-coffee'),`merged cell lost coffee family class ${JSON.stringify(mergeFx)}`);
  assert(mergeFx.fx==='240,154,91',`merged cell is not using coffee family color ${JSON.stringify(mergeFx)}`);
  assert(mergeFx.animation.includes('poply-family-merge-snap'),`family merge animation not active ${JSON.stringify(mergeFx)}`);
  assert(mergeFx.afterAnimation.includes('poply-family-tier-flash'),`family merge flash not active ${JSON.stringify(mergeFx)}`);
  assert(mergeFx.afterOpacity>.04,`family merge flash is visually absent ${JSON.stringify(mergeFx)}`);
  await shot('71-family-colored-merge-impact');

  await page.locator('.nav-tab[data-view="place"]').click();await page.waitForSelector('.place-coast');await assertFits('vibrance coast 390x844');
  const coast=await page.locator('.world-art').evaluate(el=>{const a=getComputedStyle(el,'::after'),command=getComputedStyle(document.querySelector('.place-command'));return {animation:a.animationName,opacity:Number(a.opacity),background:a.backgroundImage,commandBackground:command.backgroundImage};});
  assert(coast.animation.includes('poply-coast-light'),`coast ambient life is not active ${JSON.stringify(coast)}`);assert(coast.opacity>.2,`coast ambient light too weak ${JSON.stringify(coast)}`);await shot('72-coast-world-alive');

  await page.evaluate(()=>{const state=JSON.parse(localStorage.getItem('poply-v2-state-1'));state.placeUpgrades=['lights','counter','menu','seating','terrace','sign','sunset-lanterns'];state.stars=99;localStorage.setItem('poply-v2-state-1',JSON.stringify(state));});
  await page.reload({waitUntil:'networkidle'});await page.locator('.nav-tab[data-view="place"]').click();await page.waitForSelector('.place-sunset');
  const sunset=await page.evaluate(()=>{const art=document.querySelector('.world-art'),lantern=document.querySelector('.scene-upgrade.sunset-lanterns circle'),palms=document.querySelector('.sunset-palms');return {overlay:getComputedStyle(art,'::after').animationName,lantern:lantern?getComputedStyle(lantern).animationName:null,palms:palms?getComputedStyle(palms).animationName:null};});
  assert(sunset.overlay.includes('poply-sunset-light'),`sunset ambient life is not active ${JSON.stringify(sunset)}`);
  assert(sunset.lantern?.includes('poply-lamp-warmth'),`sunset lantern authored warmth is not active ${JSON.stringify(sunset)}`);
  assert(sunset.palms?.includes('poply-palm-sway'),`sunset authored palm motion is not active ${JSON.stringify(sunset)}`);
  await shot('73-sunset-world-alive');

  await page.setViewportSize({width:390,height:720});await page.locator('.nav-tab[data-view="board"]').click();await page.waitForTimeout(120);await assertFits('vibrance board 390x720');await shot('74-vibrance-short-safari');
  report={palette,mergeFx,coast,sunset};if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){failure=error;try{await shot('79-vibrance-failure');}catch{}}
finally{await writeFile(`${outDir}/visual-vibrance-report.json`,JSON.stringify({report,problems,failure:failure?.message||null},null,2));await browser.close();}
if(failure)throw failure;
console.log('Visual vibrance WebKit QA passed.');
