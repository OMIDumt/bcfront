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
      accountability_checkins: {
        Row: {
          action_item_id: string | null
          created_at: string
          id: string
          note: string | null
          status: string
          user_id: string
        }
        Insert: {
          action_item_id?: string | null
          created_at?: string
          id?: string
          note?: string | null
          status?: string
          user_id: string
        }
        Update: {
          action_item_id?: string | null
          created_at?: string
          id?: string
          note?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      action_items: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          horizon: string
          id: string
          owner: string | null
          plan_id: string
          priority: number
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          horizon?: string
          id?: string
          owner?: string | null
          plan_id: string
          priority?: number
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          horizon?: string
          id?: string
          owner?: string | null
          plan_id?: string
          priority?: number
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_items_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "action_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      action_plans: {
        Row: {
          challenge_id: string | null
          created_at: string
          horizon: string
          id: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id?: string | null
          created_at?: string
          horizon?: string
          id?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string | null
          created_at?: string
          horizon?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      assessments: {
        Row: {
          answers: Json
          completed: boolean | null
          created_at: string
          id: string
          scores: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          completed?: boolean | null
          created_at?: string
          id?: string
          scores?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          completed?: boolean | null
          created_at?: string
          id?: string
          scores?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      board_sessions: {
        Row: {
          challenge_id: string | null
          consensus: string | null
          created_at: string
          id: string
          immediate_actions: Json | null
          major_risks: Json | null
          perspectives: Json | null
          top_recommendation: string | null
          topic: string
          user_id: string
        }
        Insert: {
          challenge_id?: string | null
          consensus?: string | null
          created_at?: string
          id?: string
          immediate_actions?: Json | null
          major_risks?: Json | null
          perspectives?: Json | null
          top_recommendation?: string | null
          topic: string
          user_id: string
        }
        Update: {
          challenge_id?: string | null
          consensus?: string | null
          created_at?: string
          id?: string
          immediate_actions?: Json | null
          major_risks?: Json | null
          perspectives?: Json | null
          top_recommendation?: string | null
          topic?: string
          user_id?: string
        }
        Relationships: []
      }
      challenges: {
        Row: {
          category: string | null
          clarity_score: number
          clarity_trend: string
          created_at: string
          description: string | null
          diagnosis: Json | null
          executive_summary: string | null
          id: string
          impact: string | null
          phase: string
          progress: number
          root_causes: Json | null
          secondary_challenges: Json | null
          status: string
          title: string
          total_steps: number
          updated_at: string
          urgency: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          clarity_score?: number
          clarity_trend?: string
          created_at?: string
          description?: string | null
          diagnosis?: Json | null
          executive_summary?: string | null
          id?: string
          impact?: string | null
          phase?: string
          progress?: number
          root_causes?: Json | null
          secondary_challenges?: Json | null
          status?: string
          title: string
          total_steps?: number
          updated_at?: string
          urgency?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          clarity_score?: number
          clarity_trend?: string
          created_at?: string
          description?: string | null
          diagnosis?: Json | null
          executive_summary?: string | null
          id?: string
          impact?: string | null
          phase?: string
          progress?: number
          root_causes?: Json | null
          secondary_challenges?: Json | null
          status?: string
          title?: string
          total_steps?: number
          updated_at?: string
          urgency?: string | null
          user_id?: string
        }
        Relationships: []
      }
      decisions: {
        Row: {
          challenge_id: string | null
          chosen_option: string | null
          context: string | null
          created_at: string
          criteria: Json | null
          id: string
          options: Json | null
          outcome: string | null
          recommendation: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id?: string | null
          chosen_option?: string | null
          context?: string | null
          created_at?: string
          criteria?: Json | null
          id?: string
          options?: Json | null
          outcome?: string | null
          recommendation?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string | null
          chosen_option?: string | null
          context?: string | null
          created_at?: string
          criteria?: Json | null
          id?: string
          options?: Json | null
          outcome?: string | null
          recommendation?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      experiences: {
        Row: {
          body: string | null
          created_at: string
          id: string
          tags: string[] | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          tags?: string[] | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          tags?: string[] | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      key_results: {
        Row: {
          created_at: string
          current: number
          id: string
          last_check_in: string | null
          name: string
          okr_id: string
          target: number
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current?: number
          id?: string
          last_check_in?: string | null
          name: string
          okr_id: string
          target?: number
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current?: number
          id?: string
          last_check_in?: string | null
          name?: string
          okr_id?: string
          target?: number
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "key_results_okr_id_fkey"
            columns: ["okr_id"]
            isOneToOne: false
            referencedRelation: "okrs"
            referencedColumns: ["id"]
          },
        ]
      }
      kpis: {
        Row: {
          created_at: string
          current: number
          id: string
          name: string
          target: number
          unit: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          current?: number
          id?: string
          name: string
          target?: number
          unit?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          current?: number
          id?: string
          name?: string
          target?: number
          unit?: string | null
          user_id?: string
        }
        Relationships: []
      }
      message_feedback: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          message_id: string
          rating: number
          thread_id: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          message_id: string
          rating: number
          thread_id: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          message_id?: string
          rating?: number
          thread_id?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          created_at: string
          id: string
          parts: Json
          role: string
          thread_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          parts: Json
          role: string
          thread_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          parts?: Json
          role?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "threads"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      okrs: {
        Row: {
          challenge_id: string | null
          created_at: string
          id: string
          objective: string
          progress: number
          quarter: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id?: string | null
          created_at?: string
          id?: string
          objective: string
          progress?: number
          quarter?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string | null
          created_at?: string
          id?: string
          objective?: string
          progress?: number
          quarter?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          coach_choice: string | null
          created_at: string
          id: string
          language: string | null
          name: string | null
          onboarded: boolean | null
          plan: string | null
          role_title: string | null
          updated_at: string
        }
        Insert: {
          coach_choice?: string | null
          created_at?: string
          id: string
          language?: string | null
          name?: string | null
          onboarded?: boolean | null
          plan?: string | null
          role_title?: string | null
          updated_at?: string
        }
        Update: {
          coach_choice?: string | null
          created_at?: string
          id?: string
          language?: string | null
          name?: string | null
          onboarded?: boolean | null
          plan?: string | null
          role_title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      risks: {
        Row: {
          challenge_id: string | null
          created_at: string
          description: string | null
          id: string
          impact: string
          likelihood: string
          mitigation: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          impact?: string
          likelihood?: string
          mitigation?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          impact?: string
          likelihood?: string
          mitigation?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      threads: {
        Row: {
          archived: boolean
          challenge_id: string | null
          coach_id: string
          created_at: string
          id: string
          phase: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          challenge_id?: string | null
          coach_id?: string
          created_at?: string
          id?: string
          phase?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archived?: boolean
          challenge_id?: string | null
          coach_id?: string
          created_at?: string
          id?: string
          phase?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weekly_reviews: {
        Row: {
          blockers: Json | null
          created_at: string
          id: string
          next_priorities: Json | null
          score: number
          summary: string | null
          user_id: string
          week_start: string
          wins: Json | null
        }
        Insert: {
          blockers?: Json | null
          created_at?: string
          id?: string
          next_priorities?: Json | null
          score?: number
          summary?: string | null
          user_id: string
          week_start?: string
          wins?: Json | null
        }
        Update: {
          blockers?: Json | null
          created_at?: string
          id?: string
          next_priorities?: Json | null
          score?: number
          summary?: string | null
          user_id?: string
          week_start?: string
          wins?: Json | null
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
