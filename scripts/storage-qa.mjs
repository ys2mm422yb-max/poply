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
const assertFits=async label=>{
  const m=await page.evaluate(()=>{const r=s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();return {top:b.top,bottom:b.bottom,left:b.left,right:b.right,height:b.height};};return {h:window.visualViewport?.height||innerHeight,app:r('.app-shell'),view:r('.game-view'),nav:r('.main-nav'),drawer:r('.storage-drawer'),scroll:document.documentElement.scrollHeight,inner:innerHeight};});
  assert(m.app&&m.view&&m.nav&&m.drawer,`${label}: storage shell missing`);assert(m.nav.bottom<=m.h+1,`${label}: nav clipped ${JSON.stringify(m)}`);assert(m.app.bottom<=m.h+1,`${label}: app exceeds viewport ${JSON.stringify(m)}`);assert(m.drawer.bottom<=m.nav.top+1,`${label}: storage drawer overlaps navigation ${JSON.stringify(m)}`);assert(m.scroll<=m.inner+1,`${label}: document scrolls ${JSON.stringify(m)}`);return m;
};
let report={},failure=null;

try{
  await page.goto(baseURL,{waitUntil:'networkidle'});
  await page.evaluate(async()=>{const game=await import('./src/v2-game.js');const state=game.createInitialState();state.coins=300;delete state.storage;delete state.storageCapacity;localStorage.setItem('poply-v2-state-1',JSON.stringify(state));});
  await page.reload({waitUntil:'networkidle'});await page.waitForSelector('.view-board');
  const initial=await readSave();assert(initial.storageCapacity===4&&initial.storage.length===0,'storage migration did not create 0/4 storage');
  const handle=page.locator('.storage-handle');assert(await handle.isVisible(),'storage handle missing');assert((await handle.textContent())?.includes('0/4'),'storage handle count is wrong');
  await handle.click();await page.waitForSelector('.storage-drawer');await assertFits('390x844 storage');
  assert(await page.locator('[data-storage-store="0"]').count()===0,'coffee generator is incorrectly offered for storage');
  assert(await page.locator('[data-storage-store="6"]').count()===0,'pantry generator is incorrectly offered for storage');
  assert(await page.locator('[data-storage-recycle="0"]').count()===0,'coffee generator is incorrectly offered for recycling');
  assert(await page.locator('[data-storage-recycle="6"]').count()===0,'pantry generator is incorrectly offered for recycling');

  const before=await readSave(),storedId=before.board[9].id;
  await page.locator('[data-storage-store="9"]').click();await page.waitForTimeout(120);
  const stored=await readSave();assert(stored.board[9]===null,'stored board slot was not freed');assert(stored.storage.length===1&&stored.storage[0].id===storedId,'stored item identity changed or disappeared');
  assert((await page.locator('.storage-handle').textContent())?.includes('1/4'),'storage handle did not update to 1/4');
  await shot('40-storage-item-stored');

  await page.reload({waitUntil:'networkidle'});await page.locator('.storage-handle').click();
  const reloadedStored=await readSave();assert(reloadedStored.storage[0].id===storedId,'stored item was lost after reload');
  await page.locator('[data-storage-restore="0"]').click();await page.waitForTimeout(120);
  const restored=await readSave();assert(restored.storage.length===0,'restored item remained in storage');assert(restored.board.some(item=>item?.id===storedId),'restored item identity is missing from board');

  if(!(await page.locator('.storage-drawer').isVisible()))await page.locator('.storage-handle').click();
  const upgrade=page.locator('[data-storage-upgrade]');assert(await upgrade.isEnabled(),'first 200-Coin storage upgrade should be affordable with 300 Coins');
  await upgrade.click();await page.waitForTimeout(160);
  const expanded=await readSave();assert(expanded.storageCapacity===6,`storage did not expand to 6: ${expanded.storageCapacity}`);assert(expanded.coins===100,`storage upgrade did not spend exactly 200 Coins: ${expanded.coins}`);
  assert((await page.locator('.storage-handle').textContent())?.includes('0/6'),'storage handle did not update to capacity 6');
  await shot('41-storage-expanded');

  const recycleIndex=10,recycleBefore=await readSave(),recycledId=recycleBefore.board[recycleIndex]?.id;
  assert(recycledId,'expected recyclable starter item is missing');
  const recycleButton=page.locator(`[data-storage-recycle="${recycleIndex}"]`);assert(await recycleButton.isVisible(),'recycle action is not visible in storage tray');
  page.once('dialog',dialog=>dialog.accept());await recycleButton.click();await page.waitForTimeout(160);
  const recycled=await readSave();assert(recycled.board[recycleIndex]===null,'recycled item did not free its board slot');assert(recycled.coins===101,`tier-1 recycle should return exactly 1 Coin, got ${recycled.coins}`);assert(recycled.storage.length===0,'recycling unexpectedly changed stored items');
  await shot('43-storage-recycled');

  await page.setViewportSize({width:390,height:720});await page.waitForTimeout(120);if(!(await page.locator('.storage-drawer').isVisible()))await page.locator('.storage-handle').click();await assertFits('390x720 storage');await shot('42-storage-short-safari');
  await page.reload({waitUntil:'networkidle'});const persisted=await readSave();assert(persisted.storageCapacity===6&&persisted.coins===101,'storage/recycle state was lost after reload');assert(persisted.board[recycleIndex]===null,'recycled item returned after reload');
  report={storedId,recycledId,storageCapacity:persisted.storageCapacity,coins:persisted.coins,recycleFreedIndex:recycleIndex};
  if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){failure=error;try{await shot('49-storage-failure');}catch{}}
finally{await writeFile(`${outDir}/storage-report.json`,JSON.stringify({report,problems,failure:failure?.message||null},null,2));await browser.close();}
if(failure)throw failure;
console.log('Storage + board recovery WebKit QA passed.');
