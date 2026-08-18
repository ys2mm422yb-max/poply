import { webkit } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const baseURL=process.env.QA_BASE_URL||'http://127.0.0.1:4173';
const outDir=process.env.QA_OUT_DIR||'qa-artifacts';
const SAFE_TOP=47,SAFE_BOTTOM=34;
await mkdir(outDir,{recursive:true});

const browser=await webkit.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},screen:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:'de-DE'});
const page=await context.newPage();
const problems=[];
page.on('console',msg=>{if(['error','warning'].includes(msg.type()))problems.push(`${msg.type()}: ${msg.text()}`);});
page.on('pageerror',error=>problems.push(`pageerror: ${error.message}`));
const assert=(value,message)=>{if(!value)throw new Error(message);};
const shot=name=>page.screenshot({path:`${outDir}/${name}.png`,fullPage:false});

const applySafeArea=async()=>{
  await page.evaluate(({top,bottom})=>{
    document.documentElement.style.setProperty('--poply-safe-top',`${top}px`);
    document.documentElement.style.setProperty('--poply-safe-bottom',`${bottom}px`);
  },{top:SAFE_TOP,bottom:SAFE_BOTTOM});
  await page.waitForTimeout(100);
};

async function metrics(label){
  const data=await page.evaluate(({safeTop,safeBottom})=>{
    const rect=element=>{if(!element)return null;const r=element.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.width,height:r.height,scrollWidth:element.scrollWidth,clientWidth:element.clientWidth};};
    const topbar=document.querySelector('.topbar');
    const brand=document.querySelector('.brand');
    const badge=document.querySelector('.player-level-badge');
    const actions=document.querySelector('.top-actions');
    const menu=document.querySelector('.icon-button');
    const nav=document.querySelector('.main-nav');
    const resources=[...document.querySelectorAll('.topbar .resource')].map(node=>({text:node.textContent.trim(),...rect(node)}));
    return {
      safeTop,safeBottom,
      safeTopVar:getComputedStyle(document.documentElement).getPropertyValue('--poply-safe-top').trim(),
      safeBottomVar:getComputedStyle(document.documentElement).getPropertyValue('--poply-safe-bottom').trim(),
      viewportHeight:window.visualViewport?.height||innerHeight,
      innerHeight,
      scrollHeight:document.documentElement.scrollHeight,
      app:rect(document.querySelector('.app-shell')),
      topbar:rect(topbar),brand:rect(brand),badge:rect(badge),actions:rect(actions),menu:rect(menu),nav:rect(nav),resources
    };
  },{safeTop:SAFE_TOP,safeBottom:SAFE_BOTTOM});
  assert(data.safeTopVar===`${SAFE_TOP}px`,`${label}: top safe-area override missing ${JSON.stringify(data)}`);
  assert(data.safeBottomVar===`${SAFE_BOTTOM}px`,`${label}: bottom safe-area override missing ${JSON.stringify(data)}`);
  assert(data.app&&data.topbar&&data.brand&&data.badge&&data.actions&&data.menu&&data.nav,`${label}: shell nodes missing ${JSON.stringify(data)}`);
  assert(data.topbar.height>=56+SAFE_TOP-1,`${label}: topbar row did not budget safe area ${JSON.stringify(data)}`);
  assert(data.nav.height>=58+SAFE_BOTTOM-1,`${label}: dock row did not budget bottom safe area ${JSON.stringify(data)}`);
  for(const [name,box] of [['brand',data.brand],['level badge',data.badge],['menu',data.menu],...data.resources.map((box,index)=>[`resource ${index}`,box])]){
    assert(box.top>=SAFE_TOP,`${label}: ${name} enters iOS status area ${JSON.stringify(box)}`);
    assert(box.right<=390.5,`${label}: ${name} clips right edge ${JSON.stringify(box)}`);
    assert(box.left>=-0.5,`${label}: ${name} clips left edge ${JSON.stringify(box)}`);
  }
  assert(data.badge.left>=data.brand.left&&data.badge.right<=data.brand.right+0.5,`${label}: level badge escapes brand footprint ${JSON.stringify(data)}`);
  assert(data.brand.right<=data.actions.left+0.5,`${label}: brand overlaps top actions ${JSON.stringify(data)}`);
  assert(data.actions.right<=390.5,`${label}: top actions clip right edge ${JSON.stringify(data)}`);
  for(let index=1;index<data.resources.length;index++)assert(data.resources[index-1].right<=data.resources[index].left+0.5,`${label}: resource pills overlap ${JSON.stringify(data.resources)}`);
  assert(data.resources.at(-1).right<=data.menu.left+0.5,`${label}: resource pills overlap menu ${JSON.stringify(data)}`);
  assert(data.nav.bottom<=data.app.bottom+1&&data.nav.bottom>=data.app.bottom-1,`${label}: dock no longer owns shell bottom ${JSON.stringify(data)}`);
  assert(data.scrollHeight<=data.innerHeight+1,`${label}: document scrolls ${JSON.stringify(data)}`);
  return data;
}

let report={},failure=null;
try{
  await page.goto(baseURL,{waitUntil:'networkidle'});
  await page.waitForSelector('.topbar .player-level-badge');
  await applySafeArea();
  report.tall=await metrics('standalone 390x844');
  await shot('09-standalone-safe-area-390x844');

  await page.setViewportSize({width:390,height:720});
  await applySafeArea();
  report.short=await metrics('standalone 390x720');
  await shot('10-standalone-safe-area-390x720');

  if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){failure=error;try{await shot('11-standalone-safe-area-failure');}catch{}}
finally{
  await writeFile(`${outDir}/standalone-safe-area-report.json`,JSON.stringify({safeTop:SAFE_TOP,safeBottom:SAFE_BOTTOM,report,problems,failure:failure?.message||null},null,2));
  await browser.close();
}
if(failure)throw failure;
console.log('Standalone safe-area WebKit QA passed.');