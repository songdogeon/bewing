/**
 * components/pwa/ServiceWorkerRegister.tsx
 *
 * Service Worker 등록 컴포넌트
 *
 * - 'use client' — navigator.serviceWorker는 브라우저 전용 API
 * - app/layout.tsx 최하단에 배치 → 렌더링 블로킹 없음
 * - 개발 환경에서는 등록하지 않음 (HMR과 충돌 방지)
 * - 업데이트 감지 시 사용자에게 새로고침 안내
 */

'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegister() {
  useEffect(() => {
    // ── 지원 확인 ────────────────────────────────────────────
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator)
    ) {
      return
    }

    // ── 개발 환경에서는 등록하지 않음 ──────────────────────────
    // HMR(Hot Module Replacement)과 SW 캐시가 충돌하면
    // 개발 중 변경사항이 반영되지 않는 문제 발생
    if (process.env.NODE_ENV === 'development') {
      // 개발 중 이전에 등록된 SW가 있다면 제거
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((reg) => {
          reg.unregister()
          console.log('[SW] 개발 환경: 서비스 워커 해제')
        })
      })
      return
    }

    // ── Service Worker 등록 ──────────────────────────────────
    /**
     * window.load 이후 등록:
     *   메인 리소스 로딩을 방해하지 않기 위해
     *   페이지 완전 로드 후 SW 등록 시작
     */
    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          // scope: '/' — 전체 앱 범위
          scope:        '/',
          // updateViaCache: 'none' — SW 파일 자체는 캐시 사용 안 함
          updateViaCache: 'none',
        })

        console.log('[SW] 등록 성공:', registration.scope)

        // ── 업데이트 감지 ─────────────────────────────────────
        /**
         * SW 업데이트 흐름:
         *   1. 새 sw.js 파일 감지 (브라우저가 주기적으로 확인)
         *   2. installing → waiting 상태로 전환
         *   3. 사용자에게 새로고침 안내
         *   4. 사용자가 승인하면 skipWaiting() 호출
         *   5. 새 SW 활성화 후 페이지 새로고침
         */
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (!newWorker) return

          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // 새 버전 설치 완료 — 사용자에게 새로고침 안내
              showUpdatePrompt(registration)
            }
          })
        })

        // ── 주기적 업데이트 확인 (1시간마다) ─────────────────
        setInterval(() => {
          registration.update().catch(console.error)
        }, 60 * 60 * 1000)

      } catch (error) {
        console.error('[SW] 등록 실패:', error)
      }
    }

    // 페이지 로드 완료 후 등록
    if (document.readyState === 'complete') {
      registerSW()
    } else {
      window.addEventListener('load', registerSW, { once: true })
    }
  }, [])

  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null
}

// ─────────────────────────────────────────────────────────────
// 업데이트 프롬프트
// ─────────────────────────────────────────────────────────────

/**
 * showUpdatePrompt
 *
 * 새 버전 감지 시 사용자에게 업데이트 알림
 *
 * 현재: 간단한 confirm() 사용
 * 개선: Toast 또는 커스텀 배너로 교체 권장 (Week 4 폴리싱)
 */
function showUpdatePrompt(registration: ServiceWorkerRegistration) {
  // 사용자 확인 (자동 새로고침 방지 — UX 배려)
  const shouldUpdate = window.confirm(
    'BeWing 새 버전이 있어요!\n지금 업데이트 할까요?'
  )

  if (shouldUpdate) {
    // 대기 중인 SW에 skipWaiting 메시지 전송
    registration.waiting?.postMessage({ type: 'SKIP_WAITING' })

    // SW 컨트롤러 교체 후 페이지 새로고침
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload()
    }, { once: true })
  }
}
