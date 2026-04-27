export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      blocked_users: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string | null
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string | null
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocked_users_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_users_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      card_photos: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          photo_url: string
          profile_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          photo_url: string
          profile_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          photo_url?: string
          profile_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "card_photos_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_photos: {
        Row: {
          created_at: string
          display_order: number
          friend_id: string
          id: string
          photo_url: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          display_order?: number
          friend_id: string
          id?: string
          photo_url: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number
          friend_id?: string
          id?: string
          photo_url?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "friend_photos_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "friend_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_profiles: {
        Row: {
          age: number | null
          bio: string | null
          created_at: string
          display_name: string | null
          gender: string | null
          id: string
          insta_id: string
          is_active: boolean
          region: string | null
          registered_by: string
          updated_at: string
        }
        Insert: {
          age?: number | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          gender?: string | null
          id?: string
          insta_id: string
          is_active?: boolean
          region?: string | null
          registered_by: string
          updated_at?: string
        }
        Update: {
          age?: number | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          gender?: string | null
          id?: string
          insta_id?: string
          is_active?: boolean
          region?: string | null
          registered_by?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_profiles_registered_by_fkey"
            columns: ["registered_by"]
            isOneToOne: false
            referencedRelation: "wingman_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string | null
          id: string
          status: string | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          status?: string | null
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          status?: string | null
          user1_id?: string
          user2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          match_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          match_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          match_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "wingman_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          bio: string | null
          created_at: string | null
          gender: string | null
          id: string
          insta_id: string | null
          is_onboarded: boolean | null
          region: string | null
          updated_at: string | null
          wingman_allowed: boolean | null
        }
        Insert: {
          age?: number | null
          bio?: string | null
          created_at?: string | null
          gender?: string | null
          id: string
          insta_id?: string | null
          is_onboarded?: boolean | null
          region?: string | null
          updated_at?: string | null
          wingman_allowed?: boolean | null
        }
        Update: {
          age?: number | null
          bio?: string | null
          created_at?: string | null
          gender?: string | null
          id?: string
          insta_id?: string | null
          is_onboarded?: boolean | null
          region?: string | null
          updated_at?: string | null
          wingman_allowed?: boolean | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string | null
          details: string | null
          id: string
          reason: string
          reported_id: string
          reporter_id: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          details?: string | null
          id?: string
          reason: string
          reported_id: string
          reporter_id: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          details?: string | null
          id?: string
          reason?: string
          reported_id?: string
          reporter_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_reported_id_fkey"
            columns: ["reported_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      swipes: {
        Row: {
          card_owner_id: string
          created_at: string | null
          direction: string
          id: string
          swiper_id: string
        }
        Insert: {
          card_owner_id: string
          created_at?: string | null
          direction: string
          id?: string
          swiper_id: string
        }
        Update: {
          card_owner_id?: string
          created_at?: string | null
          direction?: string
          id?: string
          swiper_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swipes_card_owner_id_fkey"
            columns: ["card_owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swipes_swiper_id_fkey"
            columns: ["swiper_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wingman_matches: {
        Row: {
          created_at: string
          friend1_id: string
          friend2_id: string
          id: string
          status: string
          wingman1_id: string
          wingman2_id: string
        }
        Insert: {
          created_at?: string
          friend1_id: string
          friend2_id: string
          id?: string
          status?: string
          wingman1_id: string
          wingman2_id: string
        }
        Update: {
          created_at?: string
          friend1_id?: string
          friend2_id?: string
          id?: string
          status?: string
          wingman1_id?: string
          wingman2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wingman_matches_friend1_id_fkey"
            columns: ["friend1_id"]
            isOneToOne: false
            referencedRelation: "friend_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wingman_matches_friend2_id_fkey"
            columns: ["friend2_id"]
            isOneToOne: false
            referencedRelation: "friend_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wingman_matches_wingman1_id_fkey"
            columns: ["wingman1_id"]
            isOneToOne: false
            referencedRelation: "wingman_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wingman_matches_wingman2_id_fkey"
            columns: ["wingman2_id"]
            isOneToOne: false
            referencedRelation: "wingman_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wingman_profiles: {
        Row: {
          age: number | null
          bio: string | null
          created_at: string
          display_name: string | null
          gender: string | null
          id: string
          insta_id: string | null
          is_onboarded: boolean
          region: string | null
          updated_at: string
        }
        Insert: {
          age?: number | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          gender?: string | null
          id: string
          insta_id?: string | null
          is_onboarded?: boolean
          region?: string | null
          updated_at?: string
        }
        Update: {
          age?: number | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          gender?: string | null
          id?: string
          insta_id?: string | null
          is_onboarded?: boolean
          region?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      wingman_swipes: {
        Row: {
          created_at: string
          direction: string
          from_friend_id: string
          id: string
          to_friend_id: string
          wingman_id: string
        }
        Insert: {
          created_at?: string
          direction: string
          from_friend_id: string
          id?: string
          to_friend_id: string
          wingman_id: string
        }
        Update: {
          created_at?: string
          direction?: string
          from_friend_id?: string
          id?: string
          to_friend_id?: string
          wingman_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wingman_swipes_from_friend_id_fkey"
            columns: ["from_friend_id"]
            isOneToOne: false
            referencedRelation: "friend_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wingman_swipes_to_friend_id_fkey"
            columns: ["to_friend_id"]
            isOneToOne: false
            referencedRelation: "friend_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wingman_swipes_wingman_id_fkey"
            columns: ["wingman_id"]
            isOneToOne: false
            referencedRelation: "wingman_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
