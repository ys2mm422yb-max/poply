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
const seedBuildReady=()=>page.evaluate(async()=>{
  const game=await import('./src/v2-game.js');
  const state=game.createInitialState();
  state.stars=10;
  state.playerXp=0;
  localStorage.setItem('poply-v2-state-1',JSON.stringify(state));
});
const assertShellFits=async label=>{
  const m=await page.evaluate(()=>{
    const box=selector=>{const el=document.querySelector(selector);if(!el)return null;const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.width,height:r.height};};
    return {height:window.visualViewport?.height||innerHeight,innerHeight,scrollHeight:document.documentElement.scrollHeight,app:box('.app-shell'),hero:box('.world-hero'),reveal:box('.restoration-reveal'),level:box('.level-up-overlay'),nav:box('.main-nav')};
  });
  assert(m.app&&m.hero&&m.nav,`${label}: Place shell missing ${JSON.stringify(m)}`);
  assert(m.app.bottom<=m.height+1,`${label}: app exceeds viewport ${JSON.stringify(m)}`);
  assert(m.nav.bottom<=m.height+1,`${label}: nav clipped ${JSON.stringify(m)}`);
  assert(m.scrollHeight<=m.innerHeight+1,`${label}: document scrolls ${JSON.stringify(m)}`);
  if(m.reveal){assert(m.reveal.left>=0&&m.reveal.right<=390,`${label}: reveal clips horizontally ${JSON.stringify(m)}`);assert(m.reveal.top>=0&&m.reveal.bottom<=m.nav.top+1,`${label}: reveal overlaps nav ${JSON.stringify(m)}`);}
  return m;
};
const runBuild=async(label,shotName)=>{
  await seedBuildReady();
  await page.reload({waitUntil:'networkidle'});
  await page.locator('.nav-tab[data-view="place"]').click();
  await page.waitForSelector('.production-place.place-coast .world-hero');
  const build=page.locator('[data-action="build"]');
  assert(await build.isEnabled(),`${label}: build button disabled`);
  await build.click();
  await page.waitForSelector('.restoration-reveal',{state:'visible',timeout:900});
  await page.waitForTimeout(360);
  const revealText=await page.locator('.restoration-reveal').textContent();
  assert(revealText?.includes('AUSBAU FERTIG'),`${label}: restoration copy missing: ${revealText}`);
  assert(revealText?.includes('Lichter'),`${label}: first upgrade label missing: ${revealText}`);
  const hook=await page.locator('.world-hero').evaluate(el=>({hasFx:el.classList.contains('fx-restoration-reveal'),animation:getComputedStyle(el).animationName,afterAnimation:getComputedStyle(el,'::after').animationName}));
  assert(hook.hasFx,`${label}: world hero did not receive fx-restoration-reveal`);
  assert((hook.animation||'').includes('restoration-scene-reveal'),`${label}: world hero reveal animation missing ${JSON.stringify(hook)}`);
  assert((hook.afterAnimation||'').includes('restoration-sweep'),`${label}: world hero sweep animation missing ${JSON.stringify(hook)}`);
  const fit=await assertShellFits(label);
  await shot(shotName);
  const save=await readSave();assert(save.placeUpgrades.includes('lights'),`${label}: build was not persisted`);
  return {hook,fit,stars:save.stars,upgrades:save.placeUpgrades};
};
const waitForQuietPlace=async label=>{
  await page.waitForTimeout(3400);
  assert(!(await page.locator('.restoration-reveal').isVisible().catch(()=>false)),`${label}: restoration reveal did not clear`);
  assert(!(await page.locator('.level-up-overlay').isVisible().catch(()=>false)),`${label}: level-up still covers static Place acceptance`);
  return assertShellFits(label);
};

let report={},failure=null;
try{
  await page.goto(baseURL,{waitUntil:'networkidle'});
  report.tall=await runBuild('390x844 restoration payoff','13-restoration-payoff-390x844');
  report.tallMeta=await waitForQuietPlace('390x844 restoration meta');
  await shot('15-restoration-place-meta-390x844');

  await page.setViewportSize({width:390,height:720});await page.waitForTimeout(120);
  report.short=await runBuild('390x720 restoration payoff','14-restoration-payoff-short-safari');
  report.shortMeta=await waitForQuietPlace('390x720 restoration meta');
  await shot('16-restoration-place-meta-short-safari');
  if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){failure=error;try{await shot('19-restoration-payoff-failure');}catch{}}
finally{
  await writeFile(`${outDir}/restoration-payoff-report.json`,JSON.stringify({report,problems,failure:failure?.message||null},null,2));
  await browser.close();
}
if(failure)throw failure;
console.log('Restoration payoff WebKit QA passed.');
