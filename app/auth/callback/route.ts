/**
 * app/auth/callback/route.ts
 *
 * OAuth 로그인 콜백 Route Handler
 *
 * 흐름:
 *   1. 유저가 Google 로그인 완료
 *   2. Supabase가 이 URL로 리다이렉트 (code 파라미터 포함)
 *   3. code를 세션 쿠키로 교환 (exchangeCodeForSession)
 *   4. 프로필 셋업 완료 여부에 따라 분기
 *      - 미완료 → /onboarding
 *      - 완료   → /home
 *
 * Supabase Dashboard 설정 필요:
 *   Authentication → URL Configuration
 *   Redirect URLs에 http://localhost:3000/auth/callback 추가
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/home'

  if (code) {
    const supabase = await createClient()

    // OAuth code를 세션 쿠키로 교환
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // 세션 교환 성공 → 유저 정보 확인
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // 온보딩 완료 여부 확인
        const { data: profile } = await supabase
          .from('wingman_profiles')
          .select('is_onboarded')
          .eq('id', user.id)
          .single()

        // 온보딩 미완료 → 온보딩 페이지로
        if (!profile?.is_onboarded) {
          return NextResponse.redirect(
            new URL('/onboarding', request.url)
          )
        }
      }

      // 온보딩 완료 → 원래 목적지 또는 홈으로
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // 에러 발생 시 로그인 페이지로 (에러 메시지 포함)
  return NextResponse.redirect(
    new URL('/login?error=auth_callback_failed', request.url)
  )
}
