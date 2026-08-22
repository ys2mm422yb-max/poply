import { webkit } from 'playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const baseURL=process.env.QA_BASE_URL||'http://127.0.0.1:4173';
const outDir=process.env.QA_OUT_DIR||'qa-artifacts';
const serverPidFile=process.env.QA_SERVER_PID_FILE||'/tmp/poply-http.pid';
const releasePath=new URL('../release.json',import.meta.url);
const originalRelease=await readFile(releasePath,'utf8');
const releaseA={sha:'qa-release-a',deployedAt:'2026-08-15T10:00:00Z'};
const releaseB={sha:'qa-release-b',deployedAt:'2026-08-15T10:01:00Z'};
const releaseC={sha:'qa-release-c',deployedAt:'2026-08-15T10:02:00Z'};
const CLIENT_RELEASE_KEY='poply-client-release-v1';
await mkdir(outDir,{recursive:true});
await writeFile(releasePath,`${JSON.stringify(releaseA,null,2)}\n`);

const browser=await webkit.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},screen:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:'de-DE'});
const page=await context.newPage();
const problems=[];
const expectedNetworkLoss=[];
let networkLossExpected=false;
const expectedConnectionRefused=/Failed to load resource: Could not connect to 127\.0\.0\.1: Connection refused/;
page.on('console',msg=>{
  if(!['error','warning'].includes(msg.type()))return;
  const text=`${msg.type()}: ${msg.text()}`;
  if(networkLossExpected&&expectedConnectionRefused.test(text)){expectedNetworkLoss.push(text);return;}
  problems.push(text);
});
page.on('pageerror',error=>problems.push(`pageerror: ${error.message}`));
const assert=(value,message)=>{if(!value)throw new Error(message);};
const readSave=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('poply-v2-state-1')||'null'));
const readClientRelease=()=>page.evaluate(key=>localStorage.getItem(key),CLIENT_RELEASE_KEY);
const waitForController=()=>page.evaluate(async()=>{
  if(!('serviceWorker' in navigator))return {supported:false};
  const registration=await navigator.serviceWorker.ready;
  if(!navigator.serviceWorker.controller){
    await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>reject(new Error('service worker did not claim page')),5000);
      navigator.serviceWorker.addEventListener('controllerchange',()=>{clearTimeout(timer);resolve();},{once:true});
    });
  }
  return {supported:true,scope:registration.scope,scriptURL:navigator.serviceWorker.controller?.scriptURL||null,controlled:Boolean(navigator.serviceWorker.controller)};
});
const installReleaseQa=()=>page.evaluate(async()=>{
  const updates=await import('./src/aaa-updates.js');
  const result=await updates.installAppUpdates({releasePolling:true});
  if(result.check)window.__poplyPwaQaCheck=result.check;
  return {releasePolling:result.releasePolling,bootRelease:result.bootRelease,bootReload:Boolean(result.bootReload)};
});
const startColdBootCheck=()=>page.evaluate(()=>{
  void import('./src/aaa-updates.js').then(updates=>updates.installAppUpdates({releasePolling:true}));
});
const stopStaticServer=async()=>{
  const raw=(await readFile(serverPidFile,'utf8')).trim();
  const pid=Number(raw);
  assert(Number.isInteger(pid)&&pid>1,`invalid static server pid: ${raw}`);
  process.kill(pid,'SIGTERM');
  let stopped=false;
  for(let attempt=0;attempt<20;attempt+=1){
    await new Promise(resolve=>setTimeout(resolve,50));
    try{process.kill(pid,0);}catch{stopped=true;break;}
  }
  assert(stopped,`static server ${pid} did not stop before fallback reload`);
  return pid;
};
let report={},failure=null;

