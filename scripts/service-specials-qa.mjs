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
const assertNotClipped=async(locator,label)=>{const m=await locator.evaluate(node=>({scrollWidth:node.scrollWidth,clientWidth:node.clientWidth,scrollHeight:node.scrollHeight,clientHeight:node.clientHeight,text:node.textContent}));assert(m.scrollWidth<=m.clientWidth+1&&m.scrollHeight<=m.clientHeight+1,`${label} clipped ${JSON.stringify(m)}`);};
const reset=async()=>{await page.evaluate(()=>{localStorage.removeItem('poply-v2-state-1');localStorage.removeItem('poply-v2-state-1-backup');});await page.reload({waitUntil:'networkidle'});await page.waitForSelector('.view-board');};
const openOrders=async()=>{await page.locator('.nav-tab[data-view="orders"]').click();await page.waitForSelector('.view-orders .customer-choice');await page.waitForFunction(()=>document.querySelector('.daily-ribbon')?.textContent?.includes('Tagesziele'));};

let report={},failure=null;
try{
  await page.goto(baseURL,{waitUntil:'networkidle'});await reset();await openOrders();
  const fresh=await readSave(),specials=fresh.currentOrders.map(order=>order.special?.type||null);
  assert(specials[0]===null,`first onboarding order unexpectedly has Special ${JSON.stringify(specials)}`);
  assert(specials[1]==='merge-series'&&specials[2]==='fresh',`opening Specials are not varied ${JSON.stringify(specials)}`);
  assert(await page.locator('[data-select-order="order-0"] .service-special-choice-line').count()===0,'Erster Kaffee should stay simple');
  const seriesLine=page.locator('[data-select-order="order-1"] .service-special-choice-line'),freshLine=page.locator('[data-select-order="order-2"] .service-special-choice-line');
  const seriesChoice=(await seriesLine.textContent())||'',freshChoice=(await freshLine.textContent())||'';
  assert(seriesChoice.includes('SERIE 0/2')&&seriesChoice.includes('Nora 0/1'),`second opening guest does not expose Special + Loyalty: ${seriesChoice}`);
  assert(freshChoice.includes('FRISCH 0/1')&&freshChoice.includes('Sam 0/1'),`third opening guest does not expose Special + Loyalty: ${freshChoice}`);
  assert(await page.locator('.service-special-choice').count()===0,'obsolete overlay Special chips are still rendered');
  await assertNotClipped(seriesLine,'Merge-Serie queue line');await assertNotClipped(freshLine,'Fresh queue line');
  await assertNoScroll('opening Service Specials 390x844');await shot('100-service-special-choices-390x844');

  await page.locator('[data-select-order="order-1"]').click();await page.waitForSelector('.service-card[data-service-order="order-1"] .service-special-panel');
  const seriesPanel=page.locator('.service-card[data-service-order="order-1"] .service-special-panel'),seriesText=(await seriesPanel.textContent())||'';
  assert(seriesText.includes('Merge-Serie')&&seriesText.includes('0/2')&&seriesText.includes('+40'),`Merge-Serie panel incomplete: ${seriesText}`);
  await assertWithin(seriesPanel,'Merge-Serie panel');await assertNoScroll('focused Merge-Serie 390x844');await shot('101-service-special-series-390x844');

  await page.evaluate(async()=>{const session=await import('./src/aaa-session.js');for(const [from,to] of [[9,10],[16,17]]){const result=session.moveOrMergeAt(from,to);if(!result.changed)throw new Error(`special QA merge failed ${from}->${to}`);}});
  await page.reload({waitUntil:'networkidle'});await openOrders();
  const completedLine=page.locator('[data-select-order="order-1"] .service-special-choice-line');
  const completedLineText=(await completedLine.textContent())||'';assert(completedLineText.includes('✓ Fertig')&&completedLineText.includes('Nora 0/1'),`completed queue line lost Special or Loyalty state: ${completedLineText}`);await assertNotClipped(completedLine,'completed queue line');
  await page.locator('[data-select-order="order-1"]').click();
  const completePanel=page.locator('.service-card[data-service-order="order-1"] .service-special-panel');await completePanel.waitFor();
  const completeText=(await completePanel.textContent())||'';
  assert(completeText.includes('GESCHAFFT')&&completeText.includes('Merge-Serie'),`completed Special not visible: ${completeText}`);
  assert(await page.locator('.service-card[data-service-order="order-1"]').evaluate(node=>node.classList.contains('special-complete')),'completed service card has no completion state');
  assert(await page.locator('button[data-order="order-1"]').isEnabled(),'recipe should be ready after the two Series merges');
  await assertNoScroll('completed Merge-Serie 390x844');await shot('102-service-special-complete-390x844');

  await page.locator('button[data-order="order-1"]').click();await page.waitForFunction(()=>document.querySelector('#toast')?.textContent?.includes('inkl. +40 Bonus'));
  const toast=(await page.locator('#toast').textContent())||'';assert(toast.includes('+130')&&toast.includes('inkl. +40 Bonus'),`delivery did not communicate bonus payout: ${toast}`);
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('poply-v2-state-1')||'{}').currentOrders?.some(order=>order.id==='order-3'&&order.special?.type==='flow-tip'));
  await page.waitForTimeout(380);
  const afterDelivery=await readSave(),replacement=afterDelivery.currentOrders.find(order=>order.id==='order-3');
  assert(replacement?.special?.type==='flow-tip','replacement order did not get Flow-Tipp');
  const flowLine=page.locator('[data-select-order="order-3"] .service-special-choice-line'),flowLineText=(await flowLine.textContent())||'';
  assert(flowLineText.includes('FLOW 0/1')&&flowLineText.includes('Mika 0/1'),`replacement queue line does not expose Flow-Tipp + Loyalty: ${flowLineText}`);await assertNotClipped(flowLine,'Flow queue line');
  await page.locator('[data-select-order="order-3"]').click();await page.waitForSelector('.service-card[data-service-order="order-3"] .service-special-panel');
  const flowText=(await page.locator('.service-card[data-service-order="order-3"] .service-special-panel').textContent())||'';
  assert(flowText.includes('Flow-Tipp')&&flowText.includes('0/1'),`next tactical goal is not visible: ${flowText}`);
  await assertNoScroll('replacement Flow-Tipp 390x844');await shot('103-service-special-flow-next-390x844');

  await page.setViewportSize({width:390,height:720});await reset();await openOrders();
  const shortSeriesLine=page.locator('[data-select-order="order-1"] .service-special-choice-line'),shortLineText=(await shortSeriesLine.textContent())||'';
  assert(shortLineText.includes('SERIE 0/2')&&shortLineText.includes('Nora 0/1'),`short viewport lost Special + Loyalty line: ${shortLineText}`);await assertNotClipped(shortSeriesLine,'Merge-Serie queue line 390x720');
  await page.locator('[data-select-order="order-1"]').click();
  const shortPanel=page.locator('.service-card[data-service-order="order-1"] .service-special-panel');await shortPanel.waitFor();
  assert(((await shortPanel.textContent())||'').includes('Merge-Serie'),'short viewport lost Special panel');
  await assertWithin(shortPanel,'Merge-Serie panel 390x720');await assertWithin(page.locator('.service-deliver'),'service button 390x720');await assertNoScroll('Service Specials 390x720');await shot('104-service-special-series-390x720');

  report={openingSpecials:specials,seriesRewardCoins:40,completedWithMerges:2,deliveryCoinsWithBonus:130,replacementSpecial:replacement.special.type,compactQueueLines:true,loyaltyCoexists:true,shortViewportNoScroll:true};
  if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){failure=error;try{await shot('105-service-special-failure');}catch{}}
finally{await writeFile(`${outDir}/service-specials-report.json`,JSON.stringify({report,problems,failure:failure?.message||null},null,2));await browser.close();}
if(failure)throw failure;
console.log('Service Specials WebKit QA passed.');
