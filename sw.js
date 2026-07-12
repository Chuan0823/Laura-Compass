// 離線快取：第一次載入後，App 與避難資料全離線可用。改檔後把 CACHE 版本號 +1。
const CACHE = "compass-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./match.js",
  "./manifest.json",
  "./fonts/jf-openhuninn-1.1.ttf",
  "./data/fire.json",
  "./data/fire_faq.json",
  "./icons/icon.svg"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

// 快取優先；沒網路時導覽請求退回 index.html
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      return hit || fetch(e.request).catch(function () {
        if (e.request.mode === "navigate") return caches.match("./index.html");
      });
    })
  );
});
