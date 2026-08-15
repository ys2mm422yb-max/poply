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
const assertNoScroll=async label=>{const m=await page.evaluate(()=>({scroll:document.documentElement.scrollHeight,inner:innerHeight,visual:window.visualViewport?.height||innerHeight}));assert(m.scroll<=m.inner+1,`${label}: document scrolls ${JSON.stringify(m)}`);};
const rect=locator=>locator.evaluate(node=>{const b=node.getBoundingClientRect();return {top:b.top,bottom:b.bottom,left:b.left,right:b.right,width:b.width,height:b.height};});
const assertContained=async(child,parent,label)=>{const [c,p]=await Promise.all([rect(child),rect(parent)]);assert(c.top>=p.top-1&&c.bottom<=p.bottom+1&&c.left>=p.left-1&&c.right<=p.right+1,`${label}: child escapes surface ${JSON.stringify({child:c,parent:p})}`);};
const assertNoOverlap=async(a,b,label)=>{const [x,y]=await Promise.all([rect(a),rect(b)]);const overlap=!(x.right<=y.left||x.left>=y.right||x.bottom<=y.top||x.top>=y.bottom);assert(!overlap,`${label}: surfaces overlap ${JSON.stringify({a:x,b:y})}`);};

let report={},failure=null;
try{
  await page.goto(baseURL,{waitUntil:'networkidle'});
  await page.evaluate(async()=>{const game=await import('./src/v2-game.js');const state=game.createInitialState();state.stars=2;localStorage.setItem('poply-v2-state-1',JSON.stringify(state));});
  await page.reload({waitUntil:'networkidle'});
  await page.waitForSelector('.purpose-card [data-purpose-go-place]');
  const boardGoal=(await page.locator('.purpose-card').textContent())||'';
  assert(boardGoal.includes('NÄCHSTES ZIEL · 1/6'),`board goal step missing: ${boardGoal}`);
  assert(boardGoal.includes('Lichter'),`board goal name missing: ${boardGoal}`);
  assert(boardGoal.includes('noch 2'),`board distance missing: ${boardGoal}`);
  assert((await page.locator('.purpose-card [data-purpose-go-place]').textContent())?.includes('Zum Place'),'board must route to Place instead of building invisibly');
  assert(await page.locator('.purpose-board-after').isVisible(),'390x844 board should show the next-after teaser');
  await assertContained(page.locator('.purpose-board-after'),page.locator('.purpose-card'),'390x844 board Danach');
  await assertNoScroll('390x844 board purpose');
  await shot('70-purpose-board-390x844');

  await page.locator('.purpose-card [data-purpose-go-place]').click();
  await page.waitForSelector('.view-place .purpose-blueprint-tag');
  assert(await page.locator('.scene-upgrade-preview.lights').count()===1,'next authored Lichter group is not previewed');
  assert((await page.locator('.purpose-blueprint-tag').textContent())?.includes('Lichter'),'world preview tag missing Lichter');
  assert((await page.locator('.purpose-place-after').textContent())?.includes('Neue Theke'),'Danach teaser missing next upgrade');
  const story=await page.locator('.purpose-place-goal .goal-copy>p').evaluate(node=>({text:node.textContent,scroll:node.scrollHeight,client:node.clientHeight}));
  assert(story.text?.includes('Abends sichtbar'),'goal story copy missing');
  assert(story.scroll<=story.client+1,`goal story is visually clipped ${JSON.stringify(story)}`);
  await assertContained(page.locator('.purpose-place-after'),page.locator('.place-current-goal'),'390x844 Place Danach');
  await assertNoOverlap(page.locator('.purpose-blueprint-tag'),page.locator('.world-copy'),'390x844 blueprint vs world title');
  await assertNoScroll('390x844 Place preview');
  await shot('71-purpose-place-preview-390x844');

  await page.evaluate(()=>{const state=JSON.parse(localStorage.getItem('poply-v2-state-1'));state.stars=4;localStorage.setItem('poply-v2-state-1',JSON.stringify(state));});
  await page.reload({waitUntil:'networkidle'});
  await page.locator('.nav-tab[data-view="place"]').click();
  await page.waitForSelector('.scene-upgrade-preview.lights');
  assert(await page.locator('.place-current-goal [data-action="build"]').isEnabled(),'Lichter should be buildable with 4 stars');
  await page.locator('.place-current-goal [data-action="build"]').click();
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('poply-v2-state-1')||'{}').placeUpgrades?.includes('lights'));
  await page.waitForSelector('.scene-upgrade.lights.fx-purpose-built');
  assert(await page.locator('.scene-upgrade-preview.counter').count()===1,'after build, exact next authored counter group should become preview');
  assert((await page.locator('.purpose-place-after').textContent())?.includes('Menüwand'),'post-build Danach teaser did not advance');
  await assertContained(page.locator('.purpose-place-after'),page.locator('.place-current-goal'),'390x844 post-build Danach');
  await assertNoOverlap(page.locator('.purpose-blueprint-tag'),page.locator('.world-copy'),'390x844 post-build blueprint vs world title');
  await shot('72-purpose-place-built-390x844');

  await page.locator('.nav-tab[data-view="orders"]').click();
  await page.waitForSelector('.purpose-service-goal');
  const ordersGoal=(await page.locator('.service-hero').textContent())||'';
  assert(ordersGoal.includes('Ziel 2/6'),'Orders goal did not advance to step 2');
  assert(ordersGoal.includes('Menüwand'),'Orders Danach teaser missing');
  const servicePurpose=(await page.locator('.service-purpose').textContent())||'';
  assert(servicePurpose.includes('Neue Theke'),'selected order is not connected to the current Place goal');
  await assertNoScroll('390x844 Orders purpose');
  await shot('73-purpose-orders-390x844');

  await page.setViewportSize({width:390,height:720});
  await page.locator('.nav-tab[data-view="board"]').click();
  await page.waitForSelector('.purpose-card');
  assert(!(await page.locator('.purpose-board-after').isVisible()),'390x720 board should hide the secondary Danach teaser');
  await assertNoScroll('390x720 board purpose');
  await shot('74-purpose-board-390x720');
  await page.locator('.purpose-card [data-purpose-go-place]').click();
  await page.waitForSelector('.purpose-blueprint-tag');
  await assertContained(page.locator('.purpose-place-after'),page.locator('.place-current-goal'),'390x720 Place Danach');
  await assertNoOverlap(page.locator('.purpose-blueprint-tag'),page.locator('.world-copy'),'390x720 blueprint vs world title');
  await assertNoScroll('390x720 Place purpose');
  await shot('75-purpose-place-preview-390x720');

  const saved=await readSave();
  report={boardGoal:'Lichter',built:saved.placeUpgrades.includes('lights'),nextGoal:'Neue Theke',shortViewportNoScroll:true,hierarchyContained:true};
  if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){
  failure=error;try{await shot('79-purpose-failure');}catch{}
}finally{
  await writeFile(`${outDir}/purpose-report.json`,JSON.stringify({report,problems,failure:failure?.message||null},null,2));
  await browser.close();
}
if(failure)throw failure;
console.log('Purpose loop WebKit QA passed.');
