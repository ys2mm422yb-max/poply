import { webkit } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const baseURL=process.env.QA_BASE_URL||'http://127.0.0.1:4173';
const outDir=process.env.QA_OUT_DIR||'qa-artifacts';
await mkdir(outDir,{recursive:true});
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},screen:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:'de-DE',reducedMotion:'reduce'});
const page=await context.newPage();
const problems=[];page.on('console',msg=>{if(['error','warning'].includes(msg.type()))problems.push(`${msg.type()}: ${msg.text()}`);});page.on('pageerror',error=>problems.push(`pageerror: ${error.message}`));
const assert=(value,message)=>{if(!value)throw new Error(message);};
const shot=name=>page.screenshot({path:`${outDir}/${name}.png`,fullPage:false});
const assertNoScroll=async label=>{const m=await page.evaluate(()=>({scroll:document.documentElement.scrollHeight,inner:innerHeight,visual:window.visualViewport?.height||innerHeight}));assert(m.scroll<=m.inner+1,`${label}: document scrolls ${JSON.stringify(m)}`);};
const assertAboveNav=async(locator,label)=>{const [box,nav]=await Promise.all([locator.boundingBox(),page.locator('.main-nav').boundingBox()]);assert(box&&nav&&box.y+box.height<=nav.y-2,`${label} overlaps nav ${JSON.stringify({box,nav})}`);};
const openView=async view=>{await page.locator(`.nav-tab[data-view="${view}"]`).click();await page.waitForSelector(`.view-${view}`);};
const seed=async mode=>{await page.evaluate(async mode=>{const game=await import('./src/v2-game.js');let state=game.createInitialState();state.discoveries=[];for(const item of state.board||[]){if(item?.kind==='generator'&&item.generator==='coffee-gen')item.taps=50;if(item?.kind==='generator'&&item.generator==='pantry-gen')item.taps=24;}if(mode==='complete')state.placeUpgrades=game.PLACE_UPGRADES.map(upgrade=>upgrade.id);localStorage.setItem('poply-v2-state-1',JSON.stringify(state));localStorage.setItem('poply-v2-state-1-backup',JSON.stringify(state));},mode);await page.reload({waitUntil:'networkidle'});await page.waitForSelector('.game-view');};

let report={},failure=null;
try{
  await page.goto(baseURL,{waitUntil:'networkidle'});
  for(const height of [844,720]){
    await page.setViewportSize({width:390,height});
    await seed('mastery');await openView('collection');
    const masteryDomain=await page.evaluate(async()=>{const mastery=await import('./src/aaa-generator-mastery.js');const state=JSON.parse(localStorage.getItem('poply-v2-state-1')||'{}');return {coffee:mastery.generatorMastery(state,'coffee-gen'),pantry:mastery.generatorMastery(state,'pantry-gen')};});
    assert(masteryDomain.coffee.uses===50&&masteryDomain.coffee.completed&&masteryDomain.coffee.title==='Meister',`coffee generator domain mastery wrong ${JSON.stringify(masteryDomain.coffee)}`);
    assert(masteryDomain.pantry.uses===24&&!masteryDomain.pantry.completed&&masteryDomain.pantry.title==='Geübt'&&masteryDomain.pantry.nextAt===50,`pantry generator domain mastery wrong ${JSON.stringify(masteryDomain.pantry)}`);
    const coffee=page.locator('[data-generator-mastery="coffee-gen"]'),pantry=page.locator('[data-generator-mastery="pantry-gen"]');
    await coffee.waitFor();let text=(await coffee.textContent())||'';assert(text.includes('MEISTER')&&text.includes('Kaffeemaschine'),'coffee generator mastery UI missing');text=(await pantry.textContent())||'';assert(text.includes('GEÜBT')&&text.includes('24/50'),'pantry generator mastery UI missing');assert(await page.locator('.generator-discovery.known').count()>=2,'known generators missing from Collection rail');assert(await page.locator('.generator-discovery.mastered').count()===1,'mastered generator state is not unique');
    await page.locator('[data-collection-family="fruit"]').click();await page.waitForSelector('.view-collection[data-collection-family-active="fruit"]');assert(await page.locator('.collection-tier.locked .collection-art.silhouette').count()>0,'unknown Collection item is not a silhouette');
    await assertNoScroll(`Collection mastery 390x${height}`);await assertAboveNav(page.locator('.collection-world'),`Collection world 390x${height}`);await shot(height===844?'360-long-term-collection-390x844':'363-long-term-collection-390x720');

    await openView('orders');const service=page.locator('.service-card[data-service-order]').first();await service.waitFor();assert(!((await service.textContent())||'').includes('???'),'active order exposes unknown-item placeholder');
    const ribbon=page.locator('.daily-ribbon');await ribbon.waitFor();assert(!((await ribbon.textContent())||'').includes('Tagesziele & Gast'),'Daily ribbon is still technical-only');await ribbon.click();const sheet=page.locator('.daily-story-sheet');await sheet.waitFor();
    text=(await sheet.textContent())||'';assert(text.includes('Kein Streak')&&text.includes('HEUTE IM CAFÉ'),'Daily story framing missing');await assertNoScroll(`Daily story 390x${height}`);await assertAboveNav(sheet,`Daily story sheet 390x${height}`);await shot(height===844?'361-long-term-daily-story-390x844':'364-long-term-daily-story-390x720');

    await seed('complete');await openView('place');const payoff=page.locator('.world-complete-payoff');await payoff.waitFor();text=(await payoff.textContent())||'';assert(text.includes('POPLY-WELT KOMPLETT')&&text.includes('Alle drei Places leuchten'),'completed-world payoff missing');assert(text.includes('18/18'),'completed upgrades summary missing');assert((await payoff.evaluate(node=>getComputedStyle(node).animationName))==='none','reduced motion still animates completion payoff');await assertNoScroll(`World complete 390x${height}`);await assertAboveNav(payoff,`World complete payoff 390x${height}`);await shot(height===844?'362-long-term-world-complete-390x844':'365-long-term-world-complete-390x720');
  }
  report={generatorMastery:true,generatorMasteryDomain:true,dailyStories:true,collectionSilhouettesOnly:true,activeOrdersNoUnknownPlaceholder:true,worldCompletion:true,reducedMotion:true,viewports:['390x844','390x720'],noDocumentScroll:true};
  if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){failure=error;try{await shot('366-long-term-failure');}catch{}}
finally{await writeFile(`${outDir}/long-term-report.json`,JSON.stringify({report,problems,failure:failure?.message||null},null,2));await browser.close();}
if(failure)throw failure;
console.log('Long-term motivation WebKit QA passed.');