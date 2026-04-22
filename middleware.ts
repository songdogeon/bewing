/**
 * middleware.ts (프로젝트 루트)
 *
 * Next.js Edge Middleware: 모든 요청에서 가장 먼저 실행됨
 * 실제 로직은 lib/supabase/middleware.ts의 updateSession에 위임
 *
 * NOTE:  이 파일은 반드시 프로젝트 루트(app/ 폴더와 같은 레벨)에 위치해야 함
 */

import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

/**
 * matcher: 미들웨어를 실행할 경로 패턴
 *
 * 다음 경로는 미들웨어를 건너뜀 (불필요한 처리 방지):
 *   _next/static  → 빌드된 JS, CSS 등 정적 번들
 *   _next/image   → Next.js 이미지 최적화 엔드포인트
 *   favicon.ico   → 브라우저 아이콘
 *   이미지 확장자 → svg, png, jpg, jpeg, gif, webp
 *
 * 나머지 모든 경로(/login, /home, /api/... 등)에서 미들웨어 실행
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
