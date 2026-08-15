import { webkit } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const baseURL=process.env.QA_BASE_URL||'http://127.0.0.1:4173',outDir=process.env.QA_OUT_DIR||'qa-artifacts';
await mkdir(outDir,{recursive:true});
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},screen:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:'de-DE'});
const page=await context.newPage(),problems=[];
page.on('console',msg=>{if(['error','warning'].includes(msg.type()))problems.push(`${msg.type()}: ${msg.text()}`)});page.on('pageerror',error=>problems.push(`pageerror: ${error.message}`));
const assert=(value,message)=>{if(!value)throw new Error(message)},shot=name=>page.screenshot({path:`${outDir}/${name}.png`,fullPage:false});
const save=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('poply-v2-state-1')||'null'));
const fit=async label=>{const m=await page.evaluate(()=>{const s=document.querySelector('.player-progress-sheet')?.getBoundingClientRect(),n=document.querySelector('.main-nav')?.getBoundingClientRect();return s&&n?{sheet:{top:s.top,bottom:s.bottom,left:s.left,right:s.right},nav:{top:n.top,bottom:n.bottom},h:visualViewport?.height||innerHeight,scroll:document.documentElement.scrollHeight,inner:innerHeight}:null});assert(m,`${label}: sheet/nav missing`);assert(m.sheet.left>=0&&m.sheet.right<=390,`${label}: sheet clips horizontally ${JSON.stringify(m)}`);assert(m.sheet.bottom<=m.nav.top+1,`${label}: sheet overlaps nav ${JSON.stringify(m)}`);assert(m.nav.bottom<=m.h+1,`${label}: nav clips ${JSON.stringify(m)}`);assert(m.scroll<=m.inner+1,`${label}: document scrolls ${JSON.stringify(m)}`);return m};
let report={},failure=null;
try{
  await page.goto(baseURL,{waitUntil:'networkidle'});
  await page.evaluate(async()=>{const game=await import('./src/v2-game.js');const state=game.createInitialState();state.playerXp=120;state.stats.orders=1;state.stats.merges=20;state.placeUpgrades=['lights','counter','menu'];state.discoveries=['item:coffee:1','item:coffee:2'];localStorage.setItem('poply-v2-state-1',JSON.stringify(state));});
  await page.reload({waitUntil:'networkidle'});await page.waitForSelector('.player-level-badge');
  const before=await save();await page.locator('.player-level-badge').click();await page.waitForSelector('.player-progress-sheet');
  const focus=page.locator('.milestone-row[aria-current="step"]');assert(await focus.count()===1,'exactly one current milestone focus is required');
  const sheetText=await page.locator('.player-progress-sheet').textContent(),focusText=await focus.textContent();
  assert(sheetText?.includes('ALS NÄCHSTES')&&sheetText?.includes('Merge-Rhythm'),`next milestone recommendation missing: ${sheetText}`);
  assert(focusText?.includes('Nächstes')&&focusText?.includes('20/25'),`focused milestone row is not actionable: ${focusText}`);
  assert(!sheetText?.includes('Alle geschafft'),'incomplete focus state incorrectly claims all milestones complete');
  const tall=await fit('390x844 milestone focus');await shot('22a-player-milestone-focus-390x844');
  await page.setViewportSize({width:390,height:720});await page.waitForTimeout(100);const short=await fit('390x720 milestone focus');await shot('23a-player-milestone-focus-short-safari');
  const after=await save();assert(after.playerXp===before.playerXp&&after.stats.merges===before.stats.merges&&after.stats.orders===before.stats.orders,'opening milestone focus mutated progression state');
  report={recommended:'Merge-Rhythm',current:'20/25',stateNeutral:true,tall,short};if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){failure=error;try{await shot('29a-milestone-focus-failure')}catch{}}
finally{await writeFile(`${outDir}/milestone-focus-report.json`,JSON.stringify({report,problems,failure:failure?.message||null},null,2));await browser.close()}
if(failure)throw failure;console.log('Milestone focus WebKit QA passed.');
