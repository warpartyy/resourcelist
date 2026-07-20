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
  public: {
    Tables: {
      impact_log: {
        Row: {
          activity_key: string
          activity_type: string
          admin_id: string
          created_at: string
          id: string
          metadata: Json
          points: number
          resource_id: string | null
          source: string | null
        }
        Insert: {
          activity_key: string
          activity_type: string
          admin_id: string
          created_at?: string
          id?: string
          metadata?: Json
          points?: number
          resource_id?: string | null
          source?: string | null
        }
        Update: {
          activity_key?: string
          activity_type?: string
          admin_id?: string
          created_at?: string
          id?: string
          metadata?: Json
          points?: number
          resource_id?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "impact_log_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "impact_log_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_improvement_overrides: {
        Row: {
          created_at: string
          created_by: string
          id: string
          improvement_key: string
          resource_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          improvement_key: string
          resource_id: string
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          improvement_key?: string
          resource_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_improvement_overrides_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_improvement_overrides_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          address: string | null
          audience: string | null
          city: string | null
          contact_info: string | null
          date: string
          description: string | null
          end_time: string | null
          event_type: string | null
          flyer_url: string | null
          id: string
          is_free: boolean | null
          is_tribal: boolean | null
          link: string | null
          location_name: string | null
          organization: string | null
          start_time: string | null
          state: string | null
          status: string | null
          submitted_at: string | null
          title: string
          tribe: string | null
        }
        Insert: {
          address?: string | null
          audience?: string | null
          city?: string | null
          contact_info?: string | null
          date: string
          description?: string | null
          end_time?: string | null
          event_type?: string | null
          flyer_url?: string | null
          id?: string
          is_free?: boolean | null
          is_tribal?: boolean | null
          link?: string | null
          location_name?: string | null
          organization?: string | null
          start_time?: string | null
          state?: string | null
          status?: string | null
          submitted_at?: string | null
          title: string
          tribe?: string | null
        }
        Update: {
          address?: string | null
          audience?: string | null
          city?: string | null
          contact_info?: string | null
          date?: string
          description?: string | null
          end_time?: string | null
          event_type?: string | null
          flyer_url?: string | null
          id?: string
          is_free?: boolean | null
          is_tribal?: boolean | null
          link?: string | null
          location_name?: string | null
          organization?: string | null
          start_time?: string | null
          state?: string | null
          status?: string | null
          submitted_at?: string | null
          title?: string
          tribe?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          admin_notes: string | null
          contact_email: string | null
          content: string
          created_at: string | null
          id: string
          responded_at: string | null
          status: string | null
        }
        Insert: {
          admin_notes?: string | null
          contact_email?: string | null
          content: string
          created_at?: string | null
          id?: string
          responded_at?: string | null
          status?: string | null
        }
        Update: {
          admin_notes?: string | null
          contact_email?: string | null
          content?: string
          created_at?: string | null
          id?: string
          responded_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          comment_id: string | null
          created_at: string | null
          id: string
          message: string | null
          read: boolean | null
          resource_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          read?: boolean | null
          resource_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          read?: boolean | null
          resource_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          role: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          role?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          role?: string | null
        }
        Relationships: []
      }
      resource_comments: {
        Row: {
          comment: string
          created_at: string | null
          created_by: string | null
          created_by_email: string | null
          id: string
          resource_id: string | null
        }
        Insert: {
          comment: string
          created_at?: string | null
          created_by?: string | null
          created_by_email?: string | null
          id?: string
          resource_id?: string | null
        }
        Update: {
          comment?: string
          created_at?: string | null
          created_by?: string | null
          created_by_email?: string | null
          id?: string
          resource_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_comments_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_locations: {
        Row: {
          address: string | null
          city: string | null
          counties_served: string[] | null
          created_at: string | null
          email: string | null
          id: string
          is_primary: boolean | null
          location_name: string | null
          phone: string | null
          resource_id: string
          state: string | null
          updated_at: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          counties_served?: string[] | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean | null
          location_name?: string | null
          phone?: string | null
          resource_id: string
          state?: string | null
          updated_at?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          counties_served?: string[] | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean | null
          location_name?: string | null
          phone?: string | null
          resource_id?: string
          state?: string | null
          updated_at?: string | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_locations_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_submissions: {
        Row: {
          id: string
          message: string | null
          resource_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          submitted_at: string | null
          suggested_changes: Json | null
          type: string
        }
        Insert: {
          id?: string
          message?: string | null
          resource_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_at?: string | null
          suggested_changes?: Json | null
          type: string
        }
        Update: {
          id?: string
          message?: string | null
          resource_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_at?: string | null
          suggested_changes?: Json | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_submissions_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          address: string | null
          admin_notes: string | null
          application_link: string | null
          city: string | null
          counties_served: string[] | null
          description: string | null
          eligibility: string | null
          email: string | null
          id: string
          is_tribal: boolean | null
          last_edited_at: string | null
          last_edited_by: string | null
          last_edited_email: string | null
          last_edited_name: string | null
          last_verified: string | null
          organization: string | null
          parent_categories: string[] | null
          phone: string | null
          rejected_at: string | null
          services: string[] | null
          slug: string
          source_submission_id: string | null
          state: string | null
          status: string | null
          subcategories: string[] | null
          submitted_at: string | null
          tags: string[] | null
          tribal_eligibility: string | null
          tribe: string | null
          website: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          admin_notes?: string | null
          application_link?: string | null
          city?: string | null
          counties_served?: string[] | null
          description?: string | null
          eligibility?: string | null
          email?: string | null
          id?: string
          is_tribal?: boolean | null
          last_edited_at?: string | null
          last_edited_by?: string | null
          last_edited_email?: string | null
          last_edited_name?: string | null
          last_verified?: string | null
          organization?: string | null
          parent_categories?: string[] | null
          phone?: string | null
          rejected_at?: string | null
          services?: string[] | null
          slug: string
          source_submission_id?: string | null
          state?: string | null
          status?: string | null
          subcategories?: string[] | null
          submitted_at?: string | null
          tags?: string[] | null
          tribal_eligibility?: string | null
          tribe?: string | null
          website?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          admin_notes?: string | null
          application_link?: string | null
          city?: string | null
          counties_served?: string[] | null
          description?: string | null
          eligibility?: string | null
          email?: string | null
          id?: string
          is_tribal?: boolean | null
          last_edited_at?: string | null
          last_edited_by?: string | null
          last_edited_email?: string | null
          last_edited_name?: string | null
          last_verified?: string | null
          organization?: string | null
          parent_categories?: string[] | null
          phone?: string | null
          rejected_at?: string | null
          services?: string[] | null
          slug?: string
          source_submission_id?: string | null
          state?: string | null
          status?: string | null
          subcategories?: string[] | null
          submitted_at?: string | null
          tags?: string[] | null
          tribal_eligibility?: string | null
          tribe?: string | null
          website?: string | null
          zip?: string | null
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
