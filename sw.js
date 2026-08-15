const CACHE_PREFIX='poply-runtime-';
const CACHE_NAME='poply-runtime-v1';
const OFFLINE_RELEASE_BODY=JSON.stringify({sha:null,deployedAt:null,offline:true});

self.addEventListener('install',()=>{self.skipWaiting();});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&key!==CACHE_NAME).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

const offlineReleaseResponse=()=>new Response(OFFLINE_RELEASE_BODY,{
  status:200,
  headers:{'Content-Type':'application/json','Cache-Control':'no-store'}
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  const isRelease=url.pathname.endsWith('/release.json');

  if(isRelease){
    event.respondWith((async()=>{
      try{
        return await fetch(url.href,{cache:'no-store',credentials:'same-origin'});
      }catch{
        return offlineReleaseResponse();
      }
    })());
    return;
  }

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
