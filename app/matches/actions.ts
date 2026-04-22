'use server'

/**
 * app/matches/actions.ts
 *
 * 매칭 관련 Server Actions — 새 Wingman 컨셉 기준
 *   getMyWingmanMatches : wingman_matches 기반 매칭 목록 조회
 */

import { createClient } from '@/lib/supabase/server'

// ─────────────────────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────────────────────

export interface FriendSummary {
  id:           string
  insta_id:     string
  display_name: string | null
  age:          number | null
  region:       string | null
  bio:          string | null
  photoUrl:     string | null
}

export interface WingmanSummary {
  id:           string
  insta_id:     string | null
  display_name: string | null
}

export interface WingmanMatchItem {
  matchId:      string
  matchedAt:    string
  status:       'active' | 'unmatched'
  myFriend:     FriendSummary
  theirFriend:  FriendSummary
  theirWingman: WingmanSummary
}

// ─────────────────────────────────────────────────────────────
// 헬퍼: 첫 번째 사진 URL 추출
// ─────────────────────────────────────────────────────────────

function firstPhoto(photos: { photo_url: string; display_order: number }[]): string | null {
  return (photos ?? [])
    .sort((a, b) => a.display_order - b.display_order)
    .at(0)?.photo_url ?? null
}

// ─────────────────────────────────────────────────────────────
// getMyWingmanMatches
// ─────────────────────────────────────────────────────────────

export async function getMyWingmanMatches(
  status: 'active' | 'unmatched' = 'active'
): Promise<WingmanMatchItem[]> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return []

  const { data, error } = await supabase
    .from('wingman_matches')
    .select(`
      id, friend1_id, friend2_id, wingman1_id, wingman2_id, status, created_at,
      friend1:friend_profiles!friend1_id (
        id, insta_id, display_name, age, region, bio,
        friend_photos ( photo_url, display_order )
      ),
      friend2:friend_profiles!friend2_id (
        id, insta_id, display_name, age, region, bio,
        friend_photos ( photo_url, display_order )
      ),
      wingman1:wingman_profiles!wingman1_id ( id, insta_id, display_name ),
      wingman2:wingman_profiles!wingman2_id ( id, insta_id, display_name )
    `)
    .eq('status', status)
    .or(`wingman1_id.eq.${user.id},wingman2_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[getMyWingmanMatches] 조회 실패:', error.message)
    return []
  }
  if (!data || data.length === 0) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((match) => {
    const isWingman1  = match.wingman1_id === user.id
    const myFriendRaw    = isWingman1 ? match.friend1    : match.friend2
    const theirFriendRaw = isWingman1 ? match.friend2    : match.friend1
    const theirWingmanRaw= isWingman1 ? match.wingman2   : match.wingman1

    return {
      matchId:   match.id,
      matchedAt: match.created_at,
      status:    match.status as 'active' | 'unmatched',
      myFriend: {
        id:           myFriendRaw?.id           ?? '',
        insta_id:     myFriendRaw?.insta_id     ?? '',
        display_name: myFriendRaw?.display_name ?? null,
        age:          myFriendRaw?.age          ?? null,
        region:       myFriendRaw?.region       ?? null,
        bio:          myFriendRaw?.bio          ?? null,
        photoUrl:     firstPhoto(myFriendRaw?.friend_photos ?? []),
      },
      theirFriend: {
        id:           theirFriendRaw?.id           ?? '',
        insta_id:     theirFriendRaw?.insta_id     ?? '',
        display_name: theirFriendRaw?.display_name ?? null,
        age:          theirFriendRaw?.age          ?? null,
        region:       theirFriendRaw?.region       ?? null,
        bio:          theirFriendRaw?.bio          ?? null,
        photoUrl:     firstPhoto(theirFriendRaw?.friend_photos ?? []),
      },
      theirWingman: {
        id:           theirWingmanRaw?.id           ?? '',
        insta_id:     theirWingmanRaw?.insta_id     ?? null,
        display_name: theirWingmanRaw?.display_name ?? null,
      },
    } satisfies WingmanMatchItem
  })
}
