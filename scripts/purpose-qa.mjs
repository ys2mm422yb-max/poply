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

let report={},failure=null;
try{
  await page.goto(baseURL,{waitUntil:'networkidle'});
  await page.evaluate(async()=>{const game=await import('./src/v2-game.js');const state=game.createInitialState();state.stars=2;localStorage.setItem('poply-v2-state-1',JSON.stringify(state));});
  await page.reload({waitUntil:'networkidle'});
  await page.waitForSelector('.purpose-card [data-purpose-go-orders]');
  const boardGoal=(await page.locator('.purpose-card').textContent())||'';
  assert(boardGoal.includes('NÄCHSTES ZIEL · 1/6'),`board goal step missing: ${boardGoal}`);
  assert(boardGoal.includes('Lichter'),`board goal name missing: ${boardGoal}`);
  assert(boardGoal.includes('noch 2'),`board distance missing: ${boardGoal}`);
  assert((await page.locator('.purpose-card [data-purpose-go-orders]').textContent())?.includes('2 ★ holen'),'not-ready board must route to playable work');
  assert(await page.locator('.purpose-board-after').isVisible(),'390x844 board should show the next-after teaser');
  await assertContained(page.locator('.purpose-board-after'),page.locator('.purpose-card'),'390x844 board Danach');
  await assertNoScroll('390x844 board purpose');
  await shot('70-purpose-board-390x844');

  await page.locator('.purpose-card [data-purpose-go-orders]').click();
  await page.waitForSelector('.view-orders .purpose-service-goal');
  assert((await page.locator('.service-hero h2').textContent())?.includes('Wähle'),'not-ready purpose CTA did not land on actionable orders');
  await page.locator('.purpose-service-goal').click();
  await page.waitForSelector('.view-place .scene-upgrade-preview.lights');
  assert(await page.locator('.scene-upgrade-preview.lights').count()===1,'next authored Lichter group is not previewed');
  assert(await page.locator('.purpose-blueprint-tag').count()===0,'Place must not duplicate the next-upgrade objective in a scene badge');
  assert((await page.locator('.place-current-goal').textContent())?.includes('Lichter'),'single Place objective missing Lichter');
  assert((await page.locator('.purpose-place-after').textContent())?.includes('Neue Theke'),'Danach teaser missing next upgrade');
  assert((await page.locator('.purpose-place-unlock').textContent())?.includes('Kombi-Aufträge'),'current upgrade does not explain its gameplay unlock');
  const story=await page.locator('.purpose-place-goal .goal-copy>p').evaluate(node=>({text:node.textContent,scroll:node.scrollHeight,client:node.clientHeight}));
  assert(story.text?.includes('Abends sichtbar'),'goal story copy missing');
  assert(story.scroll<=story.client+1,`goal story is visually clipped ${JSON.stringify(story)}`);
  await assertContained(page.locator('.purpose-place-after'),page.locator('.place-current-goal'),'390x844 Place Danach');
  await assertContained(page.locator('.purpose-place-unlock'),page.locator('.place-current-goal'),'390x844 Place unlock');
  await assertNoScroll('390x844 Place preview');
  await shot('71-purpose-place-preview-390x844');

  await page.evaluate(()=>{const state=JSON.parse(localStorage.getItem('poply-v2-state-1'));state.stars=4;localStorage.setItem('poply-v2-state-1',JSON.stringify(state));});
  await page.reload({waitUntil:'networkidle'});
  await page.locator('.nav-tab[data-view="board"]').click();
  await page.waitForSelector('.purpose-card [data-purpose-go-place]');
  assert((await page.locator('.purpose-card [data-purpose-go-place]').textContent())?.includes('Jetzt bauen'),'ready board must expose build action');
  await page.locator('.purpose-card [data-purpose-go-place]').click();
  await page.waitForSelector('.scene-upgrade-preview.lights');
  assert(await page.locator('.place-current-goal [data-action="build"]').isEnabled(),'Lichter should be buildable with 4 stars');
  await page.locator('.place-current-goal [data-action="build"]').click();
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('poply-v2-state-1')||'{}').placeUpgrades?.includes('lights'));
  await page.waitForSelector('.scene-upgrade.lights.fx-purpose-built');
  assert(await page.locator('.scene-upgrade-preview.counter').count()===1,'after build, exact next authored counter group should become preview');
  assert(await page.locator('.purpose-blueprint-tag').count()===0,'post-build Place reintroduced duplicate scene objective');
  assert((await page.locator('.purpose-place-after').textContent())?.includes('Menüwand'),'post-build Danach teaser did not advance');
  assert((await page.locator('.purpose-place-unlock').textContent())?.includes('Tier-3'),'post-build goal did not expose the next gameplay unlock');
  await assertContained(page.locator('.purpose-place-after'),page.locator('.place-current-goal'),'390x844 post-build Danach');
  await shot('72-purpose-place-built-390x844');

  await page.locator('.nav-tab[data-view="orders"]').click();
  await page.waitForSelector('.purpose-service-goal');
  const ordersGoal=(await page.locator('.service-hero').textContent())||'';
  assert(ordersGoal.includes('Ziel 2/6'),'Orders goal did not advance to step 2');
  assert(ordersGoal.includes('Menüwand'),'Orders Danach teaser missing');
  const servicePurpose=(await page.locator('.service-purpose').textContent())||'';
  assert(servicePurpose.includes('Neue Theke'),'selected order is not connected to the current Place goal');
  assert(await page.locator('.service-strategy').isVisible(),'order strategy badge missing');
  await assertNoScroll('390x844 Orders purpose');
  await shot('73-purpose-orders-390x844');

  await page.setViewportSize({width:390,height:720});
  await page.locator('.nav-tab[data-view="board"]').click();
  await page.waitForSelector('.purpose-card');
  assert(!(await page.locator('.purpose-board-after').isVisible()),'390x720 board should hide the secondary Danach teaser');
  await assertNoScroll('390x720 board purpose');
  await shot('74-purpose-board-390x720');
  const shortCta=page.locator('.purpose-card [data-purpose-go-orders],.purpose-card [data-purpose-go-place]');assert(await shortCta.count()===1,'short board lost actionable CTA');await shortCta.click();
  if(await page.locator('.view-orders').count())await page.locator('.purpose-service-goal').click();
  await page.waitForSelector('.view-place .place-current-goal');
  assert(await page.locator('.purpose-blueprint-tag').count()===0,'390x720 Place reintroduced duplicate scene objective');
  await assertContained(page.locator('.purpose-place-after'),page.locator('.place-current-goal'),'390x720 Place Danach');
  await assertContained(page.locator('.purpose-place-unlock'),page.locator('.place-current-goal'),'390x720 Place unlock');
  await assertNoScroll('390x720 Place purpose');
  await shot('75-purpose-place-preview-390x720');

  const saved=await readSave();
  report={boardGoal:'Lichter',built:saved.placeUpgrades.includes('lights'),nextGoal:'Neue Theke',singlePlaceObjective:true,shortViewportNoScroll:true,hierarchyContained:true,actionableRouting:true};
  if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){
  failure=error;try{await shot('79-purpose-failure');}catch{}
}finally{
  await writeFile(`${outDir}/purpose-report.json`,JSON.stringify({report,problems,failure:failure?.message||null},null,2));
  await browser.close();
}
if(failure)throw failure;
console.log('Purpose loop WebKit QA passed.');
