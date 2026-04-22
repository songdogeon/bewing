/**
 * app/signup/actions.ts
 *
 * 회원가입 관련 Server Actions
 *
 * 이메일 인증 설정에 따른 두 가지 흐름:
 *
 *   [인증 OFF (개발 권장)] Supabase Dashboard → Auth → Email → Confirm email: OFF
 *     signUp 즉시 세션 발급 → redirect('/profile/setup')
 *
 *   [인증 ON (프로덕션 권장)] Confirm email: ON
 *     이메일 인증 링크 발송 → { emailConfirmation: true } 반환
 *     클라이언트가 안내 메시지 표시 → 유저가 이메일 클릭 → /auth/callback → 로그인
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/** 회원가입 Server Action 반환 타입 */
export type SignupActionResult =
  | { error: string }                 // 실패: 에러 메시지
  | { emailConfirmation: true }       // 이메일 인증 필요
  | undefined                         // 성공 + 즉시 로그인: redirect() 실행

/**
 * signupAction
 *
 * 이메일/비밀번호로 회원가입
 *
 * @param email    - 사용자 이메일
 * @param password - 사용자 비밀번호 (8자 이상)
 */
export async function signupAction(
  email: string,
  password: string
): Promise<SignupActionResult> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // 이메일 인증 시 리다이렉트될 URL
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    console.error('[signupAction] 회원가입 실패:', error.code)

    // 이미 가입된 이메일 처리
    if (error.code === 'user_already_exists') {
      return { error: '이미 사용 중인 이메일 주소입니다.' }
    }

    // 비밀번호 정책 위반
    if (error.code === 'weak_password') {
      return { error: '더 강력한 비밀번호를 사용해주세요.' }
    }

    return { error: '회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }
  }

  /**
   * 이메일 인증 필요 여부 판단
   *
   * Supabase에서 이메일 인증이 ON인 경우:
   *   - data.user는 존재하지만 data.session은 null
   *   - 유저에게 이메일 확인 안내가 필요
   *
   * 이메일 인증이 OFF인 경우:
   *   - data.session이 즉시 발급됨
   *   - 바로 프로필 설정으로 이동
   */
  if (data.user && !data.session) {
    // 이메일 인증 필요 → 클라이언트에 안내 메시지 요청
    return { emailConfirmation: true }
  }

  if (data.session) {
    /**
     * 즉시 로그인 성공 → 프로필 설정 페이지로
     * (신규 가입이므로 is_onboarded = false → middleware가 여기로 보냄)
     * redirect()는 직접 지정해서 명확하게 처리
     */
    redirect('/onboarding')
  }

  // 예상치 못한 상태 (보통 여기 도달하지 않음)
  return { error: '알 수 없는 오류가 발생했습니다.' }
}
