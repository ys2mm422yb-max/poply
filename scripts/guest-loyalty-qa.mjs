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
const assertNoScroll=async label=>{
  const metrics=await page.evaluate(()=>({scroll:document.documentElement.scrollHeight,inner:innerHeight,visual:window.visualViewport?.height||innerHeight}));
  assert(metrics.scroll<=metrics.inner+1,`${label}: document scrolls ${JSON.stringify(metrics)}`);
};
const assertInside=async(locator,label)=>{
  const box=await locator.boundingBox(),height=await page.evaluate(()=>window.visualViewport?.height||innerHeight);
  assert(box&&box.x>=-1&&box.y>=-1&&box.x+box.width<=391&&box.y+box.height<=height+1,`${label} outside viewport ${JSON.stringify(box)}`);
};
const seedReadyOpening=()=>page.evaluate(async()=>{
  const game=await import('./src/v2-game.js');
  const state=game.createInitialState();
  state.board[9]=game.makeItem('coffee',2,'qa-loyalty-coffee');
  localStorage.setItem('poply-v2-state-1',JSON.stringify(state));
});

let report={},failure=null;
try{
  await page.goto(baseURL,{waitUntil:'networkidle'});
  await page.evaluate(()=>localStorage.removeItem('poply-v2-state-1'));
  await seedReadyOpening();
  await page.reload({waitUntil:'networkidle'});
  await page.locator('.nav-tab[data-view="orders"]').click();
  await page.waitForSelector('.view-orders .customer-choice[data-guest-id="mika"]');

  const fresh=await readSave();
  assert(fresh.guestVisits?.mika===0&&fresh.guestVisits?.nora===0&&fresh.guestVisits?.sam===0,`fresh guest state wrong ${JSON.stringify(fresh.guestVisits)}`);
  const choices=page.locator('.customer-choice');
  assert(await choices.count()===3,'expected three current guest choices');
  const choiceTexts=await choices.allTextContents();
  assert(choiceTexts[0].includes('Mika')&&choiceTexts[0].includes('0/1'),`Mika fresh loyalty not visible: ${choiceTexts[0]}`);
  assert(choiceTexts[1].includes('Nora')&&choiceTexts[1].includes('0/1'),`Nora fresh loyalty not visible: ${choiceTexts[1]}`);
  assert(choiceTexts[2].includes('Sam')&&choiceTexts[2].includes('0/1'),`Sam fresh loyalty not visible: ${choiceTexts[2]}`);
  const freshService=(await page.locator('.service-card[data-service-order="order-0"] .service-customer>span').textContent())||'';
  assert(freshService.includes('MIKA')&&freshService.includes('NEU'),`fresh selected guest rank missing: ${freshService}`);
  await assertInside(page.locator('.service-card[data-service-order="order-0"]'),'fresh Mika service card');
  await assertNoScroll('guest loyalty fresh orders 390x844');
  await shot('91-guest-loyalty-fresh-390x844');

  await page.locator('button[data-order="order-0"]').click();
  await page.waitForFunction(()=>{
    const state=JSON.parse(localStorage.getItem('poply-v2-state-1')||'{}');
    return state.guestVisits?.mika===1&&state.coins===175&&state.stars===4;
  });
  await page.waitForFunction(()=>document.querySelector('.customer-choice[data-select-order="order-3"]')?.dataset.guestId==='mika');
  await page.locator('.customer-choice[data-select-order="order-3"]').click();
  await page.waitForFunction(()=>document.querySelector('.service-card[data-service-order="order-3"] .service-customer>span')?.textContent?.includes('BEKANNT'));

  const served=await readSave();
  assert(served.guestVisits.mika===1,`Mika visit not persisted ${JSON.stringify(served.guestVisits)}`);
  assert(served.guestVisits.nora===0&&served.guestVisits.sam===0,'serving Mika changed another guest');
  assert(served.coins===175,`expected 100 + 50 Order + 25 loyalty = 175 Coins, got ${served.coins}`);
  assert(served.stars===4,`opening Stars changed unexpectedly: ${served.stars}`);
  const knownChoice=(await page.locator('.customer-choice[data-select-order="order-3"]').textContent())||'';
  const knownService=(await page.locator('.service-card[data-service-order="order-3"] .service-customer>span').textContent())||'';
  assert(knownChoice.includes('Mika')&&knownChoice.includes('1/5'),`Mika next milestone progress missing: ${knownChoice}`);
  assert(knownService.includes('MIKA')&&knownService.includes('BEKANNT'),`Mika rank did not advance visibly: ${knownService}`);
  await assertInside(page.locator('.service-card[data-service-order="order-3"]'),'known Mika service card');
  await assertNoScroll('guest loyalty known orders 390x844');
  await shot('92-guest-loyalty-known-390x844');

  await page.reload({waitUntil:'networkidle'});
  await page.locator('.nav-tab[data-view="orders"]').click();
  await page.waitForSelector('.customer-choice[data-select-order="order-3"][data-guest-id="mika"]');
  await page.locator('.customer-choice[data-select-order="order-3"]').click();
  await page.waitForFunction(()=>document.querySelector('.service-card[data-service-order="order-3"] .service-customer>span')?.textContent?.includes('BEKANNT'));
  const reloaded=await readSave();
  assert(reloaded.guestVisits.mika===1,`reload duplicated visit ${reloaded.guestVisits.mika}`);
  assert(reloaded.coins===175,`reload duplicated loyalty reward ${reloaded.coins}`);

  await page.setViewportSize({width:390,height:720});
  await page.waitForTimeout(100);
  await assertInside(page.locator('.service-card[data-service-order="order-3"]'),'known Mika service card 390x720');
  await assertNoScroll('guest loyalty known orders 390x720');
  await shot('93-guest-loyalty-known-390x720');

  report={
    freshChoiceTexts:choiceTexts,
    freshService,
    servedGuestVisits:served.guestVisits,
    servedCoins:served.coins,
    servedStars:served.stars,
    knownChoice,
    knownService,
    reloadGuestVisits:reloaded.guestVisits,
    reloadCoins:reloaded.coins,
    noDuplicateReward:true,
    viewports:['390x844','390x720'],
  };
  if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){
  failure=error;
  try{await shot('99-guest-loyalty-failure');}catch{}
}finally{
  await writeFile(`${outDir}/guest-loyalty-report.json`,JSON.stringify({report,problems,failure:failure?.message||null},null,2));
  await browser.close();
}
if(failure)throw failure;
console.log('Guest loyalty WebKit QA passed.');