try{
  await page.goto(baseURL,{waitUntil:'networkidle'});
  await page.waitForSelector('.game-view');
  report.install=await waitForController();
  assert(report.install.supported,'WebKit does not expose service workers');
  assert(report.install.controlled,`installed page is not service-worker controlled: ${JSON.stringify(report.install)}`);
  assert(report.install.scriptURL?.endsWith('/sw.js'),`unexpected controller script: ${report.install.scriptURL}`);

  // Normal local gameplay deliberately does not poll release.json. The dedicated PWA
  // suite opts into the production release-polling path explicitly so canonical behavior
  // is exercised without contaminating unrelated local WebKit flows.
  report.releasePolling=await installReleaseQa();
  assert(report.releasePolling.releasePolling===true,'dedicated PWA QA did not enable release polling');
  assert(report.releasePolling.bootRelease===releaseA.sha,`dedicated PWA QA boot release mismatch: ${JSON.stringify(report.releasePolling)}`);
  assert(report.releasePolling.bootReload===false,'first canonical install should establish a baseline without reloading');
  assert((await readClientRelease())===releaseA.sha,'first canonical install did not remember its release marker');

  await page.evaluate(async()=>{
    const game=await import('./src/v2-game.js');
    const state=game.createInitialState();
    state.coins=777;
    localStorage.setItem('poply-v2-state-1',JSON.stringify(state));
  });
  await page.reload({waitUntil:'networkidle'});
  await page.waitForSelector('.game-view');
  assert((await waitForController()).controlled,'service worker lost control after online reload');
  const onlineSave=await readSave();
  assert(onlineSave.coins===777,`online app update path mutated game save: ${onlineSave.coins}`);
  assert((await readClientRelease())===releaseA.sha,'client release marker did not survive normal reload');
  report.online={coins:onlineSave.coins,controlled:true,clientRelease:releaseA.sha};

  // Real-device regression: the app was closed/backgrounded on release A, canonical Pages
  // moved to B, then old/snapshotted client code boots. A persisted A marker must force one
  // automatic reload even though bootRelease itself is already B.
  await writeFile(releasePath,`${JSON.stringify(releaseB,null,2)}\n`);
  const coldNavigation=page.waitForNavigation({waitUntil:'networkidle',timeout:8000});
  await startColdBootCheck();
  await coldNavigation;
  await page.waitForSelector('.game-view');
  const coldRelease=await page.evaluate(()=>fetch('./release.json',{cache:'no-store'}).then(response=>response.json()));
  const coldNavigationType=await page.evaluate(()=>performance.getEntriesByType('navigation')[0]?.type||null);
  const coldSave=await readSave();
  const coldClientRelease=await readClientRelease();
  assert(coldRelease.sha===releaseB.sha,`cold-start release marker did not advance: ${JSON.stringify(coldRelease)}`);
  assert(coldNavigationType==='reload',`cold-start canonical mismatch did not trigger reload: ${coldNavigationType}`);
  assert(coldClientRelease===releaseB.sha,`cold-start client marker did not advance before reload: ${coldClientRelease}`);
  assert(coldSave.coins===777,`cold-start release reload mutated game save: ${coldSave.coins}`);
  assert((await waitForController()).controlled,'service worker lost control after cold-start update');
  report.coldStart={from:releaseA.sha,to:releaseB.sha,navigationType:coldNavigationType,clientRelease:coldClientRelease,coins:coldSave.coins};

  // Keep proving the already-running path as a separate contract: once B is current, a
  // visible running app must detect C and reload without needing a manual cache clear.
  report.releasePollingAfterColdStart=await installReleaseQa();
  assert(report.releasePollingAfterColdStart.bootRelease===releaseB.sha,`release baseline after cold-start reload mismatch: ${JSON.stringify(report.releasePollingAfterColdStart)}`);
  assert(report.releasePollingAfterColdStart.bootReload===false,'matching stored/client release unexpectedly reloaded again');

  await writeFile(releasePath,`${JSON.stringify(releaseC,null,2)}\n`);
  const navigation=page.waitForNavigation({waitUntil:'networkidle',timeout:8000});
  await page.evaluate(()=>window.__poplyPwaQaCheck({force:true}));
  await navigation;
  await page.waitForSelector('.game-view');
  const latestRelease=await page.evaluate(()=>fetch('./release.json',{cache:'no-store'}).then(response=>response.json()));
  const navigationType=await page.evaluate(()=>performance.getEntriesByType('navigation')[0]?.type||null);
  const updatedSave=await readSave();
  const updatedClientRelease=await readClientRelease();
  assert(latestRelease.sha===releaseC.sha,`release marker did not advance: ${JSON.stringify(latestRelease)}`);
  assert(navigationType==='reload',`new canonical release did not trigger automatic reload: ${navigationType}`);
  assert(updatedClientRelease===releaseC.sha,`running update did not advance client release marker: ${updatedClientRelease}`);
  assert(updatedSave.coins===777,`automatic release reload mutated game save: ${updatedSave.coins}`);
  assert((await waitForController()).controlled,'service worker lost control after automatic update');
  report.update={from:releaseB.sha,to:latestRelease.sha,navigationType,clientRelease:updatedClientRelease,coins:updatedSave.coins};

  // After the update reload the ordinary local app is back in development mode with
  // release polling disabled. Offline fallback therefore tests only cached-app behavior,
  // while both production update paths were already proven explicitly above.
  networkLossExpected=true;
  const stoppedServerPid=await stopStaticServer();
  await page.reload({waitUntil:'domcontentloaded',timeout:10000});
  await page.waitForSelector('.game-view',{timeout:6000});
  const offlineSave=await readSave();
  assert(offlineSave.coins===777,`network-loss fallback lost game save: ${offlineSave.coins}`);
  assert((await page.title()).toLowerCase().includes('poply'),'network-loss fallback did not load Poply shell');
  const stillControlled=await page.evaluate(()=>Boolean(navigator.serviceWorker?.controller));
  assert(stillControlled,'service worker lost control during cached network-loss boot');
  assert(expectedNetworkLoss.length>=1,'network-loss fallback did not observe the intentionally stopped HTTP server');
  report.offline={loaded:true,coins:offlineSave.coins,serverStopped:true,serverPid:stoppedServerPid,controlled:stillControlled,expectedNetworkErrors:expectedNetworkLoss.length};

  if(problems.length)throw new Error(`unexpected console problems: ${problems.join(' | ')}`);
}catch(error){failure=error;}
finally{
  await writeFile(releasePath,originalRelease);
  await writeFile(`${outDir}/pwa-update-report.json`,JSON.stringify({baseURL,report,problems,expectedNetworkLoss,failure:failure?.message||null},null,2));
  await browser.close();
}
if(failure)throw failure;
console.log('PWA automatic update WebKit QA passed.');
