/**
 * app/login/actions.ts
 *
 * 로그인 관련 Server Actions
 *
 * NOTE:  보안 원칙:
 *   - 인증 처리는 반드시 서버에서 (클라이언트 직접 호출 X)
 *   - 에러 메시지는 사용자에게 최소한의 정보만 노출
 *     (예: "이메일 또는 비밀번호가 틀렸습니다" - 어느 쪽이 틀렸는지 알려주지 않음)
 *   - 서버 에러 로그는 콘솔에만 출력 (클라이언트에 내부 에러 노출 X)
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/** 서버 액션의 반환 타입 */
export type AuthActionResult =
  | { error: string }   // 실패: 에러 메시지 반환
  | undefined           // 성공: redirect() 호출 후 이 값은 반환되지 않음

/**
 * loginAction
 *
 * 이메일/비밀번호로 로그인
 *
 * 성공 시: redirect('/home') → middleware가 온보딩 여부 체크
 * 실패 시: { error: string } 반환 → 클라이언트에서 에러 표시
 *
 * @param email    - 사용자 이메일
 * @param password - 사용자 비밀번호
 */
export async function loginAction(
  email: string,
  password: string
): Promise<AuthActionResult> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // 내부 에러는 서버 로그에만 기록
    console.error('[loginAction] 로그인 실패:', error.code)

    // 클라이언트에는 일반적인 메시지만 전달 (브루트포스 방지)
    return {
      error: '이메일 또는 비밀번호가 올바르지 않습니다.',
    }
  }

  /**
   * 성공: /home으로 리다이렉트
   * middleware.ts가 자동으로 온보딩 여부를 확인하여:
   *   - is_onboarded = false → /onboarding
   *   - is_onboarded = true  → /home 통과
   */
  redirect('/home')
}
