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
const shot=name=>page.screenshot({path:`${outDir}/${name}.png`,fullPage:false});
const readSave=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('poply-v2-state-1')||'null'));
const assertFits=async label=>{const m=await page.evaluate(()=>{const e=document.querySelector('.place-map-sheet');const b=e?.getBoundingClientRect();return {h:window.visualViewport?.height||innerHeight,bottom:b?.bottom,top:b?.top,scroll:document.documentElement.scrollHeight,inner:innerHeight};});assert(m.bottom<=m.h+1,`${label}: map clipped ${JSON.stringify(m)}`);assert(m.top>=0,`${label}: map starts above viewport ${JSON.stringify(m)}`);assert(m.scroll<=m.inner+1,`${label}: document scrolls ${JSON.stringify(m)}`);};
let report={},failure=null;
try{
  await page.goto(baseURL,{waitUntil:'networkidle'});
  await page.evaluate(async()=>{const game=await import('./src/v2-game.js');const state=game.createInitialState();state.placeUpgrades=[...game.PLACE_01_UPGRADES.map(u=>u.id),game.PLACE_02_UPGRADES[0].id,game.PLACE_02_UPGRADES[1].id];state.stars=37;state.coins=555;localStorage.setItem('poply-v2-state-1',JSON.stringify(state));});
  await page.reload({waitUntil:'networkidle'});await page.locator('.nav-tab[data-view="place"]').click();await page.waitForSelector('.view-place');
  const before=await readSave();
  await page.locator('[data-action="place-map"]').click();await page.waitForSelector('.place-map-sheet');await assertFits('390x844 map');
  assert(await page.locator('[data-map-place="coast"]').isEnabled(),'completed coast must be revisitable');assert(await page.locator('[data-map-place="sunset"]').isEnabled(),'sunset must be unlocked');
  assert((await page.locator('[data-map-place="sunset"] small').textContent())?.includes('2/6'),'sunset progress missing');
  await shot('60-place-map-390x844');
  await page.locator('[data-map-place="coast"]').click();assert((await page.locator('.place-map-preview h3').textContent())==='Café am Meer','coast preview did not open');assert((await page.locator('.place-map-preview').textContent())?.includes('vollständig restauriert'),'completed coast status missing');
  await shot('61-place-map-coast-revisit');
  const after=await readSave();assert(JSON.stringify(after)===JSON.stringify(before),'opening/revisiting map must not mutate saved Board/meta state');
  await page.setViewportSize({width:390,height:720});await page.waitForTimeout(100);await assertFits('390x720 map');await shot('62-place-map-short-safari');
  await page.locator('[data-place-map-close]').last().click();assert(await page.locator('.place-map-sheet').count()===0,'map did not close');
  report={coastProgress:'6/6',sunsetProgress:'2/6',saveUnchanged:true};if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){failure=error;try{await shot('69-place-map-failure');}catch{}}
finally{await writeFile(`${outDir}/place-map-report.json`,JSON.stringify({report,problems,failure:failure?.message||null},null,2));await browser.close();}
if(failure)throw failure;console.log('Place map WebKit QA passed.');
