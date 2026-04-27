'use server'

/**
 * app/friends/actions.ts
 *
 * 친구 프로필 등록 Server Action
 *
 * redirect()를 사용하지 않고 { success: true } 를 반환한다.
 * Client Component에서 redirect()를 호출하면 NEXT_REDIRECT 예외가 발생해
 * try/finally 구조에서 예상치 못한 동작이 생길 수 있기 때문이다.
 * 실제 페이지 이동은 호출 측(Client Component)에서 router.push()로 처리한다.
 */

import { createClient } from '@/lib/supabase/server'

// ─────────────────────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────────────────────

export interface RegisterFriendData {
  display_name: string
  insta_id:     string
  age:          number
  gender:       'male' | 'female' | 'other'
  region:       string
  bio:          string
  photoUrls:    string[]
}

export type RegisterFriendResult =
  | { success: true }
  | { error: string }

// ─────────────────────────────────────────────────────────────
// registerFriend
// ─────────────────────────────────────────────────────────────

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

  if (countError) return { error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }
  if ((count ?? 0) >= 5) return { error: '친구는 최대 5명까지 등록할 수 있어요.' }

  // ── 친구 프로필 저장 ──────────────────────────────────────────
  const cleanInstaId = data.insta_id.replace(/^@/, '').trim().toLowerCase()

  const { data: friend, error: friendError } = await supabase
    .from('friend_profiles')
    .insert({
      registered_by: user.id,
      insta_id:      cleanInstaId,
      display_name:  data.display_name.trim(),
      age:           data.age,
      gender:        data.gender,
      region:        data.region,
      bio:           data.bio.trim() || null,
    })
    .select('id')
    .single()

  if (friendError || !friend) {
    console.error('[registerFriend] INSERT 실패 — code:', friendError?.code, '| message:', friendError?.message)
    if (friendError?.code === '23505') {
      return { error: '이미 등록된 인스타그램 아이디예요.' }
    }
    if (friendError?.message?.includes('FRIEND_LIMIT_EXCEEDED')) {
      return { error: '친구는 최대 5명까지 등록할 수 있어요.' }
    }
    // 실제 에러 메시지를 그대로 반환 — 진단 후 숨길 수 있음
    return { error: `DB 오류: ${friendError?.message ?? '알 수 없는 오류'} (code: ${friendError?.code ?? '-'})` }
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
      // 사진 저장 실패해도 프로필은 유지 (사용자에게는 성공으로 처리)
    }
  }

  return { success: true }
}
