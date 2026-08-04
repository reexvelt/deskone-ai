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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          created_at: string
          id: string
          kind: string
          message: string
          meta: Json
          mission_id: string | null
          project_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          message: string
          meta?: Json
          mission_id?: string | null
          project_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          message?: string
          meta?: Json
          mission_id?: string | null
          project_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          body: string
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["asset_kind"]
          media_kind: string | null
          media_name: string | null
          mission_id: string | null
          project_id: string | null
          publish: Json | null
          status: Database["public"]["Enums"]["asset_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["asset_kind"]
          media_kind?: string | null
          media_name?: string | null
          mission_id?: string | null
          project_id?: string | null
          publish?: Json | null
          status?: Database["public"]["Enums"]["asset_status"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["asset_kind"]
          media_kind?: string | null
          media_name?: string | null
          mission_id?: string | null
          project_id?: string | null
          publish?: Json | null
          status?: Database["public"]["Enums"]["asset_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      connected_accounts: {
        Row: {
          connected_at: string
          email: string | null
          expires_at: string | null
          id: string
          meta: Json
          provider: string
          provider_account_id: string | null
          scopes: string[]
          status: string
          user_id: string
        }
        Insert: {
          connected_at?: string
          email?: string | null
          expires_at?: string | null
          id?: string
          meta?: Json
          provider: string
          provider_account_id?: string | null
          scopes?: string[]
          status?: string
          user_id: string
        }
        Update: {
          connected_at?: string
          email?: string | null
          expires_at?: string | null
          id?: string
          meta?: Json
          provider?: string
          provider_account_id?: string | null
          scopes?: string[]
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          kind: string
          meta: Json
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string
          id?: string
          kind: string
          meta?: Json
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          kind?: string
          meta?: Json
          user_id?: string
        }
        Relationships: []
      }
      files: {
        Row: {
          created_at: string
          id: string
          kind: string
          mime: string
          mission_id: string | null
          name: string
          project_id: string | null
          size: number
          storage_path: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind?: string
          mime?: string
          mission_id?: string | null
          name: string
          project_id?: string | null
          size?: number
          storage_path: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          mime?: string
          mission_id?: string | null
          name?: string
          project_id?: string | null
          size?: number
          storage_path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "files_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          apps: string[]
          completed_at: string | null
          cost: number
          created_at: string
          estimated_minutes: number
          id: string
          logs: Json
          objective: string
          outputs: Json
          progress: number
          project_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["mission_status"]
          steps: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          apps?: string[]
          completed_at?: string | null
          cost?: number
          created_at?: string
          estimated_minutes?: number
          id?: string
          logs?: Json
          objective?: string
          outputs?: Json
          progress?: number
          project_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["mission_status"]
          steps?: Json
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          apps?: string[]
          completed_at?: string | null
          cost?: number
          created_at?: string
          estimated_minutes?: number
          id?: string
          logs?: Json
          objective?: string
          outputs?: Json
          progress?: number
          project_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["mission_status"]
          steps?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "missions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          archived: boolean
          body: string
          category: Database["public"]["Enums"]["notification_category"]
          created_at: string
          id: string
          mission_id: string | null
          project_id: string | null
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          body?: string
          category: Database["public"]["Enums"]["notification_category"]
          created_at?: string
          id?: string
          mission_id?: string | null
          project_id?: string | null
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          archived?: boolean
          body?: string
          category?: Database["public"]["Enums"]["notification_category"]
          created_at?: string
          id?: string
          mission_id?: string | null
          project_id?: string | null
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          commission_cents: number
          created_at: string
          credits_earned: number
          credits_purchased: number
          credits_total: number
          credits_used: number
          email: string | null
          id: string
          name: string | null
          referral_code: string
          referred_by: string | null
          updated_at: string
          workspace: Json
        }
        Insert: {
          avatar_url?: string | null
          commission_cents?: number
          created_at?: string
          credits_earned?: number
          credits_purchased?: number
          credits_total?: number
          credits_used?: number
          email?: string | null
          id: string
          name?: string | null
          referral_code: string
          referred_by?: string | null
          updated_at?: string
          workspace?: Json
        }
        Update: {
          avatar_url?: string | null
          commission_cents?: number
          created_at?: string
          credits_earned?: number
          credits_purchased?: number
          credits_total?: number
          credits_used?: number
          email?: string | null
          id?: string
          name?: string | null
          referral_code?: string
          referred_by?: string | null
          updated_at?: string
          workspace?: Json
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          apps: string[]
          color: string
          cover: string
          created_at: string
          description: string
          id: string
          name: string
          notes: string
          status: Database["public"]["Enums"]["project_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          apps?: string[]
          color?: string
          cover?: string
          created_at?: string
          description?: string
          id?: string
          name: string
          notes?: string
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          apps?: string[]
          color?: string
          cover?: string
          created_at?: string
          description?: string
          id?: string
          name?: string
          notes?: string
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          code: string
          commission_cents: number
          commission_paid_at: string | null
          created_at: string
          id: string
          invitee_credits_awarded: number
          referred_user_id: string
          referrer_credits_awarded: number
          referrer_id: string
          rewarded_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          code: string
          commission_cents?: number
          commission_paid_at?: string | null
          created_at?: string
          id?: string
          invitee_credits_awarded?: number
          referred_user_id: string
          referrer_credits_awarded?: number
          referrer_id: string
          rewarded_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          code?: string
          commission_cents?: number
          commission_paid_at?: string | null
          created_at?: string
          id?: string
          invitee_credits_awarded?: number
          referred_user_id?: string
          referrer_credits_awarded?: number
          referrer_id?: string
          rewarded_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      reward_settings: {
        Row: {
          commission_percent: number
          commission_scope: string
          created_at: string
          id: boolean
          invitee_credits: number
          referrer_credits: number
          updated_at: string
        }
        Insert: {
          commission_percent?: number
          commission_scope?: string
          created_at?: string
          id?: boolean
          invitee_credits?: number
          referrer_credits?: number
          updated_at?: string
        }
        Update: {
          commission_percent?: number
          commission_scope?: string
          created_at?: string
          id?: boolean
          invitee_credits?: number
          referrer_credits?: number
          updated_at?: string
        }
        Relationships: []
      }
      schedules: {
        Row: {
          asset_id: string | null
          color: string
          created_at: string
          id: string
          mission_id: string | null
          notes: string
          project_id: string | null
          scheduled_at: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          asset_id?: string | null
          color?: string
          created_at?: string
          id?: string
          mission_id?: string | null
          notes?: string
          project_id?: string | null
          scheduled_at: string
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          asset_id?: string | null
          color?: string
          created_at?: string
          id?: string
          mission_id?: string | null
          notes?: string
          project_id?: string | null
          scheduled_at?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount_cents: number
          billing_interval: string
          created_at: string
          currency: string
          current_period_end: string | null
          id: string
          plan: string
          provider: string | null
          provider_reference: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents?: number
          billing_interval?: string
          created_at?: string
          currency?: string
          current_period_end?: string | null
          id?: string
          plan?: string
          provider?: string | null
          provider_reference?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          billing_interval?: string
          created_at?: string
          currency?: string
          current_period_end?: string | null
          id?: string
          plan?: string
          provider?: string | null
          provider_reference?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      gen_referral_code: { Args: never; Returns: string }
      referral_code_owner: { Args: { _code: string }; Returns: string }
    }
    Enums: {
      asset_kind:
        | "script"
        | "title"
        | "description"
        | "caption"
        | "hashtag"
        | "cta"
        | "media"
      asset_status: "draft" | "approved"
      mission_status:
        | "planning"
        | "awaiting_approval"
        | "running"
        | "completed"
        | "cancelled"
        | "failed"
      notification_category:
        | "mission_completed"
        | "mission_failed"
        | "approval_required"
        | "integration_error"
        | "system_update"
        | "upload_completed"
        | "generation_completed"
        | "schedule_created"
        | "account_connected"
      project_status: "active" | "paused" | "archived" | "completed"
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
    Enums: {
      asset_kind: [
        "script",
        "title",
        "description",
        "caption",
        "hashtag",
        "cta",
        "media",
      ],
      asset_status: ["draft", "approved"],
      mission_status: [
        "planning",
        "awaiting_approval",
        "running",
        "completed",
        "cancelled",
        "failed",
      ],
      notification_category: [
        "mission_completed",
        "mission_failed",
        "approval_required",
        "integration_error",
        "system_update",
        "upload_completed",
        "generation_completed",
        "schedule_created",
        "account_connected",
      ],
      project_status: ["active", "paused", "archived", "completed"],
    },
  },
} as const
