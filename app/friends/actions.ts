'use server'

/**
 * app/friends/actions.ts
 *
 * 친구 프로필 등록 Server Action
 */

import { createClient } from '@/lib/supabase/server'
import { redirect }     from 'next/navigation'

export interface RegisterFriendData {
  display_name: string
  insta_id:     string
  age:          number
  gender:       'male' | 'female' | 'other'
  region:       string
  bio:          string
  photoUrls:    string[]
}

export type RegisterFriendResult = { error: string } | undefined

export async function registerFriend(
  data: RegisterFriendData
): Promise<RegisterFriendResult> {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return { error: '로그인이 필요합니다.' }

  // ── 친구 수 제한 확인 ─────────────────────────────────────────
  const { count, error: countError } = await supabase
    .from('friend_profiles')
    .select('id', { count: 'exact', head: true })
    .eq('registered_by', user.id)

  if (countError) return { error: '오류가 발생했습니다. 다시 시도해주세요.' }
  if ((count ?? 0) >= 5) return { error: '친구는 최대 5명까지 등록할 수 있어요.' }

  // ── 친구 프로필 저장 ──────────────────────────────────────────
  const { data: friend, error: friendError } = await supabase
    .from('friend_profiles')
    .insert({
      registered_by: user.id,
      insta_id:      data.insta_id.replace(/^@/, '').trim().toLowerCase(),
      display_name:  data.display_name.trim(),
      age:           data.age,
      gender:        data.gender,
      region:        data.region,
      bio:           data.bio.trim() || null,
    })
    .select('id')
    .single()

  if (friendError || !friend) {
    if (friendError?.message?.includes('FRIEND_LIMIT_EXCEEDED')) {
      return { error: '친구는 최대 5명까지 등록할 수 있어요.' }
    }
    console.error('[registerFriend] 친구 등록 실패:', friendError?.message)
    return { error: '친구 등록에 실패했습니다. 다시 시도해주세요.' }
  }

  // ── 사진 저장 ─────────────────────────────────────────────────
  if (data.photoUrls.length > 0) {
    const photoInserts = data.photoUrls.map((url, i) => ({
      friend_id:     friend.id,
      photo_url:     url,
      display_order: i,
      uploaded_by:   user.id,
    }))

    const { error: photoError } = await supabase
      .from('friend_photos')
      .insert(photoInserts)

    if (photoError) {
      console.error('[registerFriend] 사진 저장 실패:', photoError.message)
      // 사진 실패해도 프로필은 유지
    }
  }

  redirect('/home')
}
