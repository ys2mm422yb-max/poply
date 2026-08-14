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
const goal=(state,type)=>state.daily.goals.find(entry=>entry.type===type);
const assertSheetFits=async label=>{
  const m=await page.evaluate(()=>{const box=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,height:r.height};};return {h:visualViewport?.height||innerHeight,sheet:box('.daily-sheet'),nav:box('.main-nav'),scroll:document.documentElement.scrollHeight,inner:innerHeight};});
  assert(m.sheet&&m.nav,`${label}: daily sheet/nav missing`);assert(m.sheet.top>=0,`${label}: daily sheet clipped at top ${JSON.stringify(m)}`);assert(m.sheet.bottom<=m.nav.top+1,`${label}: daily sheet overlaps navigation ${JSON.stringify(m)}`);assert(m.scroll<=m.inner+1,`${label}: document scrolls ${JSON.stringify(m)}`);return m;
};
let report={},failure=null;

try{
  await page.goto(baseURL,{waitUntil:'networkidle'});
  await page.evaluate(async()=>{
    const game=await import('./src/v2-game.js');const daily=await import('./src/aaa-daily.js');
    const state=game.createInitialState(),dateKey=daily.localDateKey();
    state.coins=200;state.stars=0;
    state.daily={dateKey,goals:[
      {id:'goal-merge-0',type:'merge',label:'1 Item mergen',target:1,progress:0,claimed:false,reward:{coins:10}},
      {id:'goal-serve-1',type:'serve',label:'1 Gast bedienen',target:1,progress:0,claimed:false,reward:{coins:20}},
      {id:'goal-generate-2',type:'generate',label:'1 Item produzieren',target:1,progress:0,claimed:false,reward:{coins:30}}
    ],bonus:{id:`daily-bonus-${dateKey}`,title:'Tagesgast · Weizen',sequence:999,requirements:[{family:'bakery',level:1,qty:1}],rewards:{coins:100,stars:2},served:false}};
    localStorage.setItem('poply-v2-state-1',JSON.stringify(state));
  });
  await page.reload({waitUntil:'networkidle'});await page.waitForSelector('.view-board');

  const from=page.locator('[data-index="9"]'),to=page.locator('[data-index="10"]'),a=await from.boundingBox(),b=await to.boundingBox();assert(a&&b,'merge cells missing');
  await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:8});await page.mouse.up();await page.waitForTimeout(220);
  let state=await readSave();assert(goal(state,'merge').progress===1,'real board merge did not progress daily merge goal');

  await page.locator('.nav-tab[data-view="orders"]').click();await page.waitForSelector('.view-orders');
  const serve=page.locator('[data-order="order-0"]');assert(await serve.isEnabled(),'merged coffee should make order-0 ready');await serve.click();await page.waitForTimeout(520);
  state=await readSave();assert(goal(state,'serve').progress===1,'real order delivery did not progress daily serve goal');

  await page.locator('.nav-tab[data-view="board"]').click();await page.waitForSelector('.view-board');
  await page.locator('[data-index="0"]').evaluate(element=>element.click());await page.waitForTimeout(180);
  state=await readSave();assert(goal(state,'generate').progress===1,'real generator action did not progress daily generate goal');

  await page.locator('.nav-tab[data-view="orders"]').click();await page.waitForSelector('.daily-ribbon');
  assert((await page.locator('.daily-ribbon').textContent())?.includes('3/3 ZIELE'),'daily ribbon does not show completed goals');await page.locator('.daily-ribbon').click();await page.waitForSelector('.daily-sheet');await assertSheetFits('390x844 daily');await shot('50-daily-goals-ready');

  const beforeClaims=(await readSave()).coins;
  for(const id of ['goal-merge-0','goal-serve-1','goal-generate-2']){const button=page.locator(`[data-daily-claim="${id}"]`);assert(await button.isVisible(),`claim button missing for ${id}`);await button.click();await page.waitForTimeout(100);}
  state=await readSave();assert(state.coins===beforeClaims+60,`daily claims did not pay exactly 60 Coins: ${state.coins-beforeClaims}`);assert(state.daily.goals.every(entry=>entry.claimed),'not all daily goals persisted as claimed');

  const beforeBonus={coins:state.coins,stars:state.stars,orders:state.stats.orders,bakery:state.board.filter(item=>item?.kind==='item'&&item.family==='bakery'&&item.level===1).length};
  const bonusButton=page.locator('[data-daily-serve]');assert(await bonusButton.isEnabled(),'seeded daily guest should be ready');await bonusButton.click();await page.waitForTimeout(260);
  state=await readSave();const afterBakery=state.board.filter(item=>item?.kind==='item'&&item.family==='bakery'&&item.level===1).length;
  assert(state.daily.bonus.served===true,'daily bonus guest not persisted as served');assert(state.coins===beforeBonus.coins+100,'daily bonus did not pay exactly 100 Coins');assert(state.stars===beforeBonus.stars+2,'daily bonus did not pay exactly 2 Stars');assert(state.stats.orders===beforeBonus.orders+1,'daily bonus did not count as a served guest');assert(afterBakery===beforeBonus.bakery-1,'daily bonus did not consume exactly one required item');
  await shot('51-daily-bonus-served');

  await page.setViewportSize({width:390,height:720});await page.waitForTimeout(140);if(!(await page.locator('.daily-sheet').isVisible()))await page.locator('.daily-ribbon').click();await assertSheetFits('390x720 daily');await shot('52-daily-short-safari');
  await page.reload({waitUntil:'networkidle'});state=await readSave();assert(state.daily.goals.every(entry=>entry.claimed)&&state.daily.bonus.served,'daily completion was lost after reload');
  report={dateKey:state.daily.dateKey,coins:state.coins,stars:state.stars,claimed:state.daily.goals.filter(entry=>entry.claimed).length,bonusServed:state.daily.bonus.served};
  if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){failure=error;try{await shot('59-daily-failure');}catch{}}
finally{await writeFile(`${outDir}/daily-report.json`,JSON.stringify({report,problems,failure:failure?.message||null},null,2));await browser.close();}
if(failure)throw failure;
console.log('Daily Goals WebKit QA passed.');
