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
const readSave=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('poply-v2-state-1')||'null'));
const shot=name=>page.screenshot({path:`${outDir}/${name}.png`,fullPage:false});
const assertCollectionFits=async label=>{
  const metrics=await page.evaluate(()=>{const main=document.querySelector('.view-collection'),nav=document.querySelector('.main-nav'),guests=document.querySelector('.collection-guests');if(!main||!nav||!guests)return null;const a=main.getBoundingClientRect(),b=nav.getBoundingClientRect(),g=guests.getBoundingClientRect();return {main:{top:a.top,bottom:a.bottom},nav:{top:b.top,bottom:b.bottom},guests:{top:g.top,bottom:g.bottom,left:g.left,right:g.right},scrollHeight:document.documentElement.scrollHeight,innerHeight};});
  assert(metrics,`${label}: Collection/guest summary missing`);assert(metrics.guests.left>=0&&metrics.guests.right<=390,`${label}: guest summary clips horizontally ${JSON.stringify(metrics)}`);assert(metrics.guests.bottom<=metrics.nav.top+1,`${label}: guest summary overlaps navigation ${JSON.stringify(metrics)}`);assert(metrics.scrollHeight<=metrics.innerHeight+1,`${label}: document scrolls ${JSON.stringify(metrics)}`);return metrics;
};
let report={},failure=null;
try{
  await page.goto(baseURL,{waitUntil:'networkidle'});
  await page.evaluate(async()=>{const game=await import('./src/v2-game.js');const state=game.createInitialState();state.board[9]=game.makeItem('coffee',2,'guest-qa-coffee');state.board[10]=null;state.coins=100;localStorage.setItem('poply-v2-state-1',JSON.stringify(state));});
  await page.reload({waitUntil:'networkidle'});await page.locator('.nav-tab[data-view="orders"]').click();await page.locator('[data-select-order="order-0"]').click();
  const serve=page.locator('button[data-order="order-0"]');assert(await serve.isEnabled(),'seeded first guest order is not ready');await serve.click();
  await page.waitForFunction(()=>{const state=JSON.parse(localStorage.getItem('poply-v2-state-1')||'null');return state?.guestVisits?.mika===1;});
  const served=await readSave();assert(served.guestVisits.mika===1&&served.guestVisits.nora===0&&served.guestVisits.sam===0,`guest visit persisted incorrectly ${JSON.stringify(served.guestVisits)}`);assert(served.coins===170,`first guest reward incorrect: ${served.coins}`);
  await page.locator('.nav-tab[data-view="collection"]').click();await page.waitForSelector('.collection-guests');
  const mika=page.locator('[data-guest-id="mika"]'),text=await mika.textContent();assert(text?.includes('Mika')&&text?.includes('Bekannt · 1')&&text?.includes('4 bis Stammgast'),`Mika loyalty copy wrong: ${text}`);
  await assertCollectionFits('390x844');await shot('70-guest-loyalty-390x844');
  await page.setViewportSize({width:390,height:720});await page.waitForTimeout(120);await assertCollectionFits('390x720');await shot('71-guest-loyalty-short-safari');
  await page.reload({waitUntil:'networkidle'});const reloaded=await readSave();assert(reloaded.guestVisits.mika===1,'guest visit lost after reload');assert(reloaded.coins===170,'guest reward duplicated or lost after reload');
  report={guestVisits:reloaded.guestVisits,coins:reloaded.coins,firstMilestone:'Bekannt',screenshots:['70-guest-loyalty-390x844.png','71-guest-loyalty-short-safari.png']};
  if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){failure=error?.stack||String(error);}
await writeFile(`${outDir}/guest-loyalty-report.json`,JSON.stringify({report,problems,failure},null,2));await browser.close();if(failure){console.error(failure);process.exit(1);}console.log(JSON.stringify(report,null,2));
