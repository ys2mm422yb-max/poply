import { webkit } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const baseURL=process.env.QA_BASE_URL||'http://127.0.0.1:4173';
const outDir=process.env.QA_OUT_DIR||'qa-artifacts';
const SAFE_TOP=47,SAFE_BOTTOM=34,PENDING_KEY='poply-guest-life-pending-v1';
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
const pendingGuests=()=>page.evaluate(key=>{try{return JSON.parse(localStorage.getItem(key)||'[]');}catch{return [];}},PENDING_KEY);

const seed=async({stage=5,fulfill=true,visits={mika:5,nora:2,sam:1}}={})=>{
  await page.evaluate(async({stage,fulfill,visits,pendingKey})=>{
    const game=await import('./src/v2-game.js');
    const state=game.createInitialState(),upgrades=['lights','counter','menu','seating','terrace','sign'];
    state.placeUpgrades=upgrades.slice(0,stage);
    state.guestVisits={...visits};
    state.stars=13;
    if(fulfill){
      const target=state.currentOrders.find(order=>order.id==='order-1');
      for(const req of target?.requirements||[]){
        for(let n=0;n<req.qty;n+=1){
          const index=state.board.findIndex(item=>!item);
          if(index<0)throw new Error('No empty Board slot for regular guest QA seed');
          state.board[index]={kind:'item',family:req.family,level:req.level};
        }
      }
    }
    localStorage.setItem('poply-v2-state-1',JSON.stringify(state));
    localStorage.setItem('poply-v2-state-1-backup',JSON.stringify(state));
    localStorage.removeItem(pendingKey);
  },{stage,fulfill,visits,pendingKey:PENDING_KEY});
  await page.reload({waitUntil:'networkidle'});
  await applyInsets();
  await page.waitForTimeout(180);
};

const inspectWaitingOrders=async height=>{
  await seed({stage:1,fulfill:false,visits:{mika:0,nora:0,sam:0}});
  await go('place');
  const scene=page.locator('.view-place.place-coast .place-scene-svg');
  await scene.waitFor({state:'visible'});
  await page.waitForFunction(()=>document.querySelectorAll('.view-place.place-coast [data-guest-life-waiting]').length===2);
  assert((await scene.locator('.place-life-guests-v2-front [data-regular-guest]').count())===0,`Waiting guests ${height}: early Cafe unexpectedly depends on seating regulars`);
  const ids=await scene.locator('[data-guest-life-waiting]').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('data-guest-life-waiting')));
  const expected=await page.evaluate(()=>{
    const profiles=['mika','nora','sam'],state=JSON.parse(localStorage.getItem('poply-v2-state-1')||'{}'),ids=[];
    for(const order of state.currentOrders||[]){const id=profiles[Math.abs(Number(order.sequence)||0)%profiles.length];if(!ids.includes(id))ids.push(id);if(ids.length===2)break;}
    return ids;
  });
  assert(JSON.stringify(ids)===JSON.stringify(expected),`Waiting guests ${height}: active order identities mismatch ${JSON.stringify({ids,expected})}`);
  const waiting=scene.locator('[data-guest-life-waiting]');
  for(let i=0;i<await waiting.count();i+=1){
    const box=await waiting.nth(i).boundingBox();
    assert(box&&box.width>=24&&box.height>=36,`Waiting guests ${height}: guest ${i} is not visibly rendered ${JSON.stringify(box)}`);
  }
  assert((await scene.locator('[data-guest-life-waiting] animateMotion').count())===0,`Waiting guests ${height}: pre-service guests should wait, not run loops`);
  await assertAboveDock(scene,`Waiting guests Place ${height}`);
  await assertNoScroll(`Waiting guests ${height}`);
  await shot(`355-active-order-guests-place-390x${height}`);
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
  assert((await scene.locator('[data-guest-life-waiting]').count())===0,`Regular Place ${height}: already seated regulars were duplicated as waiting order guests`);
  await assertAboveDock(scene,`Regular Place scene ${height}`);
  await assertNoScroll(`Regular Place ${height}`);
  await shot(`351-regular-guests-place-390x${height}`);
};

