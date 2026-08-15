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

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  const isRelease=url.pathname.endsWith('/release.json');

  event.respondWith((async()=>{
    try{
      const response=await fetch(request,{cache:'no-store'});
      if(response.ok&&!isRelease){
        const cache=await caches.open(CACHE_NAME);
        await cache.put(request,response.clone());
      }
      return response;
    }catch(error){
      if(isRelease){
        return new Response(OFFLINE_RELEASE_BODY,{
          status:200,
          headers:{'Content-Type':'application/json','Cache-Control':'no-store'}
        });
      }
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
