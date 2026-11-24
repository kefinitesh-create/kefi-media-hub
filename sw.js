/* Kefi Media Hub – offline service worker. Keep this file next to the HTML file. */
var C='kefi-hub-sw-v16';
var PATH=decodeURIComponent((new URL(self.location.href).searchParams.get('p'))||'./');
self.addEventListener('install',function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(C).then(function(c){
    return Promise.all(['./',PATH,'manifest.webmanifest','cloud-config.js','icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png','icons/apple-touch-icon.png','logos/nxtestate.png','logos/alpha.png','logos/independent.svg'].map(function(u){return c.add(u).catch(function(){})}));
  }));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(k){
    return Promise.all(k.filter(function(n){return n!==C}).map(function(n){return caches.delete(n)}));
  }).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch',function(e){
  var r=e.request;
  if(r.method!=='GET'||new URL(r.url).origin!==self.location.origin)return;
  e.respondWith((async function(){
    var c=await caches.open(C);
    var hit=await c.match(r,{ignoreSearch:r.mode==='navigate'});
    var net=fetch(r).then(function(x){if(x&&x.ok)c.put(r,x.clone());return x}).catch(function(){return null});
    if(hit){e.waitUntil(net);return hit}
    var x=await net;if(x)return x;
    if(r.mode==='navigate'){var f=(await c.match(PATH))||(await c.match('./'));if(f)return f}
    return new Response('Offline',{status:503});
  })());
});
