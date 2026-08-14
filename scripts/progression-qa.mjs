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
let report={},failure=null;

try{
  await page.goto(baseURL,{waitUntil:'networkidle'});
  await page.waitForSelector('.player-level-badge');
  assert((await page.locator('.player-level-badge').textContent())?.includes('LV 1'),'fresh player level badge is not LV 1');
  const badge=await page.locator('.player-level-badge').boundingBox(),resources=await page.locator('.resources').boundingBox();
  assert(badge&&resources&&badge.x+badge.width<=resources.x+1,`player level badge overlaps resources ${JSON.stringify({badge,resources})}`);

  // Real order delivery crosses Level 1 -> 2 and must persist the reward.
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
  await serve.click();await page.waitForTimeout(520);
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

  // Real restoration crosses Level 2 -> 3 through the build action.
  await page.evaluate(async()=>{
    const game=await import('./src/v2-game.js');
    const state=game.createInitialState();state.playerXp=170;state.stars=10;state.coins=100;
    localStorage.setItem('poply-v2-state-1',JSON.stringify(state));
  });
  await page.reload({waitUntil:'networkidle'});
  await page.locator('.nav-tab[data-view="place"]').click();
  const build=page.locator('[data-action="build"]');assert(await build.isEnabled(),'restoration level-up build is disabled');
  await build.click();await page.waitForTimeout(520);
  const afterBuild=await readSave();
  assert(afterBuild.placeUpgrades.includes('lights'),'restoration was not persisted');
  assert(afterBuild.playerXp===310,`restoration XP incorrect: ${afterBuild.playerXp}`);
  assert(afterBuild.coins===200,`restoration level reward missing: ${afterBuild.coins}`);
  assert((await page.locator('.player-level-badge').textContent())?.includes('LV 3'),'HUD did not advance to LV 3 after restoration');
  assert(await page.locator('.level-up-overlay').isVisible(),'restoration level-up overlay is not visible');
  await shot('21-player-level-up-restoration');
  report.restoration={xp:afterBuild.playerXp,coins:afterBuild.coins,upgrades:afterBuild.placeUpgrades};

  if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){failure=error;try{await shot('29-progression-failure');}catch{}}
finally{
  await writeFile(`${outDir}/progression-report.json`,JSON.stringify({report,problems,failure:failure?.message||null},null,2));
  await browser.close();
}
if(failure)throw failure;
console.log('Player progression WebKit QA passed.');
