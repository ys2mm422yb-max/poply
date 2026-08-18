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
const box=async locator=>{const value=await locator.boundingBox();assert(value,`missing geometry for ${locator}`);return value;};
const applyInsets=()=>page.evaluate(({top,bottom})=>{document.documentElement.style.setProperty('--poply-safe-top',`${top}px`);document.documentElement.style.setProperty('--poply-safe-bottom',`${bottom}px`);},{top:SAFE_TOP,bottom:SAFE_BOTTOM});
const assertNoScroll=async label=>{const m=await page.evaluate(()=>({scroll:document.documentElement.scrollHeight,inner:innerHeight}));assert(m.scroll<=m.inner+1,`${label}: document scrolls ${JSON.stringify(m)}`);};
const assertAboveDock=async(locator,label,clearance=4)=>{const [item,nav]=await Promise.all([box(locator),box(page.locator('.main-nav'))]);assert(item.y+item.height<=nav.y-clearance,`${label}: overlaps dock ${JSON.stringify({item,nav})}`);};
const go=async view=>{await page.locator(`.nav-tab[data-view="${view}"]`).click();await page.waitForSelector(`.view-${view}`);await page.waitForTimeout(140);};

const seed=async()=>{
  await page.evaluate(async()=>{
    const game=await import('./src/v2-game.js');
    const state=game.createInitialState();
    state.placeUpgrades=['lights','counter','menu','seating'];
    state.stars=10;
    state.stats=state.stats||{};state.stats.orders=3;
    state.serviceCallState={nextAt:3,orderId:null,mode:null,generatorProgress:0,callsCompleted:0,callsExpired:0};
    const order=state.currentOrders[0];
    state.board=state.board.map(item=>item?.kind==='generator'?item:null);
    let slot=state.board.findIndex(item=>item===null),serial=0;
    for(const req of order.requirements){
      for(let index=0;index<req.qty;index++){
        while(slot<state.board.length&&state.board[slot]!==null)slot++;
        if(slot>=state.board.length)throw new Error('QA board fixture ran out of slots');
        state.board[slot]=game.makeItem(req.family,req.level,`gameplay-first-${serial++}`);slot++;
      }
    }
    const last=order.requirements.at(-1);
    const remove=state.board.findIndex(item=>item?.kind==='item'&&item.family===last.family&&item.level===last.level);
    if(remove>=0)state.board[remove]=null;
    state.discoveries=[
      'item:coffee:1','item:coffee:2','item:coffee:3',
      'item:bakery:1','item:bakery:2','item:bakery:3','item:bakery:4',
      'item:sweet:1','item:sweet:2','item:sweet:3',
      'place:coast','generator:coffee-gen','generator:pantry-gen'
    ];
    localStorage.setItem('poply-v2-state-1',JSON.stringify(state));
    localStorage.setItem('poply-v2-state-1-backup',JSON.stringify(state));
  });
  await page.reload({waitUntil:'networkidle'});await applyInsets();await page.waitForTimeout(120);
};

const activateDirect=async height=>{
  await go('orders');
  const view=page.locator('.view-orders'),readyCard=view.locator(':scope > .service-card'),readyAction=readyCard.locator('.service-missing-action');
  await readyAction.waitFor({state:'visible'});
  const [viewBox,cardBox]=await Promise.all([box(view),box(readyCard)]);
  assert(cardBox.height<=Math.min(190,viewBox.height*.32),`Orders Ruf-ready ${height}: selected task card stretches into dead dashboard space ${JSON.stringify({viewBox,cardBox})}`);
  assert(((await readyAction.textContent())||'').includes('Auf dem Board herstellen'),`Orders Ruf-ready ${height}: missing-item next action is not primary`);
  const choice=page.locator('.service-call-choice-panel.is-ready [data-service-call-mode="direct"]').first();
  await choice.waitFor({state:'visible'});await choice.click();
  await page.waitForSelector('.view-orders.has-service-call-active');await page.waitForTimeout(160);
};

const inspectOrders=async height=>{
  const view=page.locator('.view-orders'),card=view.locator('.service-card.has-service-call'),action=card.locator('.service-missing-action'),panel=card.locator('.service-call-panel.is-active');
  await action.waitFor({state:'visible'});
  const actionText=((await action.textContent())||'').replace(/\s+/g,' ');
  assert(actionText.includes('Auf dem Board herstellen'),`Orders active Direct missing item ${height}: Board next action missing: ${actionText}`);
  assert(!(await action.isDisabled()),`Orders active Direct missing item ${height}: next action is disabled`);
  assert((await card.locator(':scope > .service-deliver[data-order]').count())===0,`Orders active Direct missing item ${height}: stale delivery action remains`);
  const [viewBox,cardBox,panelBox]=await Promise.all([box(view),box(card),box(panel)]);
  assert(cardBox.height<=Math.min(235,viewBox.height*.43),`Orders active Direct missing item ${height}: selected task card dominates screen ${JSON.stringify({viewBox,cardBox})}`);
  assert(panelBox.height<=58,`Orders active Direct missing item ${height}: Ruf context is too tall ${JSON.stringify(panelBox)}`);
  await assertAboveDock(action,`Orders missing-item Board action ${height}`,6);
  await assertNoScroll(`Orders active Direct missing item ${height}`);
  await shot(`210-gameplay-orders-direct-missing-390x${height}`);
  await action.click();await page.waitForSelector('.view-board');await page.waitForTimeout(160);
};

