/**
 * app/manifest.ts
 *
 * Next.js 15 App Router — Web App Manifest
 * /manifest.json 으로 자동 서빙됨 (별도 public/manifest.json 불필요)
 *
 * MDN 참고: https://developer.mozilla.org/en-US/docs/Web/Manifest
 */

import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             'BeWing',
    short_name:       'BeWing',
    description:      '친구가 대신 소개시켜주는 새로운 방식의 매칭 앱',
    start_url:        '/home',
    scope:            '/',

    /**
     * display 모드:
     *   standalone → 브라우저 주소창 없이 네이티브 앱처럼 표시
     *   (minimal-ui, fullscreen, browser 순으로 fallback)
     */
    display:          'standalone',
    display_override: ['standalone', 'minimal-ui'],

    /**
     * orientation:
     *   portrait → 세로 방향 고정 (스와이프 UX에 최적)
     */
    orientation:      'portrait',

    // 테마 색상 (상태바, 스플래시 배경)
    background_color: '#ffffff',
    theme_color:      '#0f172a', // slate-900

    // 언어
    lang:             'ko',
    dir:              'ltr',

    /**
     * 아이콘 목록
     * public/icons/ 디렉토리에 실제 이미지 파일을 배치해야 함
     * (생성 방법은 README 참조)
     *
     * purpose:
     *   any         → 일반 아이콘
     *   maskable    → Android 적응형 아이콘 (배경 포함)
     *   monochrome  → 단색 (iOS 배지 등)
     */
    icons: [
      {
        src:     '/icons/icon-72.png',
        sizes:   '72x72',
        type:    'image/png',
        purpose: 'any',
      },
      {
        src:     '/icons/icon-96.png',
        sizes:   '96x96',
        type:    'image/png',
        purpose: 'any',
      },
      {
        src:     '/icons/icon-128.png',
        sizes:   '128x128',
        type:    'image/png',
        purpose: 'any',
      },
      {
        src:     '/icons/icon-144.png',
        sizes:   '144x144',
        type:    'image/png',
        purpose: 'any',
      },
      {
        src:     '/icons/icon-152.png',
        sizes:   '152x152',
        type:    'image/png',
        purpose: 'any',
      },
      {
        src:     '/icons/icon-192.png',
        sizes:   '192x192',
        type:    'image/png',
        purpose: 'any',
      },
      {
        src:     '/icons/icon-192-maskable.png',
        sizes:   '192x192',
        type:    'image/png',
        purpose: 'maskable',
      },
      {
        src:     '/icons/icon-384.png',
        sizes:   '384x384',
        type:    'image/png',
        purpose: 'any',
      },
      {
        src:     '/icons/icon-512.png',
        sizes:   '512x512',
        type:    'image/png',
        purpose: 'any',
      },
      {
        src:     '/icons/icon-512-maskable.png',
        sizes:   '512x512',
        type:    'image/png',
        purpose: 'maskable',
      },
      {
        // SVG (벡터 — 모든 해상도 지원)
        src:     '/icons/icon.svg',
        sizes:   'any',
        type:    'image/svg+xml',
        purpose: 'any',
      },
    ],

    /**
     * shortcuts: 홈 화면 아이콘 길게 누르기 (Android)
     */
    shortcuts: [
      {
        name:        '스와이프',
        short_name:  '스와이프',
        description: '새 카드 스와이프하기',
        url:         '/swipe',
        icons: [{ src: '/icons/icon-96.png', sizes: '96x96' }],
      },
      {
        name:        '매칭',
        short_name:  '매칭',
        description: '내 매칭 목록 보기',
        url:         '/matches',
        icons: [{ src: '/icons/icon-96.png', sizes: '96x96' }],
      },
    ],

    /**
     * screenshots: PWA 설치 프롬프트에 표시되는 스크린샷
     * public/screenshots/ 에 이미지 배치 필요
     */
    screenshots: [
      {
        src:           '/screenshots/swipe-screen.png',
        sizes:         '390x844',
        type:          'image/png',
        form_factor:   'narrow',
        label:         '스와이프 화면',
      },
      {
        src:           '/screenshots/match-screen.png',
        sizes:         '390x844',
        type:          'image/png',
        form_factor:   'narrow',
        label:         '매칭 화면',
      },
    ],

    /**
     * prefer_related_applications:
     *   false → 네이티브 앱보다 PWA를 우선 설치 권장
     */
    prefer_related_applications: false,

    /**
     * categories: 앱 스토어 분류
     */
    categories: ['social', 'lifestyle'],
  }
}
