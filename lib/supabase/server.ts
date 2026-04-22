/**
 * lib/supabase/server.ts
 *
 * 서버 전용 Supabase 클라이언트
 *
 * 사용 위치:
 *   - Server Components (app/ 하위 page.tsx, layout.tsx 등)
 *   - Server Actions ('use server' 함수)
 *   - Route Handlers (app/api/ route.ts)
 *
 * NOTE: 클라이언트 컴포넌트('use client')에서는 사용 불가.
 *       next/headers는 서버 환경에서만 동작합니다.
 *
 * Next.js 15: cookies()가 비동기(async)로 변경됨.
 *             createClient()도 async 함수로 작성해야 합니다.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/types/database.types'

/**
 * 서버용 Supabase 클라이언트 생성 함수
 *
 * 쿠키 기반 세션 관리:
 *   - getAll: 요청의 모든 쿠키를 Supabase에 전달
 *   - setAll: 세션 갱신 시 새 쿠키를 응답에 저장
 *
 * Server Component에서는 쿠키 쓰기가 제한됩니다.
 * 세션 갱신은 middleware.ts가 담당하므로 실제론 문제없습니다.
 */
export async function createClient() {
  // Next.js 15: cookies()는 Promise를 반환하므로 await 필요
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // 현재 요청의 모든 쿠키를 반환 (세션 토큰 읽기용)
        getAll() {
          return cookieStore.getAll()
        },

        // Supabase가 세션을 갱신할 때 새 쿠키를 저장
        // Server Component에서는 쿠키 쓰기가 불가하지만
        // try/catch로 감싸서 에러를 무시합니다.
        // (실제 세션 갱신은 middleware.ts가 담당)
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (_e) {
            // Server Component에서 setAll 호출 시 에러 발생 가능.
            // middleware.ts에서 세션을 먼저 갱신하므로 여기서 실패해도 무방합니다.
          }
        },
      },
    }
  )
}