const inspectArrival=async height=>{
  await go('orders');
  await page.locator('.customer-choice').nth(1).click();
  const card=page.locator('.service-card[data-service-order="order-1"]');
  const deliver=card.locator('[data-order="order-1"]');
  await deliver.waitFor({state:'visible'});
  assert(!(await deliver.isDisabled()),`Guest arrival ${height}: seeded Nora order is not ready`);
  await deliver.click();
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('poply-v2-state-1')||'{}').guestVisits?.nora===3);

  // Human navigation is not instant. The served guest must still be waiting while the player remains on Orders.
  await page.waitForTimeout(1600);
  assert((await pendingGuests()).includes('nora'),`Guest arrival ${height}: Nora was lost before Place navigation`);

  // Simulate the reload boundary an automatic installed-PWA release update can cause.
  await page.reload({waitUntil:'networkidle'});
  await applyInsets();
  await page.waitForTimeout(220);
  assert((await pendingGuests()).includes('nora'),`Guest arrival ${height}: Nora pending arrival did not survive reload`);
  const savedVisits=await page.evaluate(()=>JSON.parse(localStorage.getItem('poply-v2-state-1')||'{}').guestVisits?.nora);
  assert(savedVisits===3,`Guest arrival ${height}: gameplay loyalty changed across reload ${savedVisits}`);

  await go('place');
  const scene=page.locator('.view-place.place-coast .place-scene-svg');
  const walker=scene.locator('.guest-life-arrival[data-guest-life-walker="nora"]');
  await walker.waitFor({state:'visible'});
  assert((await walker.getAttribute('data-guest-life-destination'))==='seat-right',`Guest arrival ${height}: Nora did not route to her rendered seat`);
  assert((await walker.locator('animateMotion').count())===1,`Guest arrival ${height}: motion path missing`);
  assert((await scene.getAttribute('data-guest-life-arrival'))==='nora',`Guest arrival ${height}: scene did not bind arrival identity`);
  assert((await pendingGuests()).includes('nora'),`Guest arrival ${height}: pending marker cleared before visible arrival completed`);
  assert((await scene.locator('[data-guest-life-waiting="nora"]').count())===0,`Guest arrival ${height}: served Nora was duplicated as a waiting guest`);
  await page.waitForTimeout(650);
  await shot(`352-guest-arrival-390x${height}`);

  await page.waitForFunction(()=>document.querySelector('.view-place.place-coast .guest-life-arrival[data-guest-life-walker="nora"]')?.getAttribute('data-guest-life-state')==='arrived');
  await shot(`354-guest-arrived-390x${height}`);
  await page.waitForFunction(()=>!document.querySelector('.view-place.place-coast .guest-life-arrival[data-guest-life-walker="nora"]'));
  assert(!(await pendingGuests()).includes('nora'),`Guest arrival ${height}: completed arrival marker was not consumed`);
  const seated=scene.locator('.place-life-guests-v2-front [data-regular-guest="nora"]');
  await seated.waitFor({state:'visible'});
  const opacity=await seated.evaluate(node=>Number.parseFloat(getComputedStyle(node).opacity));
  assert(opacity>.9,`Guest arrival ${height}: Nora did not settle visibly ${opacity}`);
  const visits=await seated.getAttribute('data-regular-visits');
  assert(visits==='3',`Guest arrival ${height}: seated Nora visit count not refreshed ${visits}`);
  await shot(`353-guest-seated-390x${height}`);
  await assertAboveDock(scene,`Guest arrival Place ${height}`);
  await assertNoScroll(`Guest arrival ${height}`);
};

const inspectReducedMotion=async height=>{
  await seed({stage:5,fulfill:false});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.evaluate(()=>document.dispatchEvent(new CustomEvent('poply:guest-served',{detail:{guestId:'nora',visits:3,source:'qa'}})));
  await go('place');
  const scene=page.locator('.view-place.place-coast .place-scene-svg');
  await page.waitForFunction(()=>document.querySelector('.view-place.place-coast .place-life-guests-v2-front [data-regular-guest="nora"]'));
  await page.waitForTimeout(180);
  assert((await scene.locator('.guest-life-arrival animateMotion').count())===0,`Reduced motion ${height}: travel animation was created`);
  const opacity=await scene.locator('.place-life-guests-v2-front [data-regular-guest="nora"]').evaluate(node=>Number.parseFloat(getComputedStyle(node).opacity));
  assert(opacity>.9,`Reduced motion ${height}: final seated guest is hidden`);
  assert(!(await pendingGuests()).includes('nora'),`Reduced motion ${height}: completed pending marker remained`);
  await page.emulateMedia({reducedMotion:'no-preference'});
};

const inspectCounterRoute=async()=>{
  await seed({stage:2,fulfill:false,visits:{mika:1,nora:1,sam:0}});
  await page.evaluate(()=>document.dispatchEvent(new CustomEvent('poply:guest-served',{detail:{guestId:'nora',visits:2,source:'qa'}})));
  await go('place');
  const walker=page.locator('.view-place.place-coast .guest-life-arrival[data-guest-life-walker="nora"]');
  await walker.waitFor({state:'visible'});
  assert((await walker.getAttribute('data-guest-life-destination'))==='counter','Counter-only Cafe did not route served guest to counter');
};

let report={},failure=null;
try{
  await page.goto(baseURL,{waitUntil:'networkidle'});
  for(const height of [844,720]){
    await page.setViewportSize({width:390,height});
    await inspectWaitingOrders(height);
    await seed();
    await inspectOrders(height);
    await inspectPlace(height);
    await inspectArrival(height);
    await inspectReducedMotion(height);
  }
  await page.setViewportSize({width:390,height:844});
  await inspectCounterRoute();
  report={viewports:['390x844','390x720'],guestVisits:{mika:5,nora:2,sam:1},activeOrderGuestsVisibleBeforeService:true,earlyCafeWithoutSeatingCovered:true,preServiceWaitingCount:2,preferenceVisible:true,nextLoyaltyPayoffVisible:true,regularsInPlace:true,realServiceArrival:true,humanNavigationDelayMs:1600,reloadBeforePlace:true,pendingArrivalReloadSafe:true,seatsFollowBuiltFurniture:true,reducedMotionSafe:true,gameplaySaveSchemaUnchanged:true,screenshots:12};
  if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){failure=error;try{await shot('359-regular-guests-failure');}catch{}}
finally{await writeFile(`${outDir}/regular-guests-report.json`,JSON.stringify({report,problems,failure:failure?.message||null},null,2));await browser.close();}
if(failure)throw failure;
console.log('Regular guests WebKit QA passed.');