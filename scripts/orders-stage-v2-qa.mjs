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
page.on('console',message=>{if(['error','warning'].includes(message.type()))problems.push(`${message.type()}: ${message.text()}`);});
page.on('pageerror',error=>problems.push(`pageerror: ${error.message}`));
const assert=(value,message)=>{if(!value)throw new Error(message);};
const shot=name=>page.screenshot({path:`${outDir}/${name}.png`,fullPage:false});
const box=async locator=>{const value=await locator.boundingBox();assert(value,`missing geometry for ${locator}`);return value;};
const applyInsets=()=>page.evaluate(({top,bottom})=>{document.documentElement.style.setProperty('--poply-safe-top',`${top}px`);document.documentElement.style.setProperty('--poply-safe-bottom',`${bottom}px`);},{top:SAFE_TOP,bottom:SAFE_BOTTOM});
const assertNoScroll=async label=>{const metrics=await page.evaluate(()=>({scroll:document.documentElement.scrollHeight,inner:innerHeight}));assert(metrics.scroll<=metrics.inner+1,`${label}: document scrolls ${JSON.stringify(metrics)}`);};
const assertAboveDock=async(locator,label,clearance=5)=>{const [item,nav]=await Promise.all([box(locator),box(page.locator('.main-nav'))]);assert(item.y+item.height<=nav.y-clearance,`${label}: overlaps dock ${JSON.stringify({item,nav})}`);};

const seed=async ready=>{
  await page.evaluate(async readyState=>{
    const game=await import('./src/v2-game.js');
    const state=game.createInitialState();
    state.placeUpgrades=['lights','counter','menu'];
    state.stars=8;
    state.stats=state.stats||{};
    const order=state.currentOrders[1];
    state.board=state.board.map(item=>item?.kind==='generator'?item:null);
    let slot=state.board.findIndex(item=>item===null),serial=0;
    for(const req of order.requirements){
      for(let count=0;count<req.qty;count+=1){
        while(slot<state.board.length&&state.board[slot]!==null)slot+=1;
        if(slot>=state.board.length)throw new Error('Orders Stage V2 fixture ran out of board slots');
        state.board[slot]=game.makeItem(req.family,req.level,`orders-stage-${serial++}`);
        slot+=1;
      }
    }
    if(!readyState){
      const req=order.requirements.at(-1);
      const index=state.board.findIndex(item=>item?.kind==='item'&&item.family===req.family&&item.level===req.level);
      if(index>=0)state.board[index]=null;
    }
    localStorage.setItem('poply-v2-state-1',JSON.stringify(state));
    localStorage.setItem('poply-v2-state-1-backup',JSON.stringify(state));
  },ready);
  await page.reload({waitUntil:'networkidle'});
  await applyInsets();
  await page.locator('.nav-tab[data-view="orders"]').click();
  await page.waitForSelector('.view-orders');
  await page.locator('.customer-choice').nth(1).click();
  await page.waitForTimeout(180);
};

const inspectStage=async(height,ready)=>{
  const view=page.locator('.view-orders'),card=view.locator('.service-card[data-service-order]'),stage=card.locator(':scope > .orders-stage-set');
  const deliver=card.locator('.service-deliver[data-order]'),missingAction=card.locator('.service-missing-action');
  await stage.waitFor({state:'visible'});
  assert((await view.getAttribute('data-service-primary'))==='bakery',`Orders Stage ${height}: expected bakery primary family`);
  assert((await view.getAttribute('data-service-secondary'))==='coffee',`Orders Stage ${height}: expected coffee secondary family`);
  assert((await stage.locator('.orders-stage-lamp').count())===2,`Orders Stage ${height}: expected two authored lamps`);
  assert((await stage.locator('.orders-stage-glint').count())===4,`Orders Stage ${height}: expected four stage glints`);
  assert((await card.evaluate(node=>getComputedStyle(node).overflow))==='hidden',`Orders Stage ${height}: decorative scene escapes service card`);
  assert(ready?(await card.evaluate(node=>node.classList.contains('ready'))):!(await card.evaluate(node=>node.classList.contains('ready'))),`Orders Stage ${height}: wrong ready state`);
  if(ready){
    await deliver.waitFor({state:'visible'});
    assert(!(await deliver.isDisabled()),`Orders Stage ${height}: ready delivery control is disabled`);
    assert((await missingAction.count())===0,`Orders Stage ${height}: stale missing-item action remains in ready state`);
  }else{
    await missingAction.waitFor({state:'visible'});
    const actionText=((await missingAction.textContent())||'').replace(/\s+/g,' ');
    assert(actionText.includes('Auf dem Board herstellen'),`Orders Stage ${height}: missing-item Board action is not primary: ${actionText}`);
    assert(!(await missingAction.isDisabled()),`Orders Stage ${height}: missing-item Board action is disabled`);
    assert((await deliver.count())===0,`Orders Stage ${height}: stale delivery control remains in missing-item state`);
  }
  await assertAboveDock(card,`Orders Stage card ${height}`,6);
  await assertNoScroll(`Orders Stage ${ready?'ready':'missing'} ${height}`);
  await shot(`${ready?'331-orders-stage-ready':'330-orders-stage-missing'}-390x${height}`);
};

const inspectReward=async height=>{
  const deliver=page.locator('.view-orders .service-card .service-deliver[data-order]');
  await deliver.click();
  await page.waitForTimeout(690);
  const coin=page.locator('.resource.coin'),goal=page.locator('.view-orders .service-goal');
  assert(await coin.evaluate(node=>node.classList.contains('fx-reward-arrive')),`Orders reward ${height}: Coin arrival feedback missing`);
  assert(await goal.evaluate(node=>node.classList.contains('fx-reward-arrive')),`Orders reward ${height}: Star/goal arrival feedback missing`);
  assert((await page.locator('.service-reward-origin').count())>=1,`Orders reward ${height}: reward origin missing during payoff`);
  await assertAboveDock(page.locator('.view-orders .service-card'),`Orders reward replacement card ${height}`,6);
  await assertNoScroll(`Orders reward ${height}`);
  await shot(`332-orders-stage-reward-390x${height}`);
};

let report={},failure=null;
try{
  await page.goto(baseURL,{waitUntil:'networkidle'});
  for(const height of [844,720]){
    await page.setViewportSize({width:390,height});
    await seed(false);await inspectStage(height,false);
    await seed(true);await inspectStage(height,true);await inspectReward(height);
  }
  report={viewports:['390x844','390x720'],safeInsets:{top:SAFE_TOP,bottom:SAFE_BOTTOM},screenshots:6,familyAware:true,missingBoardAction:true,readyPayoff:true,rewardArrival:true,noDocumentScroll:true};
  if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){failure=error;try{await shot('339-orders-stage-v2-failure');}catch{}}
finally{await writeFile(`${outDir}/orders-stage-v2-report.json`,JSON.stringify({report,problems,failure:failure?.message||null},null,2));await browser.close();}
if(failure)throw failure;
console.log('Orders Stage V2 WebKit QA passed.');
