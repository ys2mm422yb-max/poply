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
const assertSheetFits=async label=>{
  const metrics=await page.evaluate(()=>{const s=document.querySelector('.player-progress-sheet'),n=document.querySelector('.main-nav');if(!s||!n)return null;const a=s.getBoundingClientRect(),b=n.getBoundingClientRect();return {sheet:{top:a.top,bottom:a.bottom,left:a.left,right:a.right},nav:{top:b.top,bottom:b.bottom},height:window.visualViewport?.height||innerHeight,scrollHeight:document.documentElement.scrollHeight,innerHeight};});
  assert(metrics,`${label}: milestone sheet missing`);assert(metrics.sheet.left>=0&&metrics.sheet.right<=390,`${label}: milestone sheet clips horizontally ${JSON.stringify(metrics)}`);assert(metrics.sheet.bottom<=metrics.nav.top+1,`${label}: milestone sheet overlaps bottom navigation ${JSON.stringify(metrics)}`);assert(metrics.nav.bottom<=metrics.height+1,`${label}: navigation clips ${JSON.stringify(metrics)}`);assert(metrics.scrollHeight<=metrics.innerHeight+1,`${label}: document scrolls ${JSON.stringify(metrics)}`);return metrics;
};
let report={},failure=null;

try{
  await page.goto(baseURL,{waitUntil:'networkidle'});
  await page.waitForSelector('.player-level-badge');
  assert((await page.locator('.player-level-badge').textContent())?.includes('LV 1'),'fresh player level badge is not LV 1');
  assert((await page.locator('.player-level-badge').getAttribute('aria-label'))?.includes('Neu dabei'),'fresh player title is not exposed from the level badge');
  const badge=await page.locator('.player-level-badge').boundingBox(),resources=await page.locator('.resources').boundingBox();
  assert(badge&&resources&&badge.x+badge.width<=resources.x+1,`player level badge overlaps resources ${JSON.stringify({badge,resources})}`);

  await page.evaluate(async()=>{
    const game=await import('./src/v2-game.js');
    const state=game.createInitialState();
    state.playerXp=110;
    state.board[9]=game.makeItem('coffee',2,'qa-level-ready-coffee');state.board[10]=null;
    localStorage.setItem('poply-v2-state-1',JSON.stringify(state));
  });
  await page.reload({waitUntil:'networkidle'});
  await page.locator('.nav-tab[data-view="orders"]').click();
  await page.locator('[data-select-order="order-0"]').click();
  const beforeOrder=await readSave();
  const serve=page.locator('button[data-order="order-0"]');
  assert(await serve.isEnabled(),'level-up QA serve button is disabled');
  await serve.click();await page.waitForTimeout(1500);
  const afterOrder=await readSave();
  assert(afterOrder.playerXp===170,`order XP incorrect: ${beforeOrder.playerXp} -> ${afterOrder.playerXp}`);
  assert(afterOrder.coins===245,`level-up coin reward incorrect: ${beforeOrder.coins} -> ${afterOrder.coins}`);
  assert((await page.locator('.player-level-badge').textContent())?.includes('LV 2'),'HUD did not advance to LV 2');
  const overlay=page.locator('.level-up-overlay');
  assert(await overlay.isVisible(),'level-up overlay is not visible');
  const overlayText=await overlay.textContent();
  assert(overlayText?.includes('Level 2')&&overlayText?.includes('+100 Coins'),`level-up reward copy missing: ${overlayText}`);
  await shot('20-player-level-up-order');
  report.order={beforeXp:beforeOrder.playerXp,afterXp:afterOrder.playerXp,coins:afterOrder.coins};

  await page.reload({waitUntil:'networkidle'});await page.waitForSelector('.player-level-badge');
  const reloadedOrder=await readSave();
  assert(reloadedOrder.playerXp===170,'player XP was lost after reload');
  assert((await page.locator('.player-level-badge').textContent())?.includes('LV 2'),'reloaded HUD lost player level');

  await page.evaluate(async()=>{
    const game=await import('./src/v2-game.js');
    const state=game.createInitialState();state.playerXp=170;state.stars=10;state.coins=100;
    localStorage.setItem('poply-v2-state-1',JSON.stringify(state));
  });
  await page.reload({waitUntil:'networkidle'});
  await page.locator('.nav-tab[data-view="place"]').click();
  const build=page.locator('[data-action="build"]');assert(await build.isEnabled(),'restoration level-up build is disabled');
  await build.click();await page.waitForTimeout(2050);
  const afterBuild=await readSave();
  assert(afterBuild.placeUpgrades.includes('lights'),'restoration was not persisted');
  assert(afterBuild.playerXp===310,`restoration XP incorrect: ${afterBuild.playerXp}`);
  assert(afterBuild.coins===200,`restoration level reward missing: ${afterBuild.coins}`);
  assert((await page.locator('.player-level-badge').textContent())?.includes('LV 3'),'HUD did not advance to LV 3 after restoration');
  assert(await page.locator('.level-up-overlay').isVisible(),'restoration level-up overlay is not visible');
  assert(!(await page.locator('.restoration-reveal').isVisible().catch(()=>false)),'restoration and level-up reveals overlap instead of sequencing');
  await shot('21-player-level-up-restoration');
  report.restoration={xp:afterBuild.playerXp,coins:afterBuild.coins,upgrades:afterBuild.placeUpgrades};

  await page.evaluate(async()=>{
    const game=await import('./src/v2-game.js');
    const state=game.createInitialState();state.playerXp=840;state.stats.orders=4;state.stats.merges=31;state.placeUpgrades=['lights','counter','menu','seating','terrace','sign'];
    state.discoveries=['item:coffee:1','item:coffee:2','item:coffee:3','item:coffee:4','item:coffee:5','item:coffee:6','item:bakery:1','item:bakery:2','item:bakery:3','item:bakery:4','item:bakery:5','item:bakery:6'];
    localStorage.setItem('poply-v2-state-1',JSON.stringify(state));
  });
  await page.reload({waitUntil:'networkidle'});await page.waitForSelector('.player-level-badge');
  assert((await page.locator('.player-level-badge').textContent())?.includes('LV 5'),'seeded milestone player is not LV 5');
  assert((await page.locator('.player-level-badge').getAttribute('aria-label'))?.includes('Poply-Profi'),'completed milestone title is not exposed from the level badge');
  await page.locator('.player-level-badge').click();await page.waitForSelector('.player-progress-sheet');
  const sheetText=await page.locator('.player-progress-sheet').textContent();
  assert(sheetText?.includes('5/5 Meilensteine'),'completed milestone summary is wrong');assert(await page.locator('.milestone-row.complete').count()===5,'not all seeded milestones render complete');
  assert(sheetText?.includes('Poply-Profi')&&sheetText?.includes('Höchster Titel erreicht'),`earned player title is missing: ${sheetText}`);
  assert(sheetText?.includes('NÄCHSTES LEVEL')&&sheetText?.includes('360 XP fehlen'),`next level preview is wrong: ${sheetText}`);
  assert(sheetText?.includes('+100')&&sheetText?.includes('Coins'),`next level reward is missing: ${sheetText}`);
  await assertSheetFits('390x844 milestones');await shot('22-player-milestones-390x844');
  await page.setViewportSize({width:390,height:720});await page.waitForTimeout(120);await assertSheetFits('390x720 milestones');await shot('23-player-milestones-short-safari');
  await page.locator('[data-player-progress-close]').click();assert(!(await page.locator('.player-progress-sheet').isVisible().catch(()=>false)),'milestone sheet did not close');
  const milestoneSave=await readSave();assert(milestoneSave.playerXp===840&&milestoneSave.stats.merges===31,'opening milestones mutated player progress');
  report.milestones={completed:5,total:5,title:'Poply-Profi',playerXp:milestoneSave.playerXp,merges:milestoneSave.stats.merges,nextLevel:6,remainingXp:360,rewardCoins:100};

  if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){failure=error;try{await shot('29-progression-failure');}catch{}}
finally{
  await writeFile(`${outDir}/progression-report.json`,JSON.stringify({report,problems,failure:failure?.message||null},null,2));
  await browser.close();
}
if(failure)throw failure;
console.log('Player progression + milestones WebKit QA passed.');