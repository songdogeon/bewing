/**
 * next.config.ts
 *
 * Next.js 15 설정
 * - next-pwa 없이 네이티브 App Router manifest API 활용
 * - 이미지 최적화 설정 (Supabase Storage 도메인 허용)
 * - 보안 헤더
 */

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ── 이미지 최적화 ────────────────────────────────────────────
  images: {
    remotePatterns: [
      {
        /**
         * Supabase Storage 버킷 이미지 허용
         * YOUR_PROJECT_REF를 실제 프로젝트 ID로 교체:
         *   ex) abcdefghijklmnop.supabase.co
         */
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        // Google OAuth 프로필 사진
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },

  // ── 보안 헤더 ────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // XSS 방지
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          { key: 'X-Frame-Options',            value: 'DENY' },
          { key: 'X-XSS-Protection',           value: '1; mode=block' },
          // HTTPS 강제 (Vercel은 자동으로 HTTPS이므로 안전)
          { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
          // PWA 권한 정책
          { key: 'Permissions-Policy',         value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // Service Worker 캐시 방지 (항상 최신 SW 사용)
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Content-Type',  value: 'application/javascript; charset=utf-8' },
        ],
      },
      {
        // manifest.json 캐시 설정
        source: '/manifest.json',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
    ]
  },
}

export default nextConfig
