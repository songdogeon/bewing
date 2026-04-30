'use server'

/**
 * app/swipe/actions.ts
 *
 * 스와이프 플로우 Server Actions
 *   getMyFriends     — 내가 등록한 친구 목록
 *   getSwipeCards    — 스와이프할 상대 친구 카드 목록
 *   recordFriendSwipe — 스와이프 저장 + 매칭 체크
 */

import { createClient } from '@/lib/supabase/server'
import type { CardData } from '@/lib/types/swipe.types'

// ─────────────────────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────────────────────

/** 내 친구 목록 아이템 */
export interface MyFriend {
  id:           string
  insta_id:     string
  display_name: string | null
  age:          number | null
  gender:       'male' | 'female' | 'other' | null
  region:       string | null
  photoUrl:     string | null   // 첫 번째 사진 URL
}

/** recordFriendSwipe 반환 */
export type FriendSwipeResult =
  | { success: true; isMatch: false }
  | { success: true; isMatch: true; matchedInstaId: string }
  | { error: string }

// ─────────────────────────────────────────────────────────────
// Action 1: getMyFriends
// ─────────────────────────────────────────────────────────────

export async function getMyFriends(): Promise<MyFriend[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('friend_profiles')
    .select(`
      id, insta_id, display_name, age, gender, region,
      friend_photos ( photo_url, display_order )
    `)
    .eq('registered_by', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error || !data) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((f) => ({
    id:           f.id,
    insta_id:     f.insta_id,
    display_name: f.display_name,
    age:          f.age,
    gender:       f.gender,
    region:       f.region,
    photoUrl: (f.friend_photos ?? [])
      .sort((a: { display_order: number }, b: { display_order: number }) =>
        a.display_order - b.display_order
      )[0]?.photo_url ?? null,
  }))
}

// ─────────────────────────────────────────────────────────────
// Action 2: getSwipeCards
// ─────────────────────────────────────────────────────────────

/**
 * fromFriendId를 위해 스와이프할 상대 친구 카드 목록
 *   - 내가 등록한 친구는 제외
 *   - 이미 스와이프한 친구는 제외
 */
export async function getSwipeCards(fromFriendId: string): Promise<CardData[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // 이미 스와이프한 to_friend_id + 차단한 Wingman ID 병렬 조회
  const [{ data: swiped }, { data: blocked }] = await Promise.all([
    supabase
      .from('wingman_swipes')
      .select('to_friend_id')
      .eq('wingman_id', user.id)
      .eq('from_friend_id', fromFriendId),
    supabase
      .from('wingman_blocks')
      .select('blocked_id')
      .eq('blocker_id', user.id),
  ])

  const swipedIds      = swiped?.map((s) => s.to_friend_id) ?? []
  const blockedWingIds = blocked?.map((b) => b.blocked_id)  ?? []

  // 상대 Wingman의 친구 프로필 조회
  let query = supabase
    .from('friend_profiles')
    .select(`
      id, insta_id, display_name, age, gender, region, bio, registered_by,
      friend_photos ( photo_url, display_order ),
      wingman_profiles!registered_by ( display_name, insta_id )
    `)
    .eq('is_active', true)
    .neq('registered_by', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (swipedIds.length > 0) {
    query = query.not('id', 'in', `(${swipedIds.join(',')})`)
  }
  if (blockedWingIds.length > 0) {
    query = query.not('registered_by', 'in', `(${blockedWingIds.join(',')})`)
  }

  const { data, error } = await query
  if (error || !data) {
    console.error('[getSwipeCards]', error?.message)
    return []
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((f) => ({
    id:           f.id,
    insta_id:     f.insta_id ?? '',
    display_name: f.display_name ?? null,
    photos: (f.friend_photos ?? [])
      .sort((a: { display_order: number }, b: { display_order: number }) =>
        a.display_order - b.display_order
      )
      .map((p: { photo_url: string }) => p.photo_url),
    age:        f.age    ?? 0,
    region:     f.region ?? '',
    bio:        f.bio    ?? null,
    gender:     f.gender ?? null,
    wingmanId:  f.registered_by,
    wingmanName:
      f.wingman_profiles?.display_name ??
      f.wingman_profiles?.insta_id     ?? null,
  } satisfies CardData))
}

// ─────────────────────────────────────────────────────────────
// Action 3: recordFriendSwipe
// ─────────────────────────────────────────────────────────────

/**
 * 스와이프 저장 + mutual like 시 wingman_matches 생성
 *
 * mutual like 조건:
 *   상대 Wingman이 "toFriend → fromFriend" 방향으로 이미 like했는지 확인
 */
export async function recordFriendSwipe(
  fromFriendId: string,
  toFriendId:   string,
  direction:    'like' | 'pass'
): Promise<FriendSwipeResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: '로그인이 필요합니다.' }

  // ── 스와이프 저장 ─────────────────────────────────────────
  const { error: swipeError } = await supabase
    .from('wingman_swipes')
    .upsert(
      {
        wingman_id:     user.id,
        from_friend_id: fromFriendId,
        to_friend_id:   toFriendId,
        direction,
      },
      {
        onConflict:       'wingman_id,from_friend_id,to_friend_id',
        ignoreDuplicates: false,
      }
    )

  if (swipeError) {
    console.error('[recordFriendSwipe] upsert 실패:', swipeError.message)
    return { error: '스와이프 저장에 실패했습니다.' }
  }

  if (direction !== 'like') return { success: true, isMatch: false }

  // ── mutual like 체크 ──────────────────────────────────────
  // 상대방이 toFriend(내 친구) → fromFriend(상대 친구) 방향으로 like 했는지
  const { data: mutual } = await supabase
    .from('wingman_swipes')
    .select('wingman_id')
    .eq('from_friend_id', toFriendId)
    .eq('to_friend_id',   fromFriendId)
    .eq('direction',      'like')
    .maybeSingle()

  if (!mutual) return { success: true, isMatch: false }

  // ── 매칭 생성 (friend1_id < friend2_id 정규화) ───────────
  const [friend1_id,  friend2_id]  =
    fromFriendId < toFriendId
      ? [fromFriendId, toFriendId]
      : [toFriendId,   fromFriendId]

  const otherWingmanId = mutual.wingman_id
  const [wingman1_id,  wingman2_id] =
    fromFriendId < toFriendId
      ? [user.id,         otherWingmanId]
      : [otherWingmanId,  user.id]

  const { error: matchError } = await supabase
    .from('wingman_matches')
    .insert({ friend1_id, friend2_id, wingman1_id, wingman2_id, status: 'active' })

  if (matchError && matchError.code !== '23505') {
    console.error('[recordFriendSwipe] 매칭 생성 실패:', matchError.message)
    return { success: true, isMatch: false }
  }

  // 매칭된 친구 instagram ID
  const { data: matched } = await supabase
    .from('friend_profiles')
    .select('insta_id')
    .eq('id', toFriendId)
    .single()

  return {
    success:        true,
    isMatch:        true,
    matchedInstaId: matched?.insta_id ?? '',
  }
}
