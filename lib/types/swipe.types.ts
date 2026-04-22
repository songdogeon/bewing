/**
 * lib/types/swipe.types.ts
 *
 * 스와이프 관련 공유 타입 — 새 Wingman 컨셉 기준
 */

/** 스와이프 방향 */
export type SwipeDirection = 'left' | 'right'

/**
 * 스와이프 카드 데이터
 *
 * DB: friend_profiles + friend_photos + wingman_profiles(registeredBy)
 * id = friend_profiles.id
 */
export interface CardData {
  id:           string                           // friend_profiles.id
  insta_id:     string
  display_name: string | null
  photos:       string[]
  age:          number
  region:       string
  bio?:         string | null
  gender?:      'male' | 'female' | 'other' | null
  wingmanId:    string                           // registered_by wingman UUID
  wingmanName?: string | null                    // 등록한 Wingman 표시 이름
}
