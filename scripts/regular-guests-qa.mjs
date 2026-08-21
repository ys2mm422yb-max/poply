import { webkit } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const baseURL=process.env.QA_BASE_URL||'http://127.0.0.1:4173';
const outDir=process.env.QA_OUT_DIR||'qa-artifacts';
const SAFE_TOP=47,SAFE_BOTTOM=34;
await mkdir(outDir,{recursive:true});
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},screen:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:'de-DE'});
const page=await context.newPage();
const problems=[];
page.on('console',msg=>{if(['error','warning'].includes(msg.type()))problems.push(`${msg.type()}: ${msg.text()}`);});
page.on('pageerror',error=>problems.push(`pageerror: ${error.message}`));
const assert=(value,message)=>{if(!value)throw new Error(message);};
const shot=name=>page.screenshot({path:`${outDir}/${name}.png`,fullPage:false});
const applyInsets=()=>page.evaluate(({top,bottom})=>{document.documentElement.style.setProperty('--poply-safe-top',`${top}px`);document.documentElement.style.setProperty('--poply-safe-bottom',`${bottom}px`);},{top:SAFE_TOP,bottom:SAFE_BOTTOM});
const go=async view=>{await page.locator(`.nav-tab[data-view="${view}"]`).click();await page.waitForSelector(`.view-${view}`);await page.waitForTimeout(140);};
const assertNoScroll=async label=>{const m=await page.evaluate(()=>({scroll:document.documentElement.scrollHeight,inner:innerHeight}));assert(m.scroll<=m.inner+1,`${label}: document scrolls ${JSON.stringify(m)}`);};
const assertAboveDock=async(locator,label)=>{const [box,nav]=await Promise.all([locator.boundingBox(),page.locator('.main-nav').boundingBox()]);assert(box&&nav,`${label}: geometry missing`);assert(box.y+box.height<=nav.y-1,`${label}: overlaps dock ${JSON.stringify({box,nav})}`);};

const seed=async()=>{
  await page.evaluate(async()=>{
    const game=await import('./src/v2-game.js');
    const state=game.createInitialState();
    state.placeUpgrades=['lights','counter','menu','seating','terrace'];
    state.guestVisits={mika:5,nora:2,sam:1};
    state.stars=13;
    localStorage.setItem('poply-v2-state-1',JSON.stringify(state));
    localStorage.setItem('poply-v2-state-1-backup',JSON.stringify(state));
  });
  await page.reload({waitUntil:'networkidle'});
  await applyInsets();
  await page.waitForTimeout(180);
};

const inspectOrders=async height=>{
  await go('orders');
  const choice=page.locator('.customer-choice').nth(1);
  await choice.click();
  const card=page.locator('.service-card[data-service-order="order-1"]');
  await card.waitFor({state:'visible'});
  const chip=card.locator('.service-order-theme .guest-regular-chip');
  await chip.waitFor({state:'visible'});
  const text=((await chip.textContent())||'').replace(/\s+/g,' ').trim();
  assert(text.includes('Nora')&&text.includes('Kaffee'),`Regular guest ${height}: preference missing ${text}`);
  assert(text.includes('2/5')&&text.includes('+100'),`Regular guest ${height}: next loyalty payoff missing ${text}`);
  const label=((await card.locator('.service-customer>span').textContent())||'').trim();
  assert(label.includes('NORA')&&label.includes('BEKANNT'),`Regular guest ${height}: loyalty identity missing ${label}`);
  const story=card.locator('.service-order-theme>p');
  await story.waitFor({state:'visible'});
  const storyMetrics=await story.evaluate(node=>({font:Number.parseFloat(getComputedStyle(node).fontSize),scrollWidth:node.scrollWidth,clientWidth:node.clientWidth,scrollHeight:node.scrollHeight,clientHeight:node.clientHeight}));
  assert(storyMetrics.font>=10.5,`Regular guest ${height}: theme story became microcopy ${JSON.stringify(storyMetrics)}`);
  assert(storyMetrics.scrollWidth<=storyMetrics.clientWidth+1&&storyMetrics.scrollHeight<=storyMetrics.clientHeight+1,`Regular guest ${height}: theme story clips ${JSON.stringify(storyMetrics)}`);
  const chipMetrics=await chip.evaluate(node=>({font:Number.parseFloat(getComputedStyle(node.querySelector('b')).fontSize),scrollWidth:node.scrollWidth,clientWidth:node.clientWidth,scrollHeight:node.scrollHeight,clientHeight:node.clientHeight}));
  assert(chipMetrics.font>=8.5,`Regular guest ${height}: preference collapsed below compact floor ${JSON.stringify(chipMetrics)}`);
  assert(chipMetrics.scrollWidth<=chipMetrics.clientWidth+1&&chipMetrics.scrollHeight<=chipMetrics.clientHeight+1,`Regular guest ${height}: preference chip clips ${JSON.stringify(chipMetrics)}`);
  assert((await card.locator('.service-needs .need').count())===2,`Regular guest ${height}: requirements changed`);
  await assertAboveDock(card,`Regular guest order ${height}`);
  await assertNoScroll(`Regular guest order ${height}`);
  await shot(`350-regular-guest-order-390x${height}`);
};

