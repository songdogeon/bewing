'use server'

import { createClient } from '@/lib/supabase/server'

export interface UpdateProfileData {
  display_name: string
  insta_id:     string
  age:          number
  gender:       'male' | 'female' | 'other'
  region:       string
  bio:          string
}

export type UpdateProfileResult =
  | { success: true }
  | { error: string }

export async function updateWingmanProfile(
  data: UpdateProfileData
): Promise<UpdateProfileResult> {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return { error: '로그인이 필요합니다.' }

  const cleanInstaId = data.insta_id.replace(/^@/, '').trim().toLowerCase()

  const { error } = await supabase
    .from('wingman_profiles')
    .update({
      display_name: data.display_name.trim(),
      insta_id:     cleanInstaId,
      age:          data.age,
      gender:       data.gender,
      region:       data.region,
      bio:          data.bio.trim() || null,
      updated_at:   new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    console.error('[updateWingmanProfile] 실패:', error.message)
    if (error.code === '23505') return { error: '이미 사용 중인 인스타그램 아이디예요.' }
    return { error: '저장에 실패했습니다. 잠시 후 다시 시도해주세요.' }
  }

  return { success: true }
}
