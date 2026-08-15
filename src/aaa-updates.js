const UPDATE_INTERVAL_MS=5*60*1000;

export function releaseUrl(moduleUrl=import.meta.url){
  return new URL('../release.json',moduleUrl).href;
}

export function releasePollingForWindow(windowObj=globalThis.window){
  return windowObj?.location?.protocol==='https:';
}

export function shouldReloadForRelease(bootRelease,latestRelease){
  if(!bootRelease||!latestRelease)return false;
  if(bootRelease==='development'||latestRelease==='development')return false;
  return bootRelease!==latestRelease;
}

export async function fetchReleaseSha(fetchImpl=globalThis.fetch,moduleUrl=import.meta.url){
  const response=await fetchImpl(releaseUrl(moduleUrl),{cache:'no-store',credentials:'same-origin'});
  if(!response.ok)return null;
  const payload=await response.json();
  return typeof payload?.sha==='string'&&payload.sha.trim()?payload.sha.trim():null;
}

export async function installAppUpdates({
  navigatorObj=globalThis.navigator,
  documentObj=globalThis.document,
  windowObj=globalThis.window,
  fetchImpl=globalThis.fetch,
  now=()=>Date.now(),
  intervalMs=UPDATE_INTERVAL_MS,
  releasePolling=releasePollingForWindow(windowObj),
}={}){
  if(!navigatorObj?.serviceWorker||!documentObj||!windowObj||typeof fetchImpl!=='function')return {supported:false};

  const hadController=Boolean(navigatorObj.serviceWorker.controller);
  const registration=await navigatorObj.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});
  registration.update().catch(()=>{});

  let bootRelease=null;
  if(releasePolling){
    try{bootRelease=await fetchReleaseSha(fetchImpl);}catch{}
  }

  let checking=false;
  let reloading=false;
  let lastCheck=0;
  const reload=()=>{
    if(reloading)return false;
    reloading=true;
    windowObj.location.reload();
    return true;
  };
  const check=async({force=false}={})=>{
    if(!releasePolling||checking||reloading)return false;
    const stamp=now();
    if(!force&&stamp-lastCheck<intervalMs)return false;
    checking=true;lastCheck=stamp;
    try{
      const latestRelease=await fetchReleaseSha(fetchImpl);
      if(shouldReloadForRelease(bootRelease,latestRelease))return reload();
      if(!bootRelease&&latestRelease)bootRelease=latestRelease;
      return false;
    }catch{return false;}
    finally{checking=false;}
  };

  let timer=null;
  if(releasePolling){
    const checkWhenVisible=()=>{if(documentObj.visibilityState==='visible')void check({force:true});};
    documentObj.addEventListener('visibilitychange',checkWhenVisible);
    windowObj.addEventListener('pageshow',checkWhenVisible);
    windowObj.addEventListener('focus',checkWhenVisible);
    timer=windowObj.setInterval(()=>{if(documentObj.visibilityState==='visible')void check();},intervalMs);
  }

  navigatorObj.serviceWorker.addEventListener('controllerchange',()=>{
    // First install claims the page without forcing a disruptive reload. A later worker
    // replacement reloads once so the page immediately runs under the new controller.
    if(hadController)reload();
  });

  return {supported:true,registration,bootRelease,check,timer,releasePolling};
}
