// Service Worker for TIME FRAME
const STATIC_CACHE = 'time-frame-static-v1';
const DYNAMIC_CACHE = 'time-frame-dynamic-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.jpg',
  '/ogp.jpg',
];

// インストール時の処理
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        // エラーは無視（オフライン環境でも動作するように）
      })
  );
  self.skipWaiting();
});

// アクティベート時の処理
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// フェッチ時の処理（キャッシュ優先、フォールバックでネットワーク）
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // 外部リソース（Google Fonts等）はキャッシュしない
  if (url.origin !== self.location.origin) {
    return;
  }

  // http/https以外のスキームは無視
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // キャッシュがあれば返す（オフライン対応）
      if (cachedResponse) {
        return cachedResponse;
      }

      // ネットワークから取得を試みる
      return fetch(event.request)
        .then((response) => {
          // 成功したレスポンスのみキャッシュ
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            // JS/CSSは動的キャッシュ、その他は静的キャッシュ
            const cacheToUse = 
              event.request.destination === 'script' || 
              event.request.destination === 'style' ||
              event.request.url.includes('/assets/')
                ? DYNAMIC_CACHE
                : STATIC_CACHE;
            
            caches.open(cacheToUse).then((cache) => {
              cache.put(event.request, responseToCache).catch(() => {
                // キャッシュ失敗は無視
              });
            });
          }
          return response;
        })
        .catch(() => {
          // オフライン時: HTMLリクエストの場合はindex.htmlを返す
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
          // その他のリクエストはnullを返す
          return null;
        });
    })
  );
});
