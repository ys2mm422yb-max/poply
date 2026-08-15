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
const readSave=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('poply-v2-state-1')||'null'));
const shot=name=>page.screenshot({path:`${outDir}/${name}.png`,fullPage:false});
const assertPlanFits=async label=>{
  const metrics=await page.evaluate(()=>{const p=document.querySelector('[data-energy-plan]'),n=document.querySelector('.main-nav');if(!p||!n)return null;const a=p.getBoundingClientRect(),b=n.getBoundingClientRect();return {plan:{top:a.top,bottom:a.bottom,left:a.left,right:a.right},nav:{top:b.top,bottom:b.bottom},height:window.visualViewport?.height||innerHeight,scrollHeight:document.documentElement.scrollHeight,innerHeight};});
  assert(metrics,`${label}: reserve plan missing`);assert(metrics.plan.left>=0&&metrics.plan.right<=390,`${label}: reserve plan clips horizontally ${JSON.stringify(metrics)}`);assert(metrics.plan.top>=0&&metrics.plan.bottom<=metrics.nav.top+1,`${label}: reserve plan overlaps navigation ${JSON.stringify(metrics)}`);assert(metrics.scrollHeight<=metrics.innerHeight+1,`${label}: reserve plan introduces document scroll ${JSON.stringify(metrics)}`);return metrics;
};
let report={},failure=null;
try{
  await page.goto(baseURL,{waitUntil:'networkidle'});
  await page.evaluate(async()=>{
    const game=await import('./src/v2-game.js');
    const state=game.createInitialState();state.maxEnergy=55;state.energy=55;state.energyReserve=0;state.energyUpdatedAt=Date.now()-6*60*1000;
    localStorage.setItem('poply-v2-state-1',JSON.stringify(state));
  });
  await page.reload({waitUntil:'networkidle'});await page.waitForSelector('.resource.energy');await page.waitForTimeout(200);
  const banked=await readSave();
  assert(banked.energy===55&&banked.maxEnergy===55,`earned Max Energy changed while banking reserve: ${banked.energy}/${banked.maxEnergy}`);
  assert(banked.energyReserve===3,`expected 3 reserve points after six minutes at full Energy, got ${banked.energyReserve}`);
  assert((await page.locator('.resource.energy').textContent())?.includes('Reserve 3/8'),'HUD does not expose earned Reserve capacity');
  await page.locator('.resource.energy').click();await page.waitForSelector('[data-energy-plan]');
  const planText=await page.locator('[data-energy-plan]').textContent();
  assert(planText?.includes('ENERGIE-RESERVE')&&planText?.includes('3/8 gespeichert'),`reserve detail missing earned cap: ${planText}`);
  assert(planText?.includes('wächst mit Max-Energie')&&planText?.includes('automatisch zuerst genutzt'),`earned reserve rule missing: ${planText}`);
  await assertPlanFits('390x844 earned reserve');await shot('27-energy-reserve-390x844');
  await page.setViewportSize({width:390,height:720});await page.waitForTimeout(120);await assertPlanFits('390x720 earned reserve');await shot('28-energy-reserve-short-safari');
  await page.locator('.resource.energy').click();

  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(80);
  const beforeSpend=await readSave();const beforeFilled=beforeSpend.board.filter(Boolean).length;
  await page.locator('.board-cell.generator').first().click();await page.waitForTimeout(350);
  const afterSpend=await readSave(),afterFilled=afterSpend.board.filter(Boolean).length;
  assert(afterFilled===beforeFilled+1,`real generator tap did not create one item: ${beforeFilled} -> ${afterFilled}`);
  assert(afterSpend.energy===55&&afterSpend.maxEnergy===55,`reserve did not automatically cover generator spend: ${afterSpend.energy}/${afterSpend.maxEnergy}`);
  assert(afterSpend.energyReserve===2,`reserve was not consumed exactly once: 3 -> ${afterSpend.energyReserve}`);
  await page.reload({waitUntil:'networkidle'});await page.waitForSelector('.resource.energy');
  const reloaded=await readSave();assert(reloaded.energyReserve===2,'Energy reserve was not persisted through reload');
  report={banked:{energy:banked.energy,maxEnergy:banked.maxEnergy,reserve:banked.energyReserve,reserveCap:8},afterGenerator:{energy:afterSpend.energy,maxEnergy:afterSpend.maxEnergy,reserve:afterSpend.energyReserve,boardItems:afterFilled},reloadedReserve:reloaded.energyReserve,problems};
}catch(error){failure=error.stack||String(error);report={...report,problems};}
await writeFile(`${outDir}/energy-reserve-report.json`,JSON.stringify({...report,failure},null,2));
await browser.close();
if(failure){console.error(failure);process.exit(1);}
if(problems.length){console.error(problems.join('\n'));process.exit(1);}
console.log('Energy reserve QA passed');
