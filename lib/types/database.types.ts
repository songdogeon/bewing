/**
 * lib/types/database.types.ts
 *
 * BeWing — Wingman 컨셉 DB 타입 정의
 *
 * 테이블: wingman_profiles, friend_profiles, friend_photos,
 *         wingman_swipes, wingman_matches
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {

      // ── wingman_profiles ────────────────────────────────────────
      wingman_profiles: {
        Row: {
          id:           string
          insta_id:     string | null
          display_name: string | null
          age:          number | null
          gender:       'male' | 'female' | 'other' | null
          region:       string | null
          bio:          string | null
          is_onboarded: boolean
          created_at:   string
          updated_at:   string
        }
        Insert: {
          id:            string
          insta_id?:     string | null
          display_name?: string | null
          age?:          number | null
          gender?:       'male' | 'female' | 'other' | null
          region?:       string | null
          bio?:          string | null
          is_onboarded?: boolean
          created_at?:   string
          updated_at?:   string
        }
        Update: {
          insta_id?:     string | null
          display_name?: string | null
          age?:          number | null
          gender?:       'male' | 'female' | 'other' | null
          region?:       string | null
          bio?:          string | null
          is_onboarded?: boolean
          updated_at?:   string
        }
        Relationships: []
      }

      // ── friend_profiles ─────────────────────────────────────────
      friend_profiles: {
        Row: {
          id:            string
          registered_by: string
          insta_id:      string
          display_name:  string | null
          age:           number | null
          gender:        'male' | 'female' | 'other' | null
          region:        string | null
          bio:           string | null
          is_active:     boolean
          created_at:    string
          updated_at:    string
        }
        Insert: {
          id?:           string
          registered_by: string
          insta_id:      string
          display_name?: string | null
          age?:          number | null
          gender?:       'male' | 'female' | 'other' | null
          region?:       string | null
          bio?:          string | null
          is_active?:    boolean
          created_at?:   string
          updated_at?:   string
        }
        Update: {
          insta_id?:     string
          display_name?: string | null
          age?:          number | null
          gender?:       'male' | 'female' | 'other' | null
          region?:       string | null
          bio?:          string | null
          is_active?:    boolean
          updated_at?:   string
        }
        Relationships: [
          {
            foreignKeyName: 'friend_profiles_registered_by_fkey'
            columns: ['registered_by']
            referencedRelation: 'wingman_profiles'
            referencedColumns: ['id']
          }
        ]
      }

      // ── friend_photos ───────────────────────────────────────────
      friend_photos: {
        Row: {
          id:            string
          friend_id:     string
          photo_url:     string
          display_order: number
          uploaded_by:   string | null
          created_at:    string
        }
        Insert: {
          id?:           string
          friend_id:     string
          photo_url:     string
          display_order?: number
          uploaded_by?:  string | null
          created_at?:   string
        }
        Update: {
          photo_url?:     string
          display_order?: number
        }
        Relationships: [
          {
            foreignKeyName: 'friend_photos_friend_id_fkey'
            columns: ['friend_id']
            referencedRelation: 'friend_profiles'
            referencedColumns: ['id']
          }
        ]
      }

      // ── wingman_swipes ──────────────────────────────────────────
      wingman_swipes: {
        Row: {
          id:             string
          wingman_id:     string
          from_friend_id: string
          to_friend_id:   string
          direction:      'like' | 'pass'
          created_at:     string
        }
        Insert: {
          id?:            string
          wingman_id:     string
          from_friend_id: string
          to_friend_id:   string
          direction:      'like' | 'pass'
          created_at?:    string
        }
        Update: {
          direction?: 'like' | 'pass'
        }
        Relationships: [
          {
            foreignKeyName: 'wingman_swipes_wingman_id_fkey'
            columns: ['wingman_id']
            referencedRelation: 'wingman_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'wingman_swipes_from_friend_id_fkey'
            columns: ['from_friend_id']
            referencedRelation: 'friend_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'wingman_swipes_to_friend_id_fkey'
            columns: ['to_friend_id']
            referencedRelation: 'friend_profiles'
            referencedColumns: ['id']
          }
        ]
      }

      // ── wingman_matches ─────────────────────────────────────────
      wingman_matches: {
        Row: {
          id:          string
          friend1_id:  string
          friend2_id:  string
          wingman1_id: string
          wingman2_id: string
          status:      'active' | 'unmatched'
          created_at:  string
        }
        Insert: {
          id?:         string
          friend1_id:  string
          friend2_id:  string
          wingman1_id: string
          wingman2_id: string
          status?:     'active' | 'unmatched'
          created_at?: string
        }
        Update: {
          status?: 'active' | 'unmatched'
        }
        Relationships: [
          {
            foreignKeyName: 'wingman_matches_friend1_id_fkey'
            columns: ['friend1_id']
            referencedRelation: 'friend_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'wingman_matches_friend2_id_fkey'
            columns: ['friend2_id']
            referencedRelation: 'friend_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'wingman_matches_wingman1_id_fkey'
            columns: ['wingman1_id']
            referencedRelation: 'wingman_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'wingman_matches_wingman2_id_fkey'
            columns: ['wingman2_id']
            referencedRelation: 'wingman_profiles'
            referencedColumns: ['id']
          }
        ]
      }

    }

    Views:     { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums:     { [_ in never]: never }
  }
}

// ── 편의 타입 ────────────────────────────────────────────────────
export type WingmanProfileRow = Database['public']['Tables']['wingman_profiles']['Row']
export type FriendProfileRow  = Database['public']['Tables']['friend_profiles']['Row']
export type FriendPhotoRow    = Database['public']['Tables']['friend_photos']['Row']
export type WingmanSwipeRow   = Database['public']['Tables']['wingman_swipes']['Row']
export type WingmanMatchRow   = Database['public']['Tables']['wingman_matches']['Row']

// ── 조인 타입 ────────────────────────────────────────────────────

/** 친구 프로필 + 사진 목록 */
export type FriendProfileWithPhotos = FriendProfileRow & {
  friend_photos: FriendPhotoRow[]
}

/** 스와이프 카드 덱용 — 상대 Wingman의 친구 프로필 */
export type SwipeCard = FriendProfileWithPhotos & {
  wingman: Pick<WingmanProfileRow, 'id' | 'insta_id' | 'display_name'>
}

/** 매칭 목록 아이템 */
export interface MatchItem {
  matchId:      string
  matchedAt:    string
  status:       'active' | 'unmatched'
  myFriend:     FriendProfileWithPhotos
  theirFriend:  FriendProfileWithPhotos
  theirWingman: Pick<WingmanProfileRow, 'id' | 'insta_id' | 'display_name'>
}
