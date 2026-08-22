const UPDATE_INTERVAL_MS=5*60*1000;
export const CLIENT_RELEASE_STORAGE_KEY='poply-client-release-v1';

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

export function storedRelease(storageObj,key=CLIENT_RELEASE_STORAGE_KEY){
  try{
    const value=storageObj?.getItem?.(key);
    return typeof value==='string'&&value.trim()?value.trim():null;
  }catch{return null;}
}

export function rememberRelease(storageObj,release,key=CLIENT_RELEASE_STORAGE_KEY){
  if(!release||release==='development')return false;
  try{storageObj?.setItem?.(key,release);return true;}catch{return false;}
}

export function shouldReloadForStoredRelease(previousRelease,latestRelease){
  if(!previousRelease||!latestRelease)return false;
  if(previousRelease==='development'||latestRelease==='development')return false;
  return previousRelease!==latestRelease;
}

export async function fetchReleaseSha(fetchImpl=globalThis.fetch,moduleUrl=import.meta.url){
  const response=await fetchImpl(releaseUrl(moduleUrl),{cache:'no-store',credentials:'same-origin'});
  if(!response.ok)return null;
  const payload=await response.json();
  return typeof payload?.sha==='string'&&payload.sha.trim()?payload.sha.trim():null;
}

export function serviceWorkerPaths(documentBase){
  const worker=new URL('./sw.js',documentBase);
  const scope=new URL('./',documentBase);
  return {workerUrl:`${worker.pathname}${worker.search}`,workerScope:scope.pathname};
}

export async function installAppUpdates({
  navigatorObj=globalThis.navigator,
  documentObj=globalThis.document,
  windowObj=globalThis.window,
  fetchImpl=globalThis.fetch,
  storageObj=windowObj?.localStorage,
  now=()=>Date.now(),
  intervalMs=UPDATE_INTERVAL_MS,
  releasePolling=releasePollingForWindow(windowObj),
}={}){
  if(!navigatorObj?.serviceWorker||!documentObj||!windowObj||typeof fetchImpl!=='function')return {supported:false};

  const documentBase=documentObj.baseURI||windowObj.location?.href;
  const {workerUrl,workerScope}=serviceWorkerPaths(documentBase);
  const hadController=Boolean(navigatorObj.serviceWorker.controller);
  const registration=await navigatorObj.serviceWorker.register(workerUrl,{scope:workerScope,updateViaCache:'none'});
  registration.update().catch(()=>{});

  let checking=false;
  let reloading=false;
  let lastCheck=0;
  const reload=()=>{
    if(reloading)return false;
    reloading=true;
    windowObj.location.reload();
    return true;
  };

  let bootRelease=null;
  if(releasePolling){
    try{
      bootRelease=await fetchReleaseSha(fetchImpl);
      const previousRelease=storedRelease(storageObj);
      if(shouldReloadForStoredRelease(previousRelease,bootRelease)){
        // Advance the canonical marker before reloading so an iOS snapshot/cold start
        // cannot loop if the same release is restored again.
        rememberRelease(storageObj,bootRelease);
        const bootReload=reload();
        return {supported:true,registration,bootRelease,bootReload,releasePolling};
      }
      if(!previousRelease&&bootRelease)rememberRelease(storageObj,bootRelease);
    }catch{}
  }

  const check=async({force=false}={})=>{
    if(!releasePolling||checking||reloading)return false;
    const stamp=now();
    if(!force&&stamp-lastCheck<intervalMs)return false;
    checking=true;lastCheck=stamp;
    try{
      const latestRelease=await fetchReleaseSha(fetchImpl);
      if(shouldReloadForRelease(bootRelease,latestRelease)){
        rememberRelease(storageObj,latestRelease);
        return reload();
      }
      if(!bootRelease&&latestRelease){bootRelease=latestRelease;rememberRelease(storageObj,latestRelease);}
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

  return {supported:true,registration,bootRelease,bootReload:false,check,timer,releasePolling};
}
