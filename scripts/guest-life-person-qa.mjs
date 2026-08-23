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

const seedStage2=async()=>{
  await page.evaluate(async()=>{
    const game=await import('./src/v2-game.js');
    const state=game.createInitialState();
    state.placeUpgrades=['lights','counter'];
    state.guestVisits={mika:0,nora:0,sam:0};
    state.stars=0;
    localStorage.setItem('poply-v2-state-1',JSON.stringify(state));
    localStorage.setItem('poply-v2-state-1-backup',JSON.stringify(state));
    localStorage.removeItem('poply-guest-life-pending-v1');
  });
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
  await page.waitForFunction(()=>document.querySelectorAll('.view-place.place-coast [data-guest-life-waiting]').length===2);

  const barista=scene.locator('.cafe-barista');
  assert(await barista.count()===1,`Person contract ${height}: authored barista marker missing`);
  const baristaDisplay=await barista.evaluate(node=>getComputedStyle(node).display);
  assert(baristaDisplay==='none',`Person contract ${height}: anonymous permanent barista is still visible (${baristaDisplay})`);

  const waiting=scene.locator('[data-guest-life-waiting]');
  const ids=await waiting.evaluateAll(nodes=>nodes.map(node=>node.getAttribute('data-guest-life-waiting')));
  assert(ids.length===2,`Person contract ${height}: expected two active order guests, got ${JSON.stringify(ids)}`);
  const kinds=await waiting.evaluateAll(nodes=>nodes.map(node=>node.getAttribute('data-guest-life-waiting-kind')));
  assert(JSON.stringify(kinds)===JSON.stringify(['counter-wait','counter-queue']),`Person contract ${height}: guests are not using counter-aware waiting roles ${JSON.stringify(kinds)}`);
  assert((await scene.locator('[data-guest-life-waiting] .guest-life-wait-in').count())===2,`Person contract ${height}: guest entry animation elements are missing`);
  assert((await scene.locator('.place-life-guests-v2-front [data-regular-guest]').count())===0,`Person contract ${height}: unserved guests were duplicated as seated regulars`);

  const entryStart=await waiting.evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().x));
  // Sample near the middle of the authored 900 ms entrance. This remains a real geometry check,
  // but avoids judging a spline by its deliberately slow opening frames.
  await page.waitForTimeout(420);
  const entryMid=await waiting.evaluateAll(nodes=>nodes.map(node=>node.getBoundingClientRect().x));
  entryStart.forEach((x,index)=>assert(x-entryMid[index]>=10,`Person contract ${height}: guest ${index} did not visibly move into scene ${JSON.stringify({start:x,mid:entryMid[index]})}`));
  await shot(`356-guest-life-entering-stage2-390x${height}`);

  await page.waitForTimeout(600);
  const boxes=[];
  for(let i=0;i<2;i+=1){
    const box=await waiting.nth(i).boundingBox();boxes.push(box);
    assert(box&&box.width>=26&&box.height>=40,`Person contract ${height}: waiting guest ${i} is not readable ${JSON.stringify(box)}`);
  }
  assert(boxes[0].x<boxes[1].x,`Person contract ${height}: queue order is visually reversed ${JSON.stringify(boxes)}`);
  await shot(`357-guest-life-waiting-stage2-390x${height}`);

  await page.emulateMedia({reducedMotion:'reduce'});
  await seedStage2();
  await goPlace();
  await page.waitForFunction(()=>document.querySelectorAll('.view-place.place-coast [data-guest-life-waiting]').length===2);
  assert((await page.locator('.view-place.place-coast .guest-life-wait-in').count())===0,`Person contract ${height}: Reduced Motion still creates entry travel`);
  await page.emulateMedia({reducedMotion:'no-preference'});
};

let report={},failure=null;
try{
  await page.goto(baseURL,{waitUntil:'networkidle'});
  for(const height of [844,720])await inspect(height);
  report={viewports:['390x844','390x720'],anonymousBaristaHidden:true,activeGuestsUseCounterRoles:true,activeGuestsMoveOnScreen:true,reducedMotionSafe:true,screenshots:4};
  if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){failure=error;try{await shot('358-guest-life-person-failure');}catch{}}
finally{await writeFile(`${outDir}/guest-life-person-report.json`,JSON.stringify({report,problems,failure:failure?.message||null},null,2));await browser.close();}
if(failure)throw failure;
console.log('Guest-Life person-role WebKit QA passed.');