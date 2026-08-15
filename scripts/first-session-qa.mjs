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
const assertNoScroll=async label=>{const m=await page.evaluate(()=>({scroll:document.documentElement.scrollHeight,inner:innerHeight,visual:window.visualViewport?.height||innerHeight}));assert(m.scroll<=m.inner+1,`${label}: document scrolls ${JSON.stringify(m)}`);};
const assertVisibleWithin=async(locator,label)=>{const box=await locator.boundingBox();assert(box&&box.y>=-1&&box.y+box.height<=await page.evaluate(()=>window.visualViewport?.height||innerHeight)+1,`${label} outside viewport ${JSON.stringify(box)}`);};
const assertNotClipped=async(locator,label)=>{const m=await locator.evaluate(node=>({scrollWidth:node.scrollWidth,clientWidth:node.clientWidth,scrollHeight:node.scrollHeight,clientHeight:node.clientHeight,text:node.textContent}));assert(m.scrollWidth<=m.clientWidth+1&&m.scrollHeight<=m.clientHeight+1,`${label} visually clipped ${JSON.stringify(m)}`);};
const assertNoEllipsisStyle=async(locator,label)=>{const style=await locator.evaluate(node=>{const css=getComputedStyle(node);return {whiteSpace:css.whiteSpace,textOverflow:css.textOverflow,overflowX:css.overflowX,overflowY:css.overflowY};});assert(style.whiteSpace!=='nowrap'&&style.textOverflow!=='ellipsis',`${label} still uses ellipsis CSS ${JSON.stringify(style)}`);};
const seed=async mutate=>page.evaluate(async source=>{const game=await import('./src/v2-game.js');const state=game.createInitialState();const fn=(0,eval)(`(${source})`);fn(state,game);localStorage.setItem('poply-v2-state-1',JSON.stringify(state));},mutate.toString());

