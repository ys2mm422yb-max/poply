import { webkit } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const baseURL=process.env.QA_BASE_URL||'http://127.0.0.1:4173';
const outDir=process.env.QA_OUT_DIR||'qa-artifacts';
await mkdir(outDir,{recursive:true});
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},screen:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:'de-DE'});
const page=await context.newPage();
const problems=[];page.on('console',msg=>{if(['error','warning'].includes(msg.type()))problems.push(`${msg.type()}: ${msg.text()}`);});page.on('pageerror',error=>problems.push(`pageerror: ${error.message}`));
const assert=(value,message)=>{if(!value)throw new Error(message);};
const upgrades=['lights','counter','menu','seating','terrace','sign'];
const shot=name=>page.screenshot({path:`${outDir}/${name}.png`,fullPage:false});
const assertNoScroll=async label=>{const m=await page.evaluate(()=>({scroll:document.documentElement.scrollHeight,inner:innerHeight}));assert(m.scroll<=m.inner+1,`${label}: document scrolls ${JSON.stringify(m)}`);};
const reload=async()=>{await page.reload({waitUntil:'networkidle'});await page.waitForSelector('.game-view');};
const viewPlace=async()=>{await page.locator('.nav-tab[data-view="place"]').tap();await page.waitForSelector('.view-place .world-hero');};
const seed=async stage=>{
  await page.evaluate(async({stage,upgrades})=>{
    const game=await import('./src/v2-game.js');
    let state=game.createInitialState();
    state.placeUpgrades=upgrades.slice(0,Math.min(stage,5));
    state.stars=0;
    localStorage.setItem('poply-v2-state-1',JSON.stringify(state));
    localStorage.removeItem('poply-v2-state-1-backup');
  },{stage,upgrades});
  await reload();await viewPlace();
  if(stage===6){
    await page.evaluate(async()=>{
      const {placeSceneMarkup}=await import('./src/aaa-place-art.js');
      const hero=document.querySelector('.view-place .world-hero');
      hero.dataset.stage='6';
      hero.querySelector('.world-art').innerHTML=placeSceneMarkup(6);
      const progress=hero.querySelector('.world-progress');if(progress)progress.innerHTML='<b>6</b><span>/ 6</span>';
      const copy=hero.querySelector('.world-copy p');if(copy)copy.textContent='6 von 6 Ausbauten fertig';
    });
  }
  await page.waitForTimeout(180);
};
const inspectStage=async(stage,height)=>{
  await seed(stage);
  const hero=page.locator('.view-place .world-hero');
  const scene=hero.locator('.place-scene-v2');
  const built=scene.locator('.scene-upgrade:not(.scene-upgrade-preview)');
  assert(await scene.count()===1,`stage ${stage}: Scene V2 root missing`);
  assert(await scene.locator('.scene-depth-back').count()===1,`stage ${stage}: back depth missing`);
  assert(await scene.locator('.cafe-side-face').count()===1,`stage ${stage}: volumetric side face missing`);
  assert(await built.count()===stage,`stage ${stage}: expected ${stage} built authored upgrade groups`);
  if(stage<6){
    const preview=scene.locator('.scene-upgrade-preview');
    assert(await preview.count()===1,`stage ${stage}: next-upgrade blueprint preview missing`);
    assert(await preview.getAttribute('data-preview-upgrade')===upgrades[stage],`stage ${stage}: blueprint does not match next authored upgrade`);
  }
  if(stage>0){
    const latest=scene.locator(`.scene-upgrade.${upgrades[stage-1]}:not(.scene-upgrade-preview)`),box=await latest.boundingBox(),heroBox=await hero.boundingBox();
    assert(box&&heroBox,`stage ${stage}: latest built authored upgrade geometry missing`);
    const ratio=(box.width*box.height)/(heroBox.width*heroBox.height);
    assert(ratio>.035,`stage ${stage}: latest built authored upgrade is visually too small (${ratio.toFixed(3)})`);
  }
  await assertNoScroll(`Scene V2 stage ${stage} ${height}`);
  await shot(`scene-v2-stage-${stage}-390x${height}`);
};

let failure=null,report={};
try{
  await page.goto(baseURL,{waitUntil:'networkidle'});
  for(const height of [844,720]){
    await page.setViewportSize({width:390,height});
    for(let stage=0;stage<=6;stage++)await inspectStage(stage,height);
  }
  report={stages:[0,1,2,3,4,5,6],viewports:['390x844','390x720'],screenshots:14};
  if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){failure=error;try{await shot('scene-v2-failure');}catch{}}
finally{await writeFile(`${outDir}/place-scene-v2-report.json`,JSON.stringify({report,problems,failure:failure?.message||null},null,2));await browser.close();}
if(failure)throw failure;
console.log('Place Scene V2 WebKit QA passed.');
