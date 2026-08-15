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
const assertNoScroll=async label=>{const m=await page.evaluate(()=>({scroll:document.documentElement.scrollHeight,inner:innerHeight,visual:window.visualViewport?.height||innerHeight}));assert(m.scroll<=m.inner+1,`${label}: document scrolls ${JSON.stringify(m)}`);};
const assertWithin=async(locator,label)=>{const box=await locator.boundingBox(),height=await page.evaluate(()=>window.visualViewport?.height||innerHeight);assert(box&&box.y>=-1&&box.y+box.height<=height+1,`${label} outside viewport ${JSON.stringify(box)}`);};
const reset=async()=>{await page.evaluate(()=>{localStorage.removeItem('poply-v2-state-1');localStorage.removeItem('poply-v2-state-1-backup');});await page.reload({waitUntil:'networkidle'});await page.waitForSelector('.view-board .flow-hud');};
const charge=async()=>{
  await page.evaluate(async()=>{
    const session=await import('./src/aaa-session.js');
    for(const [from,to] of [[9,10],[16,17],[23,24]]){
      const result=session.moveOrMergeAt(from,to);if(!result.changed)throw new Error(`merge failed ${from}->${to}: ${result.reason}`);
    }
  });
  await page.reload({waitUntil:'networkidle'});await page.waitForSelector('.view-board .flow-hud.ready');
};

let report={},failure=null;
try{
  await page.goto(baseURL,{waitUntil:'networkidle'});await reset();
  const startText=(await page.locator('.flow-hud').textContent())||'';
  assert(startText.includes('FLOW')&&startText.includes('0/3'),`fresh Flow HUD wrong: ${startText}`);
  assert(await page.locator('.flow-boost-target').count()===0,'fresh generators already marked boosted');
  await assertWithin(page.locator('.flow-hud'),'fresh Flow HUD');await assertNoScroll('fresh Flow 390x844');await shot('96-merge-flow-start-390x844');

  await charge();
  const readyText=(await page.locator('.flow-hud').textContent())||'';
  assert(readyText.includes('BOOST')&&readyText.includes('Generator wählen'),`ready Flow HUD wrong: ${readyText}`);
  assert(await page.locator('.board-cell.generator.flow-boost-target').count()===2,'not all available opening generators are boost choices');
  assert(await page.locator('.flow-generator-badge').count()===2,'boost badges missing from generator choices');
  await assertWithin(page.locator('.flow-hud'),'ready Flow HUD');await assertNoScroll('ready Flow 390x844');await shot('97-merge-flow-ready-390x844');

  const before=await readSave();await page.locator('.board-cell.generator[data-index="6"]').tap();
  await page.waitForFunction(()=>{const s=JSON.parse(localStorage.getItem('poply-v2-state-1')||'{}');return s.stats?.generated===1&&s.mergeFlow?.boostReady===false&&s.mergeFlow?.boostsUsed===1;});
  const after=await readSave(),drop=after.board.find(item=>item?.id===`bakery-${after.nextId}`);
  assert(after.energy===before.energy-1,`boost cost changed energy unexpectedly ${before.energy}->${after.energy}`);
  assert(drop?.family==='bakery'&&drop?.level===2,`chosen pantry boost did not create tier-2 bakery ${JSON.stringify(drop)}`);
  assert(((await page.locator('.flow-hud').textContent())||'').includes('0/3'),'Flow HUD did not reset after consuming boost');
  assert(await page.locator('.flow-boost-target').count()===0,'generator boost targets remained after consumption');
  await assertNoScroll('consumed Flow 390x844');await shot('98-merge-flow-boosted-drop-390x844');

  await page.setViewportSize({width:390,height:720});await reset();await charge();
  assert(await page.locator('.board-cell.generator.flow-boost-target').count()===2,'short viewport lost generator boost choices');
  await assertWithin(page.locator('.flow-hud'),'ready Flow HUD 390x720');await assertNoScroll('ready Flow 390x720');await shot('99-merge-flow-ready-390x720');

  report={threshold:3,openingBoostChoices:2,boostedDrop:{family:drop.family,level:drop.level},energyCost:1,shortViewportNoScroll:true};
  if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){failure=error;try{await shot('99-merge-flow-failure');}catch{}}
finally{await writeFile(`${outDir}/merge-flow-report.json`,JSON.stringify({report,problems,failure:failure?.message||null},null,2));await browser.close();}
if(failure)throw failure;
console.log('Merge Flow WebKit QA passed.');
