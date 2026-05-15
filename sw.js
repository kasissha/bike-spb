const CACHE='velospb-v2';
const ASSETS=['./','/bike-spb/index.html','/bike-spb/manifest.json'];
const TILE_CACHE='velospb-tiles';

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!==TILE_CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  // Cache tiles for offline map
  if(url.hostname.includes('basemaps.cartocdn.com')){
    e.respondWith(caches.open(TILE_CACHE).then(c=>c.match(e.request).then(r=>{
      if(r)return r;
      return fetch(e.request).then(res=>{if(res.ok)c.put(e.request,res.clone());return res}).catch(()=>new Response('',{status:404}));
    })));
    return;
  }
  // Network first for API, cache first for assets
  if(url.hostname.includes('open-meteo')){
    e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
