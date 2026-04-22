/**
 * app/layout.tsx
 *
 * Root Layout — 전체 앱의 최상위 레이아웃
 *
 * 포함 내용:
 *   - Next.js Metadata API (PWA + SEO)
 *   - Viewport 설정 (모바일 최적화)
 *   - Google Fonts (Inter)
 *   - Service Worker 등록 (ServiceWorkerRegister)
 *   - Tailwind CSS base
 */

import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ServiceWorkerRegister from '@/components/pwa/ServiceWorkerRegister'

// ── Google Fonts ─────────────────────────────────────────────
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

// ─────────────────────────────────────────────────────────────
// Viewport 설정 (Next.js 15: viewport는 별도 export)
// ─────────────────────────────────────────────────────────────

export const viewport: Viewport = {
  /**
   * 모바일에서 줌 방지 + 전체 화면 활용
   * initial-scale=1, viewport-fit=cover → 노치/펀치홀 대응
   */
  width:              'device-width',
  initialScale:       1,
  maximumScale:       1,      // 줌 방지 (스와이프 UX 보호)
  userScalable:       false,
  viewportFit:        'cover', // 노치 영역 포함
  themeColor:         '#0f172a', // slate-900 (PWA 상단 바 색상)
}

// ─────────────────────────────────────────────────────────────
// 앱 메타데이터 (PWA + SEO)
// ─────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  // ── metadataBase: OG 이미지 등 상대경로 URL 해석 기준 ────────
  // 로컬: http://localhost:3000
  // Vercel: VERCEL_URL이 자동 주입됨 → https://{deployment}.vercel.app
  // 커스텀 도메인: NEXT_PUBLIC_APP_URL에 설정
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  ),

  // ── 기본 정보 ─────────────────────────────────────────────
  title: {
    default:  'BeWing',
    template: '%s | BeWing',
  },
  description: '친구가 대신 소개시켜주는 새로운 방식의 매칭 앱',
  keywords:    ['소개팅', '매칭', '윙맨', 'wingman', '친구소개'],

  // ── PWA 설정 ──────────────────────────────────────────────
  manifest: '/manifest.json',

  // ── Apple PWA (iOS 홈 화면 추가) ──────────────────────────
  appleWebApp: {
    capable:           true,
    statusBarStyle:    'black-translucent', // 노치 위까지 콘텐츠 확장
    title:             'BeWing',
    startupImage: [
      // iPhone 14 Pro Max
      {
        url:   '/icons/splash-1290x2796.png',
        media: '(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)',
      },
      // iPhone 14 / 13 / 12
      {
        url:   '/icons/splash-1170x2532.png',
        media: '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)',
      },
    ],
  },

  // ── Open Graph (카카오, 트위터 링크 미리보기) ───────────────
  openGraph: {
    title:       'BeWing — 친구가 소개해주는 매칭',
    description: '친구가 대신 스와이프해서 소개시켜주는 새로운 방식의 매칭 앱',
    type:        'website',
    locale:      'ko_KR',
    images: [
      {
        url:    '/og-image.png', // public/og-image.png (1200×630)
        width:  1200,
        height: 630,
        alt:    'BeWing',
      },
    ],
  },

  // ── 아이콘 ──────────────────────────────────────────────────
  icons: {
    icon: [
      { url: '/icons/icon-192.png',   sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png',   sizes: '512x512', type: 'image/png' },
      { url: '/icons/icon.svg',       type: 'image/svg+xml' },
    ],
    apple:   '/icons/apple-touch-icon.png', // 180×180
    shortcut: '/icons/icon-192.png',
  },

  // ── robots ──────────────────────────────────────────────────
  robots: {
    index:  true,
    follow: true,
  },
}

// ─────────────────────────────────────────────────────────────
// Root Layout
// ─────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        {children}

        {/*
         * Service Worker 등록
         * 'use client' 컴포넌트 — 브라우저 navigator.serviceWorker 사용
         * 레이아웃 최하단에서 비동기 등록 (렌더링 블로킹 없음)
         */}
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
