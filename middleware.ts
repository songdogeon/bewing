/**
 * middleware.ts (프로젝트 루트)
 *
 * 모든 요청에서 가장 먼저 실행.
 * 1. Supabase 세션 갱신 + 라우트 보호 (updateSession)
 * 2. CSP 헤더 주입 — next.config.ts headers()는 Vercel CDN이 캐시한
 *    정적 페이지에 적용되지 않으므로, 미들웨어에서 단일 관리한다.
 */

import { type NextRequest } from 'next/server'
import { updateSession }    from '@/lib/supabase/middleware'

// ─────────────────────────────────────────────────────────────
// Content Security Policy
//
// blob: 허용 이유:
//   • framer-motion  — WAAPI worklet이 blob URL로 로드됨
//   • Supabase Realtime — 내부 WebWorker 생성 시 blob URL 사용
//   • Next.js App Router — 일부 스트리밍 환경에서 blob script 사용
// ─────────────────────────────────────────────────────────────

const SUPABASE = 'https://*.supabase.co wss://*.supabase.co'

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-eval' 'unsafe-inline' blob:`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `font-src 'self' https://fonts.gstatic.com`,
  `img-src 'self' blob: data: ${SUPABASE} https://lh3.googleusercontent.com`,
  `connect-src 'self' ${SUPABASE}`,
  `worker-src 'self' blob:`,
  `manifest-src 'self'`,
  `frame-ancestors 'none'`,
].join('; ')

// ─────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  // 모든 응답(통과·리다이렉트 포함)에 CSP 주입
  response.headers.set('Content-Security-Policy', CSP)

  return response
}

// 정적 번들·이미지 파일은 미들웨어 건너뜀
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
