/**
 * next.config.ts
 *
 * Next.js 15 설정
 * - 이미지 최적화 (Supabase Storage 도메인 허용)
 * - 보안 헤더 (CSP는 middleware.ts에서 주입 — 여기서는 나머지 헤더만)
 */

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ── 이미지 최적화 ────────────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },

  // ── 보안 헤더 ────────────────────────────────────────────────
  // CSP는 middleware.ts에서 관리 (Vercel CDN 캐시를 통과한 응답에도 적용되도록)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',   value: 'nosniff' },
          { key: 'X-Frame-Options',           value: 'DENY' },
          { key: 'X-XSS-Protection',          value: '1; mode=block' },
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
      {
        // SW는 항상 최신 버전을 받도록 캐시 금지
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control',       value: 'no-cache, no-store, must-revalidate' },
          { key: 'Content-Type',        value: 'application/javascript; charset=utf-8' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        source: '/manifest.webmanifest',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
      {
        source: '/icons/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
}

export default nextConfig
