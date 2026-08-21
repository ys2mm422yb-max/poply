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
const assertAboveDock=async(locator,label,clearance=1)=>{const [item,nav]=await Promise.all([box(locator),box(page.locator('.main-nav'))]);assert(item.y+item.height<=nav.y-clearance,`${label}: overlaps dock ${JSON.stringify({item,nav})}`);};

const seed=async()=>{
  await page.evaluate(async()=>{
    const game=await import('./src/v2-game.js');
    const state=game.createInitialState();
    state.placeUpgrades=['lights','counter'];
    state.stars=6;
    localStorage.setItem('poply-v2-state-1',JSON.stringify(state));
    localStorage.setItem('poply-v2-state-1-backup',JSON.stringify(state));
  });
  await page.reload({waitUntil:'networkidle'});
  await applyInsets();
};

const inspectFocus=async height=>{
  await page.locator('.nav-tab[data-view="orders"]').click();
  await page.waitForSelector('.view-orders');
  await page.locator('.customer-choice').nth(1).click();
  const card=page.locator('.view-orders .service-card[data-service-order]');
  const theme=card.locator('.service-order-theme');
  await theme.waitFor({state:'visible'});
  assert((await theme.count())===1,`Thematic Orders ${height}: expected exactly one theme card`);
  assert((await theme.getAttribute('data-order-theme'))==='breakfast-prep',`Thematic Orders ${height}: wrong theme identity`);
  const heading=((await card.locator('.service-heading h2').textContent())||'').trim();
  assert(heading==='Frühstück am Fenster',`Thematic Orders ${height}: unexpected focused title ${heading}`);
  const story=((await theme.locator('p').textContent())||'').replace(/\s+/g,' ').trim();
  assert(story.includes('Mehl')&&story.includes('Kaffee'),`Thematic Orders ${height}: story does not explain concrete preparation ${story}`);
  const storyFont=Number.parseFloat(await theme.locator('p').evaluate(node=>getComputedStyle(node).fontSize));
  assert(storyFont>=10.5,`Thematic Orders ${height}: story collapsed to microcopy ${storyFont}px`);
  const needs=card.locator('.service-needs .need');
  assert((await needs.count())===2,`Thematic Orders ${height}: expected two concrete needs`);
  for(let i=0;i<2;i+=1){
    const need=needs.nth(i);
    assert((await need.locator('.item-art').count())===1,`Thematic Orders ${height}: missing real item art at ${i}`);
    assert((await need.getAttribute('role'))==='button',`Thematic Orders ${height}: item ${i} lost tap guidance`);
  }
  await needs.first().click();
  const guide=page.locator('.production-guide-sheet');
  await guide.waitFor({state:'visible'});
  assert(((await guide.locator('h2').textContent())||'').trim().length>0,`Thematic Orders ${height}: item detail has no item name`);
  await page.locator('[data-guide-close]').last().click();
  await assertAboveDock(card,`Thematic Orders focus ${height}`,6);
  await assertNoScroll(`Thematic Orders focus ${height}`);
  await shot(`340-thematic-order-focus-390x${height}`);
};

const inspectBoard=async height=>{
  await page.locator('.nav-tab[data-view="board"]').click();
  await page.waitForSelector('.view-board');
  const jobs=page.locator('.board-jobs .board-job');
  assert((await jobs.count())===3,`Thematic Orders board ${height}: expected three compact jobs`);
  assert((await page.locator('.board-jobs .service-order-theme').count())===0,`Thematic Orders board ${height}: theme microcopy leaked into compact jobs`);
  assert((await page.locator('.board-jobs [data-order-theme]').count())===3,`Thematic Orders board ${height}: jobs missing semantic theme identity`);
  for(let i=0;i<3;i+=1){
    const job=jobs.nth(i);
    assert((await job.locator('.board-job-avatar').count())===1,`Thematic Orders board ${height}: guest missing at ${i}`);
    assert((await job.locator('.board-job-reward').count())===1,`Thematic Orders board ${height}: stars missing at ${i}`);
    assert((await job.locator('.board-job-needs .item-art').count())>=1,`Thematic Orders board ${height}: item art missing at ${i}`);
  }
  await assertAboveDock(page.locator('.board-area'),`Thematic Orders board ${height}`,1);
  await assertNoScroll(`Thematic Orders board ${height}`);
  await shot(`341-thematic-order-board-390x${height}`);
};

let report={},failure=null;
try{
  await page.goto(baseURL,{waitUntil:'networkidle'});
  for(const height of [844,720]){
    await page.setViewportSize({width:390,height});
    await seed();
    await inspectFocus(height);
    await inspectBoard(height);
  }
  report={viewports:['390x844','390x720'],safeInsets:{top:SAFE_TOP,bottom:SAFE_BOTTOM},screenshots:4,thematicFocus:true,realItemArt:true,itemGuidanceTap:true,compactBoardPreserved:true,noDocumentScroll:true};
  if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){failure=error;try{await shot('349-thematic-orders-failure');}catch{}}
finally{await writeFile(`${outDir}/thematic-orders-report.json`,JSON.stringify({report,problems,failure:failure?.message||null},null,2));await browser.close();}
if(failure)throw failure;
console.log('Thematic Orders WebKit QA passed.');
