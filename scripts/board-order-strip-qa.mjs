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
const rectOverlap=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));

const applyInsets=()=>page.evaluate(({top,bottom})=>{
  document.documentElement.style.setProperty('--poply-safe-top',`${top}px`);
  document.documentElement.style.setProperty('--poply-safe-bottom',`${bottom}px`);
},{top:SAFE_TOP,bottom:SAFE_BOTTOM});

const seed=async()=>{
  await page.evaluate(async()=>{
    const game=await import('./src/v2-game.js');
    const specials=await import('./src/aaa-specials.js');
    let state=specials.ensureServiceSpecials(game.createInitialState()).state;
    state.currentOrders[1].requirements=[{family:'coffee',level:1,qty:1},{family:'bakery',level:1,qty:1}];
    state.currentOrders[2].requirements=[{family:'sweet',level:1,qty:1},{family:'bakery',level:1,qty:1}];
    localStorage.setItem('poply-v2-state-1',JSON.stringify(state));
    localStorage.setItem('poply-v2-state-1-backup',JSON.stringify(state));
  });
  await page.reload({waitUntil:'networkidle'});await applyInsets();await page.waitForTimeout(180);
  if(await page.locator('.nav-tab[data-view="board"]').count())await page.locator('.nav-tab[data-view="board"]').tap();
  await page.waitForSelector('.view-board .board-jobs');await page.waitForTimeout(140);
};

const geometry=()=>page.locator('.board-job').evaluateAll(jobs=>{
  const rect=node=>{const r=node.getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};
  return jobs.map(job=>({
    job:rect(job),
    reward:job.querySelector('.board-job-reward')?rect(job.querySelector('.board-job-reward')):null,
    status:job.querySelector('.board-job-status')?{rect:rect(job.querySelector('.board-job-status')),display:getComputedStyle(job.querySelector('.board-job-status')).display}:null,
    badges:[...job.querySelectorAll('.board-special-badge')].map(node=>({text:node.textContent||'',display:getComputedStyle(node).display,rect:rect(node)})),
    needs:[...job.querySelectorAll('.need')].map(need=>({
      need:rect(need),
      art:need.querySelector('.item-art')?rect(need.querySelector('.item-art')):null,
      amount:need.querySelector('b')?rect(need.querySelector('b')):null,
      amountText:need.querySelector('b')?.textContent||'',
      aria:need.getAttribute('aria-label')||'',
    })),
  }));
});

let report={},failure=null;
try{
  await page.goto(baseURL,{waitUntil:'networkidle'});
  for(const height of [844,720]){
    await page.setViewportSize({width:390,height});await seed();
    const jobs=page.locator('.board-job');assert(await jobs.count()===3,`expected three Board jobs at ${height}`);
    assert(await page.locator('.board-job .board-special-badge').count()===0,`Board special badge leaked into compact strip at ${height}`);
    assert(await page.locator('.board-job .need').count()>=5,`requirements missing from compact strip at ${height}`);
    assert(await page.locator('.board-job:has(.need:nth-child(2))').count()>=2,`two-requirement jobs missing at ${height}`);

    const rows=await geometry();
    rows.forEach((row,jobIndex)=>{
      assert(row.status?.display==='none',`redundant status is visible on Board job ${jobIndex} at ${height}`);
      assert(row.badges.every(badge=>badge.display==='none'),`special badge visible on Board job ${jobIndex} at ${height}`);
      row.needs.forEach((need,needIndex)=>{
        assert(need.art&&need.amount,`Board job ${jobIndex} need ${needIndex} missing art/count at ${height}`);
        assert(need.amountText.includes('/'),`Board job ${jobIndex} need ${needIndex} lost quantity progress at ${height}: ${need.amountText}`);
        assert(need.aria&&!need.aria.includes('?'),`Board job ${jobIndex} need ${needIndex} lost item guidance label at ${height}: ${need.aria}`);
        assert(need.need.left>=row.job.left-1&&need.need.right<=row.job.right+1&&need.need.top>=row.job.top-1&&need.need.bottom<=row.job.bottom+1,`Board job ${jobIndex} need ${needIndex} escapes card at ${height}`);
        assert(rectOverlap(need.art,need.amount)<=0.5,`Board job ${jobIndex} need ${needIndex} count overlaps item art at ${height}: ${JSON.stringify(need)}`);
        if(row.reward)assert(rectOverlap(row.reward,need.need)<=0.5,`Board job ${jobIndex} reward overlaps need ${needIndex} at ${height}`);
      });
    });

    const firstNeed=page.locator('.board-job .need').first();await firstNeed.tap();await page.waitForSelector('.production-guide-sheet');
    const guide=((await page.locator('.production-guide-sheet').textContent())||'').replace(/\s+/g,' ');
    assert(guide.includes('WOHER KOMMT DAS?')&&guide.includes('Generator auf Board zeigen'),`Board need tap lost production guidance at ${height}: ${guide}`);
    await page.locator('[data-guide-close]').last().tap();

    const viewport=await page.evaluate(()=>({scroll:document.documentElement.scrollHeight,inner:innerHeight,visual:window.visualViewport?.height||innerHeight}));
    assert(viewport.scroll<=viewport.inner+1,`Board strip causes document scroll at ${height}: ${JSON.stringify(viewport)}`);
    await shot(`310-board-order-strip-clean-390x${height}`);
  }
  report={viewports:['390x844','390x720'],safeInsets:{top:SAFE_TOP,bottom:SAFE_BOTTOM},screenshots:2,serviceSpecialsStayOutOfBoardStrip:true,twoRequirementGeometry:true,itemGuidanceTap:true};
  if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){failure=error;try{await shot('319-board-order-strip-failure');}catch{}}
finally{await writeFile(`${outDir}/board-order-strip-report.json`,JSON.stringify({report,problems,failure:failure?.message||null},null,2));await browser.close();}
if(failure)throw failure;
console.log('Board order strip WebKit QA passed.');
