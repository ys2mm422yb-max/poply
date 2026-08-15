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
const assertNoScroll=async label=>{const m=await page.evaluate(()=>({scroll:document.documentElement.scrollHeight,inner:innerHeight}));assert(m.scroll<=m.inner+1,`${label}: document scrolls ${JSON.stringify(m)}`);};

let report={},failure=null;
try{
  await page.goto(baseURL,{waitUntil:'networkidle'});
  await page.evaluate(async()=>{
    const game=await import('./src/v2-game.js');
    const state=game.createInitialState();
    state.currentOrders=[game.createOrder(0),game.createOrder(1),game.createOrder(2)];
    state.orderSequence=3;
    state.stats={merges:2,generated:6,orders:0};
    localStorage.setItem('poply-v2-state-1',JSON.stringify(state));
  });
  await page.reload({waitUntil:'networkidle'});
  await page.locator('.nav-tab[data-view="orders"]').click();
  await page.waitForSelector('.view-orders .customer-choice');

  const migrated=await readSave();
  const titles=migrated.currentOrders.map(order=>order.title);
  assert(JSON.stringify(titles)===JSON.stringify(['Erster Kaffee','Frühstück am Fenster','Süße Begrüßung']),`legacy save did not migrate ${JSON.stringify(titles)}`);
  assert(migrated.stats.merges===2&&migrated.stats.generated===6&&migrated.stats.orders===0,`migration damaged player stats ${JSON.stringify(migrated.stats)}`);
  const visible=(await page.locator('.view-orders').textContent())||'';
  for(const title of titles)assert(visible.includes(title),`migrated order not visible: ${title}`);
  for(const oldTitle of ['Morgenkaffee','Frisches Gebäck','Kleine Pause'])assert(!visible.includes(oldTitle),`legacy order still visible: ${oldTitle}`);
  await assertNoScroll('legacy opening migration 390x844');
  await shot('94-legacy-opening-migrated-390x844');

  await page.setViewportSize({width:390,height:720});
  await page.waitForTimeout(100);
  await assertNoScroll('legacy opening migration 390x720');
  await shot('95-legacy-opening-migrated-390x720');

  report={titles,preservedStats:migrated.stats,oldTitlesRemoved:true,viewports:['390x844','390x720']};
  if(problems.length)throw new Error(`console problems: ${problems.join(' | ')}`);
}catch(error){failure=error;try{await shot('99-legacy-opening-migration-failure');}catch{}}
finally{await writeFile(`${outDir}/legacy-opening-migration-report.json`,JSON.stringify({report,problems,failure:failure?.message||null},null,2));await browser.close();}
if(failure)throw failure;
console.log('Legacy opening-order migration WebKit QA passed.');
