export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      behavioral_events: {
        Row: {
          app_version: string | null
          created_at: string
          device_os_version: string | null
          device_platform: Database["public"]["Enums"]["device_platform"] | null
          event_data: Json
          event_type: Database["public"]["Enums"]["event_type"]
          geo_area: string
          id: string
          session_id: string | null
          user_id: string
        }
        Insert: {
          app_version?: string | null
          created_at?: string
          device_os_version?: string | null
          device_platform?:
            | Database["public"]["Enums"]["device_platform"]
            | null
          event_data?: Json
          event_type: Database["public"]["Enums"]["event_type"]
          geo_area?: string
          id?: string
          session_id?: string | null
          user_id: string
        }
        Update: {
          app_version?: string | null
          created_at?: string
          device_os_version?: string | null
          device_platform?:
            | Database["public"]["Enums"]["device_platform"]
            | null
          event_data?: Json
          event_type?: Database["public"]["Enums"]["event_type"]
          geo_area?: string
          id?: string
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "behavioral_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          email: string
          id: string
          is_active: boolean
          is_verified: boolean
          license_number: string | null
          role_category: Database["public"]["Enums"]["role_category"] | null
          service_area: string
          specializations: string[] | null
          updated_at: string
          years_experience: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          is_active?: boolean
          is_verified?: boolean
          license_number?: string | null
          role_category?: Database["public"]["Enums"]["role_category"] | null
          service_area?: string
          specializations?: string[] | null
          updated_at?: string
          years_experience?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          is_active?: boolean
          is_verified?: boolean
          license_number?: string | null
          role_category?: Database["public"]["Enums"]["role_category"] | null
          service_area?: string
          specializations?: string[] | null
          updated_at?: string
          years_experience?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      device_platform: "ios" | "android" | "web"
      event_type:
        | "signup"
        | "login"
        | "logout"
        | "session_start"
        | "session_end"
        | "email_verified"
        | "profile_update"
        | "profile_view"
        | "video_upload"
        | "video_record"
        | "video_view"
        | "video_like"
        | "video_unlike"
        | "feed_scroll"
        | "video_swipe_left"
        | "video_swipe_right"
        | "deck_change"
        | "subscription_start"
        | "subscription_cancel"
        | "subscription_renewed"
        | "survey_start"
        | "survey_complete"
        | "survey_skip"
        | "notification_received"
        | "notification_tapped"
        | "app_open"
        | "app_close"
        | "app_background"
      role_category:
        | "lender"
        | "agent"
        | "attorney"
        | "title"
        | "inspector"
        | "appraiser"
        | "other"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      device_platform: ["ios", "android", "web"],
      event_type: [
        "signup",
        "login",
        "logout",
        "session_start",
        "session_end",
        "email_verified",
        "profile_update",
        "profile_view",
        "video_upload",
        "video_record",
        "video_view",
        "video_like",
        "video_unlike",
        "feed_scroll",
        "video_swipe_left",
        "video_swipe_right",
        "deck_change",
        "subscription_start",
        "subscription_cancel",
        "subscription_renewed",
        "survey_start",
        "survey_complete",
        "survey_skip",
        "notification_received",
        "notification_tapped",
        "app_open",
        "app_close",
        "app_background",
      ],
      role_category: [
        "lender",
        "agent",
        "attorney",
        "title",
        "inspector",
        "appraiser",
        "other",
      ],
    },
  },
} as const