const inspectBoard=async height=>{
  const view=page.locator('.view-board'),strip=view.locator(':scope > .service-call-strip'),mission=view.locator(':scope > .mission-card'),jobs=view.locator(':scope > .board-jobs'),area=view.locator(':scope > .board-area'),frame=area.locator('.board-frame');
  await strip.waitFor({state:'visible'});
  const [viewBox,stripBox,missionBox,jobsBox,areaBox,frameBox]=await Promise.all([box(view),box(strip),box(mission),box(jobs),box(area),box(frame)]);
  const metaHeight=areaBox.y-viewBox.y;
  assert(stripBox.height<=40,`Board active Direct ${height}: Ruf meta too tall ${JSON.stringify(stripBox)}`);
  assert(missionBox.height<=34,`Board active Direct ${height}: Place objective too tall ${JSON.stringify(missionBox)}`);
  assert(jobsBox.height<=46,`Board active Direct ${height}: guest row too tall ${JSON.stringify(jobsBox)}`);
  assert(metaHeight<=viewBox.height*.24,`Board active Direct ${height}: dashboard chrome still owns too much screen ${JSON.stringify({viewBox,metaHeight})}`);
  assert(Math.abs(frameBox.width-frameBox.height)<=2,`Board active Direct ${height}: workbench is not square ${JSON.stringify(frameBox)}`);
  assert(frameBox.height>=Math.min(355,height*.46),`Board active Direct ${height}: workbench is not visually primary ${JSON.stringify(frameBox)}`);
  await assertAboveDock(frame,`Board workbench ${height}`,5);
  await assertNoScroll(`Board active Direct ${height}`);
  await shot(`211-gameplay-board-direct-390x${height}`);
};

const inspectCollection=async height=>{
  await go('collection');
  const view=page.locator('.view-collection'),hero=view.locator('.collection-hero'),families=view.locator('.collection-families'),grid=view.locator('.collection-tier-grid'),world=view.locator('.collection-world');
  const total=((await view.locator('.collection-total strong').textContent())||'').trim();
  const coffee=((await view.locator('[data-collection-family="coffee"]').textContent())||'').replace(/\s+/g,' ');
  assert(total==='10/30',`collection drinks 3/6 ${height}: total should be 10/30, got ${total}`);
  assert(coffee.includes('3/6'),`collection drinks 3/6 ${height}: coffee family count missing: ${coffee}`);
  const [viewBox,heroBox,familyBox,gridBox,worldBox]=await Promise.all([box(view),box(hero),box(families),box(grid),box(world)]);
  assert(heroBox.height<=60,`collection drinks 3/6 ${height}: statistics hero still dominates ${JSON.stringify(heroBox)}`);
  assert(familyBox.height<=42,`collection drinks 3/6 ${height}: family tabs too tall ${JSON.stringify(familyBox)}`);
  assert(worldBox.height<=44,`collection drinks 3/6 ${height}: world unlock rail too tall ${JSON.stringify(worldBox)}`);
  assert(gridBox.height>=viewBox.height*.5,`collection drinks 3/6 ${height}: discovery cards are not primary ${JSON.stringify({viewBox,gridBox})}`);
  assert((await view.locator('.collection-tier.discovered').count())===3,`collection drinks 3/6 ${height}: expected three discovered coffee cards`);
  await assertAboveDock(world,`Collection world rail ${height}`,4);
  await assertNoScroll(`collection drinks 3/6 ${height}`);
  await shot(`212-gameplay-collection-coffee-3of6-390x${height}`);
};

const inspectPlace=async height=>{
  await go('place');
  const view=page.locator('.view-place'),hero=view.locator('.world-hero'),command=view.locator('.place-command'),goal=view.locator('.place-current-goal'),journey=view.locator('.journey-wrap');
  const text=((await goal.textContent())||'').replace(/\s+/g,' ');
  assert(text.includes('Meerterrasse')&&text.includes('10/11'),`Place 10/11 ${height}: expected Meerterrasse state missing: ${text}`);
  assert(text.includes('NÄCHSTER AUSBAU'),`Place 10/11 ${height}: compact objective label missing: ${text}`);
  const [viewBox,heroBox,commandBox,goalBox,journeyBox]=await Promise.all([box(view),box(hero),box(command),box(goal),box(journey)]);
  assert(goalBox.height<=98,`Place 10/11 ${height}: objective ticket too tall ${JSON.stringify(goalBox)}`);
  assert(journeyBox.height<=12,`Place 10/11 ${height}: secondary progress rail too tall ${JSON.stringify(journeyBox)}`);
  assert(heroBox.height>=viewBox.height*.7,`Place 10/11 ${height}: café scene is no longer primary ${JSON.stringify({viewBox,heroBox,commandBox})}`);
  await assertAboveDock(journey,`Place slim progress ${height}`,4);
  await assertNoScroll(`Place 10/11 ${height}`);
  await shot(`213-gameplay-place-10of11-390x${height}`);
};

let report={},failure=null;
try{
  await page.goto(baseURL,{waitUntil:'networkidle'});
  for(const height of [844,720]){
    await page.setViewportSize({width:390,height});
    await seed();
    await activateDirect(height);
    await inspectOrders(height);
    await inspectBoard(height);
    await inspectCollection(height);
    await inspectPlace(height);
  }
  report={viewports:['390x844','390x720'],safeInsets:{top:SAFE_TOP,bottom:SAFE_BOTTOM},screenshots:8,states:['Orders Ruf-ready compact precondition','Orders active Direct missing item','Board active Direct','collection drinks 3/6','Place 10/11']};
  if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){failure=error;try{await shot('219-gameplay-first-failure');}catch{}}
finally{await writeFile(`${outDir}/gameplay-first-report.json`,JSON.stringify({report,problems,failure:failure?.message||null},null,2));await browser.close();}
if(failure)throw failure;
console.log('Gameplay-first real-device WebKit QA passed.');
