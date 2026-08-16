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
const upgrades=['lights','counter','menu','seating','terrace','sign'];
const shot=name=>page.screenshot({path:`${outDir}/${name}.png`,fullPage:false});
const assertNoScroll=async label=>{const m=await page.evaluate(()=>({scroll:document.documentElement.scrollHeight,inner:innerHeight}));assert(m.scroll<=m.inner+1,`${label}: document scrolls ${JSON.stringify(m)}`);};
const assertMapFits=async label=>{const m=await page.evaluate(()=>{const sheet=document.querySelector('.place-map-sheet'),box=sheet?.getBoundingClientRect();return {height:window.visualViewport?.height||innerHeight,top:box?.top,bottom:box?.bottom};});assert(m.top>=0&&m.bottom<=m.height+1,`${label}: completed Place revisit map clipped ${JSON.stringify(m)}`);};
const reload=async()=>{await page.reload({waitUntil:'networkidle'});await page.waitForSelector('.game-view');};
const viewPlace=async()=>{await page.locator('.nav-tab[data-view="place"]').tap();await page.waitForSelector('.view-place .world-hero');};
const seed=async stage=>{
  await page.evaluate(async({stage,upgrades})=>{
    const game=await import('./src/v2-game.js');
    const state=game.createInitialState();
    state.placeUpgrades=upgrades.slice(0,stage);
    state.stars=stage===4?10:0;
    localStorage.setItem('poply-v2-state-1',JSON.stringify(state));
    localStorage.removeItem('poply-v2-state-1-backup');
  },{stage,upgrades});
  await reload();await viewPlace();
  if(stage===6){
    assert((await page.locator('.view-place .world-copy').textContent())?.includes('Sonnenkai'),'stage 6: real completion must advance active Place to Sonnenkai');
    await page.locator('[data-action="place-map"]').tap();
    await page.waitForSelector('.place-map-sheet');
    await page.locator('[data-map-place="coast"]').tap();
    await page.waitForSelector('.place-map-preview.place-coast .place-scene-v2');
  }
  await page.waitForTimeout(180);
};
const inspectPlaceScreenV4=async(stage,height)=>{
  const m=await page.evaluate(()=>{
    const view=document.querySelector('.view-place'),hero=view?.querySelector('.world-hero'),command=view?.querySelector('.place-command'),journey=view?.querySelector('.journey-wrap'),dial=view?.querySelector('.place-progress-dial'),status=view?.querySelector('.place-goal-status'),orders=view?.querySelector('[data-place-v4-orders]'),button=view?.querySelector('.place-current-goal>button');
    const viewBox=view?.getBoundingClientRect(),heroBox=hero?.getBoundingClientRect(),journeyBox=journey?.getBoundingClientRect(),buttonBox=button?.getBoundingClientRect(),navBox=document.querySelector('.main-nav')?.getBoundingClientRect();
    return {
      heroShare:viewBox&&heroBox?heroBox.height/viewBox.height:0,
      mapInHero:Boolean(hero?.querySelector(':scope > [data-action="place-map"]')),
      mapInCommand:Boolean(command?.querySelector('[data-action="place-map"]')),
      dialDisplay:dial?getComputedStyle(dial).display:null,
      journeyHeight:journeyBox?.height||0,
      statusText:status?.textContent?.replace(/\s+/g,' ').trim()||'',
      hasOrdersRoute:Boolean(orders),
      buttonDisabled:Boolean(button?.disabled),
      buttonAction:button?.getAttribute('data-action')||'',
      buttonText:button?.textContent?.replace(/\s+/g,' ').trim()||'',
      buttonDescribedBy:button?.getAttribute('aria-describedby')||'',
      ctaAboveNav:Boolean(buttonBox&&navBox&&buttonBox.bottom<=navBox.top+1)
    };
  });
  assert(m.heroShare>.55,`stage ${stage} ${height}: café scene is not primary enough ${JSON.stringify(m)}`);
  assert(m.mapInHero&&!m.mapInCommand,`stage ${stage} ${height}: map launcher must be a hero utility ${JSON.stringify(m)}`);
  assert(m.dialDisplay==='none',`stage ${stage} ${height}: legacy progress dial still visible ${JSON.stringify(m)}`);
  assert(m.journeyHeight<=35,`stage ${stage} ${height}: restoration progress is still too dominant ${JSON.stringify(m)}`);
  assert(m.statusText.includes('Noch'),`stage ${stage} ${height}: missing-star fact is not visible ${JSON.stringify(m)}`);
  assert(m.hasOrdersRoute,`stage ${stage} ${height}: missing-star CTA to orders is absent`);
  assert(!m.buttonDisabled&&!m.buttonAction,`stage ${stage} ${height}: blocked build still behaves like a dead build button ${JSON.stringify(m)}`);
  assert(m.buttonText.includes('Aufträgen holen'),`stage ${stage} ${height}: active CTA does not explain the route ${JSON.stringify(m)}`);
  assert(m.buttonDescribedBy==='place-build-status',`stage ${stage} ${height}: CTA lacks explicit missing-star status relationship ${JSON.stringify(m)}`);
  assert(m.ctaAboveNav,`stage ${stage} ${height}: primary CTA is clipped by bottom navigation ${JSON.stringify(m)}`);
  if(stage===4){
    assert(m.statusText.includes('Noch 1 Stern'),`stage 4 ${height}: Meerterrasse 10/11 status must say exactly one star is missing ${JSON.stringify(m)}`);
    assert(m.buttonText==='1 ★ in Aufträgen holen',`stage 4 ${height}: Meerterrasse 10/11 CTA is not explicit ${JSON.stringify(m)}`);
  }
};
const inspectLiveStage=async(stage,height)=>{
  const hero=page.locator('.view-place .world-hero');
  const scene=hero.locator('.place-scene-v2');
  assert(await scene.count()===1,`stage ${stage}: Scene V2 root missing`);
  assert(await scene.locator('.scene-depth-back').count()===1,`stage ${stage}: back depth missing`);
  assert(await scene.locator('.cafe-side-face').count()===1,`stage ${stage}: volumetric side face missing`);
  const builtCount=await scene.evaluate(svg=>Array.from(svg.children).filter(node=>node.classList?.contains('scene-upgrade')&&!node.classList.contains('scene-upgrade-preview')).length);
  assert(builtCount===stage,`stage ${stage}: expected ${stage} built authored upgrade groups, got ${builtCount}`);
  const preview=scene.locator(':scope > .scene-upgrade-preview');
  assert(await preview.count()===1,`stage ${stage}: next-upgrade blueprint preview missing`);
  assert(await preview.getAttribute('data-preview-upgrade')===upgrades[stage],`stage ${stage}: blueprint does not match next authored upgrade`);
  if(stage>0){
    const latest=scene.locator(`:scope > .scene-upgrade.${upgrades[stage-1]}:not(.scene-upgrade-preview)`),box=await latest.boundingBox(),heroBox=await hero.boundingBox();
    assert(box&&heroBox,`stage ${stage}: latest built authored upgrade geometry missing`);
    const ratio=(box.width*box.height)/(heroBox.width*heroBox.height);
    assert(ratio>.035,`stage ${stage}: latest built authored upgrade is visually too small (${ratio.toFixed(3)})`);
  }
  await inspectPlaceScreenV4(stage,height);
  if(stage===5){
    const after=page.locator('.purpose-place-goal .purpose-place-after>strong');
    assert(await after.count()===1,`stage 5 ${height}: final DANACH teaser missing`);
    const teaser=await after.evaluate(el=>{const style=getComputedStyle(el),box=el.getBoundingClientRect();return {text:el.textContent?.trim()||'',whiteSpace:style.whiteSpace,textOverflow:style.textOverflow,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,height:box.height,lineHeight:parseFloat(style.lineHeight)||0};});
    assert(teaser.text.includes('Sonnenkai')&&teaser.text.includes('Tropenbar'),`stage 5 ${height}: final DANACH promise incomplete: ${teaser.text}`);
    assert(teaser.whiteSpace!=='nowrap'&&teaser.textOverflow!=='ellipsis',`stage 5 ${height}: final DANACH teaser still uses truncation CSS ${JSON.stringify(teaser)}`);
    assert(teaser.scrollWidth<=teaser.clientWidth+1,`stage 5 ${height}: final DANACH teaser overflows horizontally ${JSON.stringify(teaser)}`);
    assert(!teaser.lineHeight||teaser.height<=teaser.lineHeight*2.8,`stage 5 ${height}: final DANACH teaser exceeds readable height ${JSON.stringify(teaser)}`);
  }
  await assertNoScroll(`Scene V2 stage ${stage} ${height}`);
};
const inspectCompletedRevisit=async height=>{
  const preview=page.locator('.place-map-preview.place-coast');
  const scene=preview.locator('.place-scene-v2');
  assert((await preview.textContent())?.includes('vollständig restauriert'),'stage 6: completed Café revisit status missing');
  assert((await preview.textContent())?.includes('6 / 6 Ausbauten'),'stage 6: completed Café progress missing');
  assert(await scene.count()===1,'stage 6: completed Café Scene V2 missing');
  assert(await scene.locator('.scene-depth-back').count()===1,'stage 6: completed Café back depth missing');
  assert(await scene.locator('.cafe-side-face').count()===1,'stage 6: completed Café volumetric side face missing');
  const builtCount=await scene.evaluate(svg=>Array.from(svg.children).filter(node=>node.classList?.contains('scene-upgrade')&&!node.classList.contains('scene-upgrade-preview')).length);
  assert(builtCount===6,`stage 6: expected six real built authored upgrade groups, got ${builtCount}`);
  assert(await scene.locator(':scope > .scene-upgrade-preview').count()===0,'stage 6: completed Café must not show a blueprint preview');
  const sign=scene.locator(':scope > .scene-upgrade.sign'),box=await sign.boundingBox(),sceneBox=await scene.boundingBox();
  assert(box&&sceneBox,'stage 6: completed Poply sign geometry missing');
  const ratio=(box.width*box.height)/(sceneBox.width*sceneBox.height);
  assert(ratio>.035,`stage 6: completed Poply sign is visually too small (${ratio.toFixed(3)})`);
  await assertMapFits(`Scene V2 stage 6 ${height}`);
  await assertNoScroll(`Scene V2 stage 6 ${height}`);
};
const inspectStage=async(stage,height)=>{
  await seed(stage);
  if(stage===6)await inspectCompletedRevisit(height);else await inspectLiveStage(stage,height);
  await shot(`scene-v2-stage-${stage}-390x${height}`);
};

let failure=null,report={};
try{
  await page.goto(baseURL,{waitUntil:'networkidle'});
  for(const height of [844,720]){
    await page.setViewportSize({width:390,height});
    for(let stage=0;stage<=6;stage++)await inspectStage(stage,height);
  }
  report={stages:[0,1,2,3,4,5,6],viewports:['390x844','390x720'],screenshots:14,stage4Meerterrasse:'10/11 stars -> exact one-star Orders CTA',stage6Mode:'real completed coast revisit',finalTeaser:'readable without truncation',placeScreenV4:'scene primary, icon map utility, active missing-star CTA, minimal progress'};
  if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){failure=error;try{await shot('scene-v2-failure');}catch{}}
finally{await writeFile(`${outDir}/place-scene-v2-report.json`,JSON.stringify({report,problems,failure:failure?.message||null},null,2));await browser.close();}
if(failure)throw failure;
console.log('Place Scene V2 + Place Screen V4 WebKit QA passed.');