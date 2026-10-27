/* Weekly Pile service worker: keeps the app working offline.
   New versions download in the background, but pages keep getting the approved
   version's files until the user taps "Install update" (message {type:'approve'}). */
const VERSION = '1.1.0';
const CORE = ['./', 'index.html', 'app.js', 'app.css', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png'];
const META = 'wp-meta';
const APPROVED_KEY = new URL('./__approved', self.registration.scope).href;

async function getApproved() {
  const r = await (await caches.open(META)).match(APPROVED_KEY);
  return r ? r.text() : null;
}
async function setApproved(v) {
  await (await caches.open(META)).put(APPROVED_KEY, new Response(v));
}
async function prune(keep) {
  const keys = await caches.keys();
  await Promise.all(keys.filter(k => k.startsWith('core-') && !keep.includes(k)).map(k => caches.delete(k)));
}

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open('core-' + VERSION);
    await c.addAll(CORE.map(u => new Request(u, { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    let approved = await getApproved();
    if (!approved || !(await caches.has('core-' + approved))) { approved = VERSION; await setApproved(VERSION); }
    await prune(['core-' + approved, 'core-' + VERSION]);
    await self.clients.claim();
  })());
});

self.addEventListener('message', e => {
  const port = e.ports && e.ports[0];
  const reply = d => port && port.postMessage(d);
  if (!e.data) return;
  if (e.data.type === 'status') e.waitUntil(getApproved().then(a => reply({ version: VERSION, approved: a || VERSION })));
  if (e.data.type === 'approve') e.waitUntil(setApproved(VERSION).then(() => prune(['core-' + VERSION])).then(() => reply({ ok: true }), () => reply({ ok: false })));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || !url.href.startsWith(self.registration.scope)) return;
  const rel = url.href.slice(self.registration.scope.length).split('?')[0];
  if (rel.startsWith('content/') || rel === 'sw.js') return; // plan/exercise downloads always go to the network
  e.respondWith((async () => {
    const approved = (await getApproved()) || VERSION;
    const key = rel === '' ? './' : rel;
    for (const name of ['core-' + approved, 'core-' + VERSION]) {
      const c = await caches.open(name);
      const hit = await c.match(key === './' ? new URL('./', self.registration.scope).href : req, { ignoreSearch: true });
      if (hit) return hit;
    }
    return fetch(req);
  })());
});
