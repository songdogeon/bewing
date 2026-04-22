/**
 * public/sw.js
 *
 * WingMatch Service Worker
 *
 * 캐싱 전략:
 *   - 정적 자산 (JS/CSS/폰트/이미지): Cache First → 오프라인에서도 로딩
 *   - API / Supabase 요청:            Network First → 항상 최신 데이터
 *   - 네비게이션 (HTML 페이지):         Network First with offline fallback
 *
 * 캐시 버전 관리:
 *   CACHE_VERSION을 올리면 기존 캐시 삭제 후 새 캐시로 교체
 */

const CACHE_VERSION   = 'v1'
const STATIC_CACHE    = `wingmatch-static-${CACHE_VERSION}`
const RUNTIME_CACHE   = `wingmatch-runtime-${CACHE_VERSION}`

/** 설치 시 사전 캐시할 정적 자산 */
const PRECACHE_URLS = [
  '/',
  '/offline',           // 오프라인 fallback 페이지
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

/** API / Supabase 도메인 → 캐시 제외 (항상 네트워크) */
const NETWORK_ONLY_PATTERNS = [
  /supabase\.co/,
  /\/api\//,
  /chrome-extension/,
]

// ─────────────────────────────────────────────────────────────
// install: 정적 자산 사전 캐시
// ─────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      // 개별 실패가 전체 설치를 막지 않도록 각각 시도
      return Promise.allSettled(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch((err) =>
            console.warn(`[SW] 사전 캐시 실패: ${url}`, err)
          )
        )
      )
    }).then(() => self.skipWaiting()) // 즉시 활성화 (대기 없이)
  )
})

// ─────────────────────────────────────────────────────────────
// activate: 구버전 캐시 정리
// ─────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) =>
            // 현재 버전이 아닌 wingmatch 캐시 삭제
            name.startsWith('wingmatch-') &&
            name !== STATIC_CACHE &&
            name !== RUNTIME_CACHE
          )
          .map((name) => {
            console.log(`[SW] 구버전 캐시 삭제: ${name}`)
            return caches.delete(name)
          })
      )
    ).then(() => self.clients.claim()) // 열린 탭 즉시 제어 획득
  )
})

// ─────────────────────────────────────────────────────────────
// fetch: 요청 가로채기
// ─────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // ── 1. 네트워크 전용 요청 (캐시 불가) ───────────────────────
  if (
    request.method !== 'GET' ||
    NETWORK_ONLY_PATTERNS.some((pattern) => pattern.test(request.url)) ||
    url.protocol === 'chrome-extension:'
  ) {
    return // 기본 fetch 사용
  }

  // ── 2. 네비게이션 요청 (HTML 페이지) ────────────────────────
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithOfflineFallback(request))
    return
  }

  // ── 3. 정적 자산 (JS/CSS/이미지/폰트) ───────────────────────
  const isStaticAsset =
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|gif|woff2?|ico)$/)

  if (isStaticAsset) {
    event.respondWith(cacheFirst(request))
    return
  }

  // ── 4. 그 외: 네트워크 우선 ──────────────────────────────────
  event.respondWith(networkFirst(request))
})

// ─────────────────────────────────────────────────────────────
// 캐싱 전략 함수
// ─────────────────────────────────────────────────────────────

/**
 * Cache First
 * 캐시에 있으면 캐시 반환, 없으면 네트워크 요청 후 캐시 저장
 */
async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    // 정적 자산 네트워크 실패 시 캐시 재시도
    return caches.match(request) ?? new Response('Offline', { status: 503 })
  }
}

/**
 * Network First
 * 네트워크 요청 시도, 실패 시 캐시 반환
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return caches.match(request) ?? new Response('Offline', { status: 503 })
  }
}

/**
 * Network First with Offline Fallback (네비게이션 전용)
 * 네트워크 실패 시 /offline 페이지 반환
 */
async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request)
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached

    // /offline fallback
    const offlinePage = await caches.match('/offline')
    if (offlinePage) return offlinePage

    return new Response(
      `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>오프라인 | WingMatch</title>
  <style>
    body { font-family: sans-serif; display: flex; flex-direction: column;
           align-items: center; justify-content: center; height: 100vh;
           margin: 0; background: #fff5f5; color: #333; text-align: center; }
    h1   { font-size: 2rem; color: #f43f5e; }
    p    { color: #666; }
    button { margin-top: 1rem; padding: 0.75rem 2rem; background: #f43f5e;
             color: #fff; border: none; border-radius: 9999px;
             font-size: 1rem; cursor: pointer; }
  </style>
</head>
<body>
  <h1>🔌 오프라인</h1>
  <p>인터넷 연결을 확인해 주세요.</p>
  <button onclick="location.reload()">다시 시도</button>
</body>
</html>`,
      { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }
}

// ─────────────────────────────────────────────────────────────
// Push 알림 (향후 확장용 — 현재 미사용)
// ─────────────────────────────────────────────────────────────

self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()

  event.waitUntil(
    self.registration.showNotification(data.title ?? 'WingMatch', {
      body:    data.body  ?? '새로운 매칭이 있어요!',
      icon:    '/icons/icon-192.png',
      badge:   '/icons/badge-96.png',
      tag:     data.tag   ?? 'wingmatch-notification',
      data:    data.url   ?? '/matches',
      vibrate: [200, 100, 200],
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      const url = event.notification.data ?? '/matches'
      // 이미 열린 탭이 있으면 포커스
      for (const client of windowClients) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus()
        }
      }
      // 없으면 새 탭 오픈
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})
