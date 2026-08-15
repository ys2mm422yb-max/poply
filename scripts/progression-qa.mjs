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
const assertEnergyPlanFits=async label=>{
  const metrics=await page.evaluate(()=>{const p=document.querySelector('[data-energy-plan]'),n=document.querySelector('.main-nav');if(!p||!n)return null;const a=p.getBoundingClientRect(),b=n.getBoundingClientRect();return {plan:{top:a.top,bottom:a.bottom,left:a.left,right:a.right},nav:{top:b.top,bottom:b.bottom},height:window.visualViewport?.height||innerHeight,scrollHeight:document.documentElement.scrollHeight,innerHeight};});
  assert(metrics,`${label}: energy plan missing`);assert(metrics.plan.left>=0&&metrics.plan.right<=390,`${label}: energy plan clips horizontally ${JSON.stringify(metrics)}`);assert(metrics.plan.top>=0&&metrics.plan.bottom<=metrics.nav.top+1,`${label}: energy plan overlaps navigation ${JSON.stringify(metrics)}`);assert(metrics.scrollHeight<=metrics.innerHeight+1,`${label}: energy plan introduces document scroll ${JSON.stringify(metrics)}`);return metrics;
};
const assertLevelUpFits=async label=>{
  const metrics=await page.evaluate(()=>{const o=document.querySelector('.level-up-overlay'),n=document.querySelector('.main-nav');if(!o||!n)return null;const a=o.getBoundingClientRect(),b=n.getBoundingClientRect();return {overlay:{top:a.top,bottom:a.bottom,left:a.left,right:a.right},nav:{top:b.top,bottom:b.bottom},height:window.visualViewport?.height||innerHeight,scrollHeight:document.documentElement.scrollHeight,innerHeight};});
  assert(metrics,`${label}: level-up overlay missing`);assert(metrics.overlay.left>=0&&metrics.overlay.right<=390,`${label}: level-up overlay clips horizontally ${JSON.stringify(metrics)}`);assert(metrics.overlay.top>=0&&metrics.overlay.bottom<=metrics.nav.top+1,`${label}: level-up overlay overlaps navigation ${JSON.stringify(metrics)}`);assert(metrics.scrollHeight<=metrics.innerHeight+1,`${label}: level-up introduces document scroll ${JSON.stringify(metrics)}`);return metrics;
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
    const state=game.createInitialState();state.energy=35;state.maxEnergy=40;state.energyUpdatedAt=Date.now()-30_000;
    localStorage.setItem('poply-v2-state-1',JSON.stringify(state));
  });
  await page.reload({waitUntil:'networkidle'});await page.waitForSelector('.resource.energy');
  const energyBefore=await readSave();
  await page.locator('.resource.energy').click();await page.waitForSelector('[data-energy-plan]');
  const energyText=await page.locator('[data-energy-plan]').textContent();
  assert(/\+1 in 1:\d{2}/.test(energyText||''),`energy next-point countdown missing: ${energyText}`);
  assert((energyText||'').includes('Voll in ca. 10 Min'),`energy full-recharge plan missing: ${energyText}`);
  assert((energyText||'').includes('offline'),`energy offline rule missing: ${energyText}`);
  await assertEnergyPlanFits('390x844 energy plan');await shot('24-energy-plan-390x844');
  await page.setViewportSize({width:390,height:720});await page.waitForTimeout(120);await assertEnergyPlanFits('390x720 energy plan');await shot('25-energy-plan-short-safari');
  await page.locator('.resource.energy').click();assert(!(await page.locator('[data-energy-plan]').isVisible().catch(()=>false)),'energy plan did not close on second tap');
  const energyAfter=await readSave();assert(energyAfter.energy===energyBefore.energy&&energyAfter.maxEnergy===energyBefore.maxEnergy,'opening energy plan mutated energy state');
  report.energy={energy:energyAfter.energy,maxEnergy:energyAfter.maxEnergy,next:'live countdown',full:'Voll in ca. 10 Min',stateNeutral:true};
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(120);

  await page.evaluate(async()=>{
    const game=await import('./src/v2-game.js');
    const state=game.createInitialState();
    state.playerXp=800;state.energy=6;state.maxEnergy=40;state.energyUpdatedAt=Date.now()-30_000;
    state.board[9]=game.makeItem('coffee',2,'qa-level-ready-coffee');state.board[10]=null;
    localStorage.setItem('poply-v2-state-1',JSON.stringify(state));
  });
  await page.reload({waitUntil:'networkidle'});
  const capacitySeed=await readSave();assert(capacitySeed.playerXp===800&&capacitySeed.maxEnergy===40,`capacity seed migrated incorrectly: ${capacitySeed.playerXp} / ${capacitySeed.maxEnergy}`);
  await page.locator('.player-level-badge').click();await page.waitForSelector('.player-progress-sheet');
  const capacityPreview=await page.locator('.next-level-preview').textContent();
  assert(capacityPreview?.includes('LV 5')&&capacityPreview?.includes('MAX +5'),`Level 5 Max-Energy preview missing: ${capacityPreview}`);
  await page.locator('[data-player-progress-close]').click();
  await page.locator('.nav-tab[data-view="orders"]').click();
  await page.locator('[data-select-order="order-0"]').click();
  const beforeOrder=await readSave();
  assert(beforeOrder.energy<beforeOrder.maxEnergy,`capacity level-up seed is not low-energy: ${beforeOrder.energy}/${beforeOrder.maxEnergy}`);
  const serve=page.locator('button[data-order="order-0"]');
  assert(await serve.isEnabled(),'capacity level-up QA serve button is disabled');
  await serve.click();await page.waitForTimeout(1500);
  const afterOrder=await readSave();
  assert(afterOrder.playerXp===860,`capacity order XP incorrect: ${beforeOrder.playerXp} -> ${afterOrder.playerXp}`);
  assert(afterOrder.coins===270,`capacity level-up + guest milestone coin reward incorrect: ${beforeOrder.coins} -> ${afterOrder.coins}`);
  assert(afterOrder.guestVisits?.mika===1,`capacity level-up order did not record first Mika visit: ${JSON.stringify(afterOrder.guestVisits)}`);
  assert(afterOrder.maxEnergy===45&&afterOrder.energy===45,`Level 5 did not expand/refill Energy: ${beforeOrder.energy}/${beforeOrder.maxEnergy} -> ${afterOrder.energy}/${afterOrder.maxEnergy}`);
  assert((await page.locator('.resource.energy').textContent())?.includes('45/45'),'HUD energy did not show 45/45 after capacity level-up');
  assert((await page.locator('.player-level-badge').textContent())?.includes('LV 5'),'HUD did not advance to LV 5');
  const overlay=page.locator('.level-up-overlay');
  assert(await overlay.isVisible(),'capacity level-up overlay is not visible');
  const overlayText=await overlay.textContent();
  assert(overlayText?.includes('Level 5')&&overlayText?.includes('+100 Coins')&&overlayText?.includes('Energie voll')&&overlayText?.includes('Max-Energie +5'),`capacity level-up reward copy missing: ${overlayText}`);
  await assertLevelUpFits('390x844 capacity level-up');await shot('20-player-level-up-order');
  await page.setViewportSize({width:390,height:720});await page.waitForTimeout(80);await assertLevelUpFits('390x720 capacity level-up');await shot('26-energy-capacity-level-up-short-safari');
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(80);
  report.order={beforeXp:beforeOrder.playerXp,afterXp:afterOrder.playerXp,coins:afterOrder.coins,beforeEnergy:beforeOrder.energy,afterEnergy:afterOrder.energy,maxEnergy:afterOrder.maxEnergy,capacityGain:5,guestVisits:afterOrder.guestVisits};

  await page.reload({waitUntil:'networkidle'});await page.waitForSelector('.player-level-badge');
  const reloadedOrder=await readSave();
  assert(reloadedOrder.playerXp===860,'player XP was lost after capacity reload');
  assert(reloadedOrder.energy===45&&reloadedOrder.maxEnergy===45,'Level 5 capacity/refill was lost after reload');
  assert((await page.locator('.player-level-badge').textContent())?.includes('LV 5'),'reloaded HUD lost player level');

  await page.evaluate(async()=>{
    const game=await import('./src/v2-game.js');
    const state=game.createInitialState();state.playerXp=170;state.stars=10;state.coins=100;state.energy=9;state.maxEnergy=40;state.energyUpdatedAt=Date.now()-30_000;
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
  assert(afterBuild.energy===afterBuild.maxEnergy&&afterBuild.energy===40,`restoration level-up did not refill energy: ${afterBuild.energy}/${afterBuild.maxEnergy}`);
  assert((await page.locator('.resource.energy').textContent())?.includes('40/40'),'HUD energy did not show full refill after restoration level-up');
  assert((await page.locator('.player-level-badge').textContent())?.includes('LV 3'),'HUD did not advance to LV 3 after restoration');
  const restorationOverlay=page.locator('.level-up-overlay');
  assert(await restorationOverlay.isVisible(),'restoration level-up overlay is not visible');
  const restorationOverlayText=await restorationOverlay.textContent();
  assert(restorationOverlayText?.includes('+100 Coins')&&restorationOverlayText?.includes('Energie voll'),`restoration level-up reward copy missing: ${restorationOverlayText}`);
  assert(!(await page.locator('.restoration-reveal').isVisible().catch(()=>false)),'restoration and level-up reveals overlap instead of sequencing');
  await shot('21-player-level-up-restoration');
  report.restoration={xp:afterBuild.playerXp,coins:afterBuild.coins,energy:afterBuild.energy,maxEnergy:afterBuild.maxEnergy,upgrades:afterBuild.placeUpgrades};

  await page.evaluate(async()=>{
    const game=await import('./src/v2-game.js');
    const state=game.createInitialState();state.playerXp=840;state.stats.orders=4;state.stats.merges=31;
    state.placeUpgrades=['lights','counter','menu','seating','terrace','sign','sunset-lanterns','sunset-bar','sunset-lounge','sunset-fire','sunset-stage','sunset-sign'];
    state.discoveries=['item:coffee:1','item:coffee:2','item:coffee:3','item:coffee:4','item:coffee:5','item:coffee:6','item:bakery:1','item:bakery:2','item:bakery:3','item:bakery:4','item:bakery:5','item:bakery:6'];
    localStorage.setItem('poply-v2-state-1',JSON.stringify(state));
  });
  await page.reload({waitUntil:'networkidle'});await page.waitForSelector('.player-level-badge');
  const levelFiveSave=await readSave();assert(levelFiveSave.maxEnergy===45&&levelFiveSave.energy===40,`legacy Level 5 capacity sync should expand cap without retroactive refill: ${levelFiveSave.energy}/${levelFiveSave.maxEnergy}`);
  assert((await page.locator('.player-level-badge').textContent())?.includes('LV 5'),'seeded milestone player is not LV 5');
  const levelLabel=await page.locator('.player-level-badge').getAttribute('aria-label');
  assert(levelLabel?.includes('Poply-Profi'),'completed milestone title is not exposed from the level badge');
  assert(levelLabel?.includes('2 Place-Abzeichen'),`completed Place badges are not exposed from the level badge: ${levelLabel}`);
  await page.locator('.player-level-badge').click();await page.waitForSelector('.player-progress-sheet');
  const sheetText=await page.locator('.player-progress-sheet').textContent();
  assert(sheetText?.includes('5/5 Meilensteine'),'completed milestone summary is wrong');assert(await page.locator('.milestone-row.complete').count()===5,'not all seeded milestones render complete');
  assert(sheetText?.includes('Poply-Profi')&&sheetText?.includes('Höchster Titel erreicht'),`earned player title is missing: ${sheetText}`);
  assert(sheetText?.includes('DEINE PLACES')&&sheetText?.includes('2/2'),`Place badge summary is missing: ${sheetText}`);
  assert(await page.locator('.place-badge.complete').count()===2,'not all completed Places render as earned badges');
  assert(sheetText?.includes('Café')&&sheetText?.includes('Sonnenkai')&&sheetText?.includes('Abzeichen verdient'),`earned Place badge copy is missing: ${sheetText}`);
  assert(sheetText?.includes('NÄCHSTES LEVEL')&&sheetText?.includes('360 XP fehlen'),`next level preview is wrong: ${sheetText}`);
  assert(sheetText?.includes('+100')&&sheetText?.includes('Coins')&&sheetText?.includes('Energie voll'),`next level reward is missing: ${sheetText}`);
  await assertSheetFits('390x844 milestones');await shot('22-player-milestones-390x844');
  await page.setViewportSize({width:390,height:720});await page.waitForTimeout(120);await assertSheetFits('390x720 milestones');await shot('23-player-milestones-short-safari');
  await page.locator('[data-player-progress-close]').click();assert(!(await page.locator('.player-progress-sheet').isVisible().catch(()=>false)),'milestone sheet did not close');
  const milestoneSave=await readSave();assert(milestoneSave.playerXp===840&&milestoneSave.stats.merges===31,'opening milestones mutated player progress');assert(milestoneSave.maxEnergy===45&&milestoneSave.energy===40,'opening milestones mutated synced Energy capacity');assert(!('placeBadges' in milestoneSave),'Place badge UI persisted duplicate badge state');
  report.milestones={completed:5,total:5,title:'Poply-Profi',placeBadges:2,playerXp:milestoneSave.playerXp,merges:milestoneSave.stats.merges,maxEnergy:milestoneSave.maxEnergy,nextLevel:6,remainingXp:360,rewardCoins:100,rewardEnergy:'full',stateNeutral:true};

  if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){failure=error;try{await shot('29-progression-failure');}catch{}}
finally{
  await writeFile(`${outDir}/progression-report.json`,JSON.stringify({report,problems,failure:failure?.message||null},null,2));
  await browser.close();
}
if(failure)throw failure;
console.log('Player progression + milestones WebKit QA passed.');