let report={},failure=null;
try{
  await page.goto(baseURL,{waitUntil:'networkidle'});
  await page.evaluate(()=>localStorage.removeItem('poply-v2-state-1'));
  await page.reload({waitUntil:'networkidle'});
  await page.waitForSelector('.view-board .purpose-card');
  const fresh=await readSave(),titles=fresh.currentOrders.map(order=>order.title);
  assert(new Set(titles).size===3,`fresh visible orders repeat ${JSON.stringify(titles)}`);
  assert(titles[0]==='Erster Kaffee',`opening order missing ${JSON.stringify(titles)}`);
  assert(fresh.currentOrders[0].rewards.stars===4,'first service must finance first build');
  assert(fresh.currentOrders.slice(1).every(order=>order.requirements.length===2),'opening follow-ups are not real combo orders');
  assert((await page.locator('.purpose-card button').textContent())?.includes('Auftrag spielen'),'fresh board CTA is not actionable');
  await assertNoScroll('fresh board 390x844');
  await shot('80-first-session-board-390x844');

  await page.locator('.purpose-card button').click();
  await page.waitForSelector('.view-orders .service-card');
  await page.waitForFunction(()=>document.querySelector('.daily-ribbon')?.textContent?.includes('Tagesziele'));
  assert((await page.locator('.service-hero h2').textContent())?.includes('Wähle'),'orders hero still explains instead of offering a choice');
  assert((await page.locator('.daily-ribbon').textContent())?.includes('Tagesziele & Gast'),'Daily ribbon rendered as an empty surface');
  await assertNoEllipsisStyle(page.locator('.service-hero p'),'opening Orders purpose line');
  await assertNotClipped(page.locator('.service-hero p'),'opening Orders purpose line');
  const choices=page.locator('.customer-choice');assert(await choices.count()===3,'opening does not expose three guest choices');
  await page.locator('[data-select-order="order-1"]').click();
  await page.waitForFunction(()=>document.querySelector('.daily-ribbon')?.textContent?.includes('Tagesziele'));
  assert((await page.locator('.service-card[data-service-order="order-1"] .service-strategy').textContent())?.includes('KOMBI'),'combo strategy not visible');
  assert(await page.locator('.service-card[data-service-order="order-1"] .service-status').isHidden(),'redundant service status pill is still visible/clippable');
  await assertVisibleWithin(page.locator('.service-card[data-service-order="order-1"]'),'opening combo service card');
  await assertNoScroll('opening orders 390x844');
  await shot('81-first-session-orders-390x844');

  await seed((state,game)=>{state.board[9]=game.makeItem('coffee',2,'first-serve-ready');state.board[10]=null;});
  await page.reload({waitUntil:'networkidle'});await page.locator('.nav-tab[data-view="orders"]').click();await page.locator('[data-select-order="order-0"]').click();
  await page.locator('button[data-order="order-0"]').click();
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('poply-v2-state-1')||'{}').stars===4);
  await page.waitForFunction(()=>document.querySelector('.service-hero h2')?.textContent?.includes('baubereit'));
  const served=await readSave(),postTitles=served.currentOrders.map(order=>order.title);
  assert(!postTitles.includes('Erster Kaffee'),`served opening title repeated immediately ${JSON.stringify(postTitles)}`);
  assert(new Set(postTitles).size===3,`replacement duplicated a visible title ${JSON.stringify(postTitles)}`);
  assert(served.stars===4,'first real service did not reach first build exactly');
  assert((await page.locator('.service-hero h2').textContent())?.includes('baubereit'),'orders did not acknowledge build readiness');
  await assertNoEllipsisStyle(page.locator('.service-hero p'),'ready Orders purpose line');
  await assertNotClipped(page.locator('.service-hero p'),'ready Orders purpose line');
  await shot('82-first-service-payoff-390x844');

  await page.locator('.nav-tab[data-view="board"]').click();await page.waitForSelector('.purpose-card [data-purpose-go-place]');
  assert((await page.locator('.purpose-card button').textContent())?.includes('Jetzt bauen'),'ready board does not expose build now');
  await shot('83-first-build-ready-board-390x844');
  await page.locator('.purpose-card button').click();await page.waitForSelector('.view-place .scene-upgrade-preview.lights');
  assert((await page.locator('.purpose-place-unlock').textContent())?.includes('Kombi-Aufträge'),'first build gameplay unlock not visible');
  await assertNotClipped(page.locator('.purpose-place-unlock strong'),'first build unlock copy');
  assert(await page.locator('.place-progress-dial').isHidden(),'duplicate Place progress dial still visible');
  assert(await page.locator('.world-progress').isHidden(),'duplicate hero progress still visible');
  await assertNoScroll('first build preview 390x844');
  await shot('84-first-build-preview-390x844');
  await page.locator('.place-current-goal [data-action="build"]').click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('poply-v2-state-1')||'{}').placeUpgrades?.includes('lights'));
  await page.waitForSelector('.scene-upgrade.lights:not(.scene-upgrade-preview)');
  assert(await page.locator('.cafe-evening-wash').count()===1,'Lichter do not materially warm the scene');
  await assertNotClipped(page.locator('.purpose-place-unlock strong'),'post-build unlock copy');
  await shot('85-first-build-complete-390x844');

  await seed((state,game)=>{state.placeUpgrades=game.PLACE_01_UPGRADES.slice(0,4).map(upgrade=>upgrade.id);state.stars=0;});
  await page.reload({waitUntil:'networkidle'});await page.locator('.nav-tab[data-view="place"]').click();await page.waitForSelector('.place-coast .scene-upgrade.seating');
  assert(await page.locator('.cafe-barista').count()===1,'mid-stage Café has no worker life');
  assert(await page.locator('.cafe-guest').count()===2,'mid-stage seating is not inhabited');
  assert(await page.locator('.cafe-steam').count()===1,'mid-stage counter has no steam detail');
  const motion=await page.locator('.cafe-guest').first().evaluate(node=>getComputedStyle(node).animationName);
  assert(motion&&motion!=='none','authored Café guests are static');
  await assertNotClipped(page.locator('.purpose-place-unlock strong'),'mid-stage unlock copy');
  await assertNoScroll('living coast stage4 390x844');
  await shot('86-living-cafe-stage4-390x844');

  await seed((state,game)=>{state.placeUpgrades=game.PLACE_01_UPGRADES.map(upgrade=>upgrade.id);});
  await page.reload({waitUntil:'networkidle'});await page.locator('.nav-tab[data-view="place"]').click();await page.waitForSelector('[data-action="place-map"]');await page.locator('[data-action="place-map"]').click();
  await page.waitForSelector('.place-map-sheet');await page.locator('[data-map-place="coast"]').click();await page.waitForSelector('.place-map-preview.place-coast .scene-upgrade.sign');
  const finalPreview=page.locator('.place-map-preview.place-coast');
  assert(await finalPreview.locator('.scene-upgrade.lights').count()===1,'final coast lost lights');
  assert(await finalPreview.locator('.cafe-barista').count()===1,'final coast lost barista');
  assert(await finalPreview.locator('.cafe-guest').count()===2,'final coast lost guests');
  assert(await finalPreview.locator('.scene-upgrade.terrace').count()===1,'final coast lost terrace');
  assert(await finalPreview.locator('.scene-upgrade.sign').count()===1,'final coast lost final identity');
  await shot('87-complete-cafe-map-390x844');
  await page.locator('[data-place-map-close]').last().click();

  await page.setViewportSize({width:390,height:720});
  await seed(()=>{});await page.reload({waitUntil:'networkidle'});await page.waitForSelector('.view-board .purpose-card');
  await assertNoScroll('fresh board 390x720');await shot('88-first-session-board-390x720');
  await page.locator('.purpose-card button').click();await page.waitForSelector('.view-orders');await page.waitForFunction(()=>document.querySelector('.daily-ribbon')?.textContent?.includes('Tagesziele'));await assertNoEllipsisStyle(page.locator('.service-hero p'),'short Orders purpose line');await assertNotClipped(page.locator('.service-hero p'),'short Orders purpose line');await assertNoScroll('opening orders 390x720');await shot('89-first-session-orders-390x720');
  await seed((state,game)=>{state.placeUpgrades=game.PLACE_01_UPGRADES.slice(0,4).map(upgrade=>upgrade.id);});await page.reload({waitUntil:'networkidle'});await page.locator('.nav-tab[data-view="place"]').click();await page.waitForSelector('.cafe-guest');
  await assertNotClipped(page.locator('.purpose-place-unlock strong'),'short mid-stage unlock copy');await assertNoScroll('living coast stage4 390x720');await shot('90-living-cafe-stage4-390x720');

  report={freshTitles:titles,postServeTitles:postTitles,firstBuildStars:4,stage4Guests:2,finalCoastElements:['lights','counter','menu','seating','terrace','sign'],shortViewportNoScroll:true,dailyRibbonPopulated:true,serviceStatusDecluttered:true,purposeCopyUnclipped:true,purposeNoEllipsisCss:true};
  if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){failure=error;try{await shot('98-first-session-failure');}catch{}}
finally{await writeFile(`${outDir}/first-session-report.json`,JSON.stringify({report,problems,failure:failure?.message||null},null,2));await browser.close();}
if(failure)throw failure;
console.log('First-session WebKit QA passed.');
