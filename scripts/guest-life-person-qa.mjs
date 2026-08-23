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
const goPlace=async()=>{await page.locator('.nav-tab[data-view="place"]').click();await page.waitForSelector('.view-place.place-coast');await page.waitForTimeout(120);};

const seedStage2=async({pending=[]}={})=>{
  await page.evaluate(async pending=>{
    const game=await import('./src/v2-game.js');
    const state=game.createInitialState();
    state.placeUpgrades=['lights','counter'];
    state.guestVisits={mika:0,nora:0,sam:0};
    state.stars=0;
    localStorage.setItem('poply-v2-state-1',JSON.stringify(state));
    localStorage.setItem('poply-v2-state-1-backup',JSON.stringify(state));
    if(pending.length)localStorage.setItem('poply-guest-life-pending-v1',JSON.stringify(pending));
    else localStorage.removeItem('poply-guest-life-pending-v1');
  },pending);
  await page.reload({waitUntil:'networkidle'});
  await applyInsets();
  await page.waitForTimeout(160);
};

const inspect=async height=>{
  await page.setViewportSize({width:390,height});
  await seedStage2();
  await goPlace();
  const scene=page.locator('.view-place.place-coast .place-scene-svg');
  await scene.waitFor({state:'visible'});
  await page.waitForFunction(()=>document.querySelectorAll('.view-place.place-coast [data-guest-life-waiting]').length===3);

  const barista=scene.locator('.cafe-barista');
  assert(await barista.count()===1,`Person contract ${height}: authored barista marker missing`);
  const baristaDisplay=await barista.evaluate(node=>getComputedStyle(node).display);
  assert(baristaDisplay==='none',`Person contract ${height}: anonymous permanent barista is still visible (${baristaDisplay})`);

  const steam=scene.locator('.cafe-steam');
  assert(await steam.count()===1,`Person contract ${height}: legacy counter steam marker missing`);
  assert((await steam.evaluate(node=>getComputedStyle(node).display))==='none',`Person contract ${height}: idle counter still exposes legacy steam`);

  const mapLaunch=page.locator('.view-place.place-coast [data-action="place-map"]');
  assert(await mapLaunch.locator('svg').count()===1,`Person contract ${height}: map launcher does not use a clear map icon`);
  assert(!((await mapLaunch.textContent())||'').includes('⌖'),`Person contract ${height}: ambiguous target glyph still visible`);

  const waiting=scene.locator('[data-guest-life-waiting]');
  const ids=await waiting.evaluateAll(nodes=>nodes.map(node=>node.getAttribute('data-guest-life-waiting')));
  assert(ids.length===3&&new Set(ids).size===3,`Person contract ${height}: expected three unique active order guests, got ${JSON.stringify(ids)}`);
  const kinds=await waiting.evaluateAll(nodes=>nodes.map(node=>node.getAttribute('data-guest-life-waiting-kind')));
  assert(JSON.stringify(kinds)===JSON.stringify(['counter-wait','counter-queue','counter-queue-back']),`Person contract ${height}: guests are not using the three authored counter roles ${JSON.stringify(kinds)}`);
  const entryAnimations=scene.locator('[data-guest-life-waiting] .guest-life-wait-in');
  assert((await entryAnimations.count())===3,`Person contract ${height}: all three guest entry animations are required`);
  assert((await scene.locator('.place-life-guests-v2-front [data-regular-guest]').count())===0,`Person contract ${height}: unserved guests were duplicated as seated regulars`);

  // Restart the actual rendered SMIL entrance after all setup assertions. Measuring the natural animation
  // from an arbitrary late QA timestamp is flaky; restarting the same shipped animation makes geometry proof deterministic.
  const restartable=await entryAnimations.evaluateAll(nodes=>nodes.every(node=>typeof node.beginElement==='function'));
  assert(restartable,`Person contract ${height}: rendered guest entry cannot be deterministically restarted for motion proof`);
  await entryAnimations.evaluateAll(nodes=>nodes.forEach(node=>node.beginElement()));
  await page.waitForTimeout(40);
  const entryStart=await waiting.evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().x));
  await page.waitForTimeout(460);
  const entryMid=await waiting.evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().x));
  entryStart.forEach((x,index)=>assert(x-entryMid[index]>=12,`Person contract ${height}: guest ${index} did not visibly move into scene ${JSON.stringify({start:x,mid:entryMid[index]})}`));
  await shot(`356-guest-life-entering-stage2-390x${height}`);

  await page.waitForTimeout(500);
  const boxes=[];
  for(let i=0;i<3;i+=1){
    const box=await waiting.nth(i).boundingBox();boxes.push(box);
    assert(box&&box.width>=24&&box.height>=38,`Person contract ${height}: waiting guest ${i} is not readable ${JSON.stringify(box)}`);
  }
  assert(boxes[0].x<boxes[1].x&&boxes[1].x<boxes[2].x,`Person contract ${height}: queue order is visually reversed ${JSON.stringify(boxes)}`);
  const bottoms=boxes.map(box=>box.y+box.height);
  assert(bottoms[0]<bottoms[1]&&bottoms[1]<bottoms[2],`Person contract ${height}: queue is not visibly staggered in depth ${JSON.stringify({boxes,bottoms})}`);
  await shot(`357-guest-life-waiting-stage2-390x${height}`);

  await seedStage2({pending:['nora']});
  await goPlace();
  const serviceScene=page.locator('.view-place.place-coast .place-scene-svg');
  await page.waitForFunction(()=>document.querySelector('.view-place.place-coast .place-scene-svg')?.classList.contains('has-guest-life-service'));
  const serviceSteam=serviceScene.locator('.cafe-steam');
  const steamStyle=await serviceSteam.evaluate(node=>{const style=getComputedStyle(node);return {display:style.display,opacity:Number(style.opacity),pathAnimations:[...node.querySelectorAll('path')].map(path=>getComputedStyle(path).animationName)};});
  assert(steamStyle.display!=='none',`Person contract ${height}: legacy service-state marker was not activated ${JSON.stringify(steamStyle)}`);
  assert(steamStyle.opacity===0,`Person contract ${height}: legacy steam/smoke is still visually exposed ${JSON.stringify(steamStyle)}`);
  assert(steamStyle.pathAnimations.every(name=>name==='none'),`Person contract ${height}: hidden legacy smoke paths still animate ${JSON.stringify(steamStyle)}`);
  const cupAnimation=await serviceScene.locator('.cafe-cups').evaluate(node=>getComputedStyle(node).animationName);
  const counterAnimation=await serviceScene.locator('.counter-top').evaluate(node=>getComputedStyle(node).animationName);
  assert(cupAnimation.includes('placeServiceCupPayoff'),`Person contract ${height}: real service has no cup payoff (${cupAnimation})`);
  assert(counterAnimation.includes('placeServiceCounterPayoff'),`Person contract ${height}: real service has no counter payoff (${counterAnimation})`);
  assert(await serviceScene.locator('[data-guest-life-walker="nora"]').count()===1,`Person contract ${height}: service payoff is not tied to the pending served guest`);
  assert(await serviceScene.locator('[data-guest-life-waiting="nora"]').count()===0,`Person contract ${height}: served Nora duplicated in waiting queue`);
  await shot(`358-guest-life-service-payoff-stage2-390x${height}`);

  await page.emulateMedia({reducedMotion:'reduce'});
  await seedStage2();
  await goPlace();
  await page.waitForFunction(()=>document.querySelectorAll('.view-place.place-coast [data-guest-life-waiting]').length===3);
  assert((await page.locator('.view-place.place-coast .guest-life-wait-in').count())===0,`Person contract ${height}: Reduced Motion still creates entry travel`);
  await page.emulateMedia({reducedMotion:'no-preference'});
};

let report={},failure=null;
try{
  await page.goto(baseURL,{waitUntil:'networkidle'});
  for(const height of [844,720])await inspect(height);
  report={viewports:['390x844','390x720'],anonymousBaristaHidden:true,threeActiveGuestsVisible:true,activeGuestsUseStaggeredCounterRoles:true,activeGuestsMoveOnScreen:true,idleSteamHidden:true,serviceSteamVisuallySuppressed:true,serviceCupCounterPayoff:true,mapIconClear:true,reducedMotionSafe:true,screenshots:6};
  if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){failure=error;try{await shot('359-guest-life-person-failure');}catch{}}
finally{await writeFile(`${outDir}/guest-life-person-report.json`,JSON.stringify({report,problems,failure:failure?.message||null},null,2));await browser.close();}
if(failure)throw failure;
console.log('Guest-Life person-role WebKit QA passed.');