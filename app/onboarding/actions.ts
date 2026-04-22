'use server'

/**
 * app/onboarding/actions.ts
 *
 * Wingman 온보딩 — wingman_profiles 저장 Server Action
 */

import { createClient } from '@/lib/supabase/server'
import { redirect }     from 'next/navigation'
import { cookies }      from 'next/headers'

export type OnboardingActionResult =
  | { error: string }
  | undefined   // 성공 시 redirect

export interface OnboardingData {
  display_name: string
  insta_id:     string
  age:          number
  gender:       'male' | 'female' | 'other'
  region:       string
  bio:          string
}

export async function onboardingAction(
  data: OnboardingData
): Promise<OnboardingActionResult> {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: '로그인이 필요합니다.' }
  }

  const { error } = await supabase
    .from('wingman_profiles')
    .update({
      display_name: data.display_name.trim(),
      insta_id:     data.insta_id.replace(/^@/, '').trim(),
      age:          data.age,
      gender:       data.gender,
      region:       data.region.trim(),
      bio:          data.bio.trim() || null,
      is_onboarded: true,
      updated_at:   new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    console.error('[onboardingAction] 저장 실패:', error.message)
    return { error: '프로필 저장에 실패했습니다. 잠시 후 다시 시도해주세요.' }
  }

  // 온보딩 완료 쿠키 설정 (미들웨어 캐시용)
  const cookieStore = await cookies()
  cookieStore.set('wm_onboarded', '1', {
    maxAge:   60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: 'lax',
    secure:   process.env.NODE_ENV === 'production',
    path:     '/',
  })

  redirect('/home')
}