const inspectPlace=async height=>{
  await go('place');
  const scene=page.locator('.view-place.place-coast .place-scene-svg');
  await scene.waitFor({state:'visible'});
  await page.waitForFunction(()=>document.querySelectorAll('.view-place.place-coast .place-life-guests-v2-front [data-regular-guest]').length===3);
  const regulars=scene.locator('.place-life-guests-v2-front [data-regular-guest]');
  const ids=await regulars.evaluateAll(nodes=>nodes.map(node=>node.getAttribute('data-regular-guest')));
  assert(JSON.stringify(ids)===JSON.stringify(['mika','nora','sam']),`Regular Place ${height}: wrong deterministic guest order ${JSON.stringify(ids)}`);
  const visits=await regulars.evaluateAll(nodes=>nodes.map(node=>Number(node.getAttribute('data-regular-visits'))));
  assert(JSON.stringify(visits)===JSON.stringify([5,2,1]),`Regular Place ${height}: visit identity mismatch ${JSON.stringify(visits)}`);
  const nameText=(await scene.locator('.regular-guest-nameplate text').allTextContents()).join(' | ');
  assert(nameText.includes('Mika · Stammgast')&&nameText.includes('Nora · Bekannt')&&nameText.includes('Sam'),`Regular Place ${height}: visible guest names/ranks missing ${nameText}`);
  const nameplates=scene.locator('.regular-guest-nameplate');
  for(let i=0;i<await nameplates.count();i+=1){const box=await nameplates.nth(i).boundingBox();assert(box&&box.width>=38&&box.height>=8,`Regular Place ${height}: nameplate ${i} not visible ${JSON.stringify(box)}`);}
  await assertAboveDock(scene,`Regular Place scene ${height}`);
  await assertNoScroll(`Regular Place ${height}`);
  await shot(`351-regular-guests-place-390x${height}`);
};

let report={},failure=null;
try{
  await page.goto(baseURL,{waitUntil:'networkidle'});
  for(const height of [844,720]){
    await page.setViewportSize({width:390,height});
    await seed();
    await inspectOrders(height);
    await inspectPlace(height);
  }
  report={viewports:['390x844','390x720'],guestVisits:{mika:5,nora:2,sam:1},preferenceVisible:true,nextLoyaltyPayoffVisible:true,regularsInPlace:true,noNewPersistence:true,screenshots:4};
  if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){failure=error;try{await shot('359-regular-guests-failure');}catch{}}
finally{await writeFile(`${outDir}/regular-guests-report.json`,JSON.stringify({report,problems,failure:failure?.message||null},null,2));await browser.close();}
if(failure)throw failure;
console.log('Regular guests WebKit QA passed.');