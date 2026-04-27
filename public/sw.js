/**
 * public/sw.js — BeWing Service Worker
 *
 * 설계 원칙:
 *   1. navigation 요청(HTML 페이지)은 절대 가로채지 않는다.
 *      → 인증 쿠키·세션이 서버와 직접 통신해야 하므로 SW 개입 금지.
 *      → SW가 navigation을 가로채면 /friends/register 같은 protected 라우트에서
 *         FetchEvent network error가 발생한다.
 *
 *   2. blob:, data:, chrome-extension: URL은 무시한다.
 *      → framer-motion, Supabase Realtime 등 라이브러리가 생성하는 내부 URL.
 *
 *   3. 캐시하는 것: /_next/static/ 정적 번들만 (immutable, 버전 해시 포함)
 *      → 앱 아이콘, 폰트 등 변하지 않는 자산.
 *
 *   4. 나머지 모든 요청: 브라우저 기본 동작에 맡긴다.
 */

const CACHE_VERSION = 'v2'
const STATIC_CACHE  = `bewing-static-${CACHE_VERSION}`

// 완전히 무시할 URL 패턴 (캐시도 가로채기도 하지 않음)
const BYPASS_PATTERNS = [
  /supabase\.co/,
  /\/api\//,
]

// ─────────────────────────────────────────────────────────────
// install
// ─────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  // 이전 SW를 즉시 교체
  event.waitUntil(self.skipWaiting())
})

// ─────────────────────────────────────────────────────────────
// activate — 구버전 캐시 정리
// ─────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name.startsWith('bewing-') && name !== STATIC_CACHE)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  )
})

// ─────────────────────────────────────────────────────────────
// fetch — 요청 가로채기
// ─────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // ── 절대 가로채지 않는 경우 ───────────────────────────────
  if (
    // navigation (HTML 페이지) — 인증 앱은 SW가 가로채면 안 됨
    request.mode === 'navigate'                  ||
    // GET이 아닌 요청 (POST, PUT 등)
    request.method !== 'GET'                     ||
    // blob: / data: / chrome-extension: 내부 URL
    url.protocol === 'blob:'                     ||
    url.protocol === 'data:'                     ||
    url.protocol === 'chrome-extension:'         ||
    // Supabase, API 등 외부 요청
    BYPASS_PATTERNS.some((p) => p.test(request.url))
  ) {
    return // event.respondWith 미호출 → 브라우저 기본 fetch 사용
  }

  // ── /_next/static/ 정적 번들: Cache First ────────────────
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request))
    return
  }

  // ── 아이콘 / 폰트 등 불변 자산: Cache First ─────────────
  if (
    url.pathname.startsWith('/icons/') ||
    url.pathname.match(/\.(woff2?|ttf|eot)$/)
  ) {
    event.respondWith(cacheFirst(request))
    return
  }

  // ── 그 외: 가로채지 않음 ─────────────────────────────────
  // (SW가 없는 것처럼 동작 — 가장 안전한 기본값)
})

// ─────────────────────────────────────────────────────────────
// Cache First 전략
// ─────────────────────────────────────────────────────────────

async function cacheFirst(request) {
  try {
    const cached = await caches.match(request)
    if (cached) return cached

    const response = await fetch(request)
    if (response.ok && response.status < 400) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    return cached ?? new Response('Offline', { status: 503 })
  }
}

// ─────────────────────────────────────────────────────────────
// Push 알림 (향후 확장용)
// ─────────────────────────────────────────────────────────────

self.addEventListener('push', (event) => {
  if (!event.data) return
  const data = event.data.json()
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'BeWing', {
      body:    data.body ?? '새로운 매칭이 있어요!',
      icon:    '/icons/icon-192.png',
      badge:   '/icons/badge-96.png',
      tag:     data.tag  ?? 'bewing-notification',
      data:    data.url  ?? '/matches',
      vibrate: [200, 100, 200],
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data ?? '/matches'
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((list) => {
      for (const client of list) {
        if (client.url.includes(url) && 'focus' in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})
