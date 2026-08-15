const CACHE_PREFIX='poply-runtime-';
const CACHE_NAME='poply-runtime-v1';

self.addEventListener('install',()=>{self.skipWaiting();});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&key!==CACHE_NAME).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  const isRelease=url.pathname.endsWith('/release.json');

  // The release marker is deliberately not intercepted. It is an online freshness
  // signal, not an offline asset. Letting the browser fetch it directly avoids
  // WebKit service-worker response/CORS failures; the app already treats a failed
  // release check as "no update information" and continues from cached assets.
  if(isRelease)return;

  event.respondWith((async()=>{
    try{
      const response=await fetch(request,{cache:'no-store'});
      if(response.ok){
        const cache=await caches.open(CACHE_NAME);
        await cache.put(request,response.clone());
      }
      return response;
    }catch(error){
      const cached=await caches.match(request);
      if(cached)return cached;
      if(request.mode==='navigate'){
        const fallback=await caches.match(new Request(self.registration.scope,{credentials:'same-origin'}));
        if(fallback)return fallback;
      }
      throw error;
    }
  })());
});
