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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      cohorts: {
        Row: {
          application_link_url: string | null
          compensation_usd: number
          created_at: string
          duration_text: string | null
          eligibility_notes: string | null
          ends_on: string | null
          id: string
          image_id: string | null
          is_current: boolean
          is_waitlist: boolean
          slug: string
          spots_available: number | null
          starts_on: string
          study_description: string | null
          study_title: string
          updated_at: string
        }
        Insert: {
          application_link_url?: string | null
          compensation_usd: number
          created_at?: string
          duration_text?: string | null
          eligibility_notes?: string | null
          ends_on?: string | null
          id?: string
          image_id?: string | null
          is_current?: boolean
          is_waitlist?: boolean
          slug: string
          spots_available?: number | null
          starts_on: string
          study_description?: string | null
          study_title: string
          updated_at?: string
        }
        Update: {
          application_link_url?: string | null
          compensation_usd?: number
          created_at?: string
          duration_text?: string | null
          eligibility_notes?: string | null
          ends_on?: string | null
          id?: string
          image_id?: string | null
          is_current?: boolean
          is_waitlist?: boolean
          slug?: string
          spots_available?: number | null
          starts_on?: string
          study_description?: string | null
          study_title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cohorts_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
        ]
      }
      cron_run_log: {
        Row: {
          error: string | null
          finished_at: string | null
          id: string
          job_name: string
          rows_affected: number | null
          started_at: string
          status: string | null
        }
        Insert: {
          error?: string | null
          finished_at?: string | null
          id?: string
          job_name: string
          rows_affected?: number | null
          started_at?: string
          status?: string | null
        }
        Update: {
          error?: string | null
          finished_at?: string | null
          id?: string
          job_name?: string
          rows_affected?: number | null
          started_at?: string
          status?: string | null
        }
        Relationships: []
      }
      faq_items: {
        Row: {
          answer: string
          id: string
          is_visible: boolean
          position: number
          question: string
        }
        Insert: {
          answer: string
          id?: string
          is_visible?: boolean
          position?: number
          question: string
        }
        Update: {
          answer?: string
          id?: string
          is_visible?: boolean
          position?: number
          question?: string
        }
        Relationships: []
      }
      flyer_codes: {
        Row: {
          borough: Database["public"]["Enums"]["nyc_borough"]
          campaign_label: string | null
          code: string
          created_at: string
          is_active: boolean
        }
        Insert: {
          borough: Database["public"]["Enums"]["nyc_borough"]
          campaign_label?: string | null
          code: string
          created_at?: string
          is_active?: boolean
        }
        Update: {
          borough?: Database["public"]["Enums"]["nyc_borough"]
          campaign_label?: string | null
          code?: string
          created_at?: string
          is_active?: boolean
        }
        Relationships: []
      }
      fx_rates: {
        Row: {
          base_currency: string
          fetched_at: string
          rate: number
          target_currency: string
        }
        Insert: {
          base_currency: string
          fetched_at?: string
          rate: number
          target_currency: string
        }
        Update: {
          base_currency?: string
          fetched_at?: string
          rate?: number
          target_currency?: string
        }
        Relationships: []
      }
      how_it_works_steps: {
        Row: {
          description: string | null
          icon: string | null
          id: string
          is_visible: boolean
          position: number
          step_number: number
          title: string
        }
        Insert: {
          description?: string | null
          icon?: string | null
          id?: string
          is_visible?: boolean
          position?: number
          step_number: number
          title: string
        }
        Update: {
          description?: string | null
          icon?: string | null
          id?: string
          is_visible?: boolean
          position?: number
          step_number?: number
          title?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          age: number | null
          application_link_sent_at: string | null
          availability: Database["public"]["Enums"]["lead_availability"] | null
          cohort_id: string | null
          created_at: string
          disqualify_reason: string | null
          email: string
          english_comfort: Database["public"]["Enums"]["english_comfort"] | null
          full_name: string
          id: string
          lead_source: Database["public"]["Enums"]["lead_source"]
          notes: string | null
          payout_notes: string | null
          phone: string
          referral_details: string | null
          referral_source: Database["public"]["Enums"]["referral_source"] | null
          sms_consent: boolean
          sms_consent_at: string | null
          source_scan_id: string | null
          status: Database["public"]["Enums"]["lead_status"]
        }
        Insert: {
          age?: number | null
          application_link_sent_at?: string | null
          availability?: Database["public"]["Enums"]["lead_availability"] | null
          cohort_id?: string | null
          created_at?: string
          disqualify_reason?: string | null
          email: string
          english_comfort?:
            | Database["public"]["Enums"]["english_comfort"]
            | null
          full_name: string
          id?: string
          lead_source: Database["public"]["Enums"]["lead_source"]
          notes?: string | null
          payout_notes?: string | null
          phone: string
          referral_details?: string | null
          referral_source?:
            | Database["public"]["Enums"]["referral_source"]
            | null
          sms_consent?: boolean
          sms_consent_at?: string | null
          source_scan_id?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
        }
        Update: {
          age?: number | null
          application_link_sent_at?: string | null
          availability?: Database["public"]["Enums"]["lead_availability"] | null
          cohort_id?: string | null
          created_at?: string
          disqualify_reason?: string | null
          email?: string
          english_comfort?:
            | Database["public"]["Enums"]["english_comfort"]
            | null
          full_name?: string
          id?: string
          lead_source?: Database["public"]["Enums"]["lead_source"]
          notes?: string | null
          payout_notes?: string | null
          phone?: string
          referral_details?: string | null
          referral_source?:
            | Database["public"]["Enums"]["referral_source"]
            | null
          sms_consent?: boolean
          sms_consent_at?: string | null
          source_scan_id?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
        }
        Relationships: [
          {
            foreignKeyName: "leads_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_source_scan_id_fkey"
            columns: ["source_scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          alt_text: string | null
          created_at: string
          height: number | null
          id: string
          mime_type: string | null
          size_bytes: number | null
          storage_bucket: string
          storage_path: string
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          height?: number | null
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_bucket?: string
          storage_path: string
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          height?: number | null
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_bucket?: string
          storage_path?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: []
      }
      notification_log: {
        Row: {
          channel: Database["public"]["Enums"]["notification_channel"]
          error_message: string | null
          id: string
          lead_id: string
          provider_message_id: string | null
          sent_at: string
          status: Database["public"]["Enums"]["notification_status"]
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          channel: Database["public"]["Enums"]["notification_channel"]
          error_message?: string | null
          id?: string
          lead_id: string
          provider_message_id?: string | null
          sent_at?: string
          status: Database["public"]["Enums"]["notification_status"]
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          error_message?: string | null
          id?: string
          lead_id?: string
          provider_message_id?: string | null
          sent_at?: string
          status?: Database["public"]["Enums"]["notification_status"]
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notification_log_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      page_sections: {
        Row: {
          body: string | null
          extra: Json
          id: string
          image_id: string | null
          is_visible: boolean
          section_key: string
          title: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          body?: string | null
          extra?: Json
          id?: string
          image_id?: string | null
          is_visible?: boolean
          section_key: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          body?: string | null
          extra?: Json
          id?: string
          image_id?: string | null
          is_visible?: boolean
          section_key?: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "page_sections_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
        ]
      }
      scans: {
        Row: {
          borough: Database["public"]["Enums"]["nyc_borough"]
          code: string | null
          converted: boolean | null
          id: string
          lead_id: string | null
          referrer: string | null
          scanned_at: string
          user_agent: string | null
        }
        Insert: {
          borough: Database["public"]["Enums"]["nyc_borough"]
          code?: string | null
          converted?: boolean | null
          id?: string
          lead_id?: string | null
          referrer?: string | null
          scanned_at?: string
          user_agent?: string | null
        }
        Update: {
          borough?: Database["public"]["Enums"]["nyc_borough"]
          code?: string | null
          converted?: boolean | null
          id?: string
          lead_id?: string | null
          referrer?: string | null
          scanned_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scans_code_fkey"
            columns: ["code"]
            isOneToOne: false
            referencedRelation: "flyer_codes"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "scans_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          default_meta_description: string | null
          default_meta_title: string | null
          favicon_media_id: string | null
          font_choice: string | null
          id: boolean
          logo_media_id: string | null
          og_image_id: string | null
          primary_color_hex: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          default_meta_description?: string | null
          default_meta_title?: string | null
          favicon_media_id?: string | null
          font_choice?: string | null
          id?: boolean
          logo_media_id?: string | null
          og_image_id?: string | null
          primary_color_hex?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          default_meta_description?: string | null
          default_meta_title?: string | null
          favicon_media_id?: string | null
          font_choice?: string | null
          id?: boolean
          logo_media_id?: string | null
          og_image_id?: string | null
          primary_color_hex?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_settings_favicon_media_id_fkey"
            columns: ["favicon_media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_settings_logo_media_id_fkey"
            columns: ["logo_media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_settings_og_image_id_fkey"
            columns: ["og_image_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
        ]
      }
      social_links: {
        Row: {
          id: string
          is_visible: boolean
          platform: string
          position: number
          url: string
        }
        Insert: {
          id?: string
          is_visible?: boolean
          platform: string
          position?: number
          url: string
        }
        Update: {
          id?: string
          is_visible?: boolean
          platform?: string
          position?: number
          url?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["staff_role"]
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["staff_role"]
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["staff_role"]
        }
        Relationships: []
      }
      stat_items: {
        Row: {
          icon: string | null
          id: string
          is_visible: boolean
          label: string
          position: number
          value: string
        }
        Insert: {
          icon?: string | null
          id?: string
          is_visible?: boolean
          label: string
          position?: number
          value: string
        }
        Update: {
          icon?: string | null
          id?: string
          is_visible?: boolean
          label?: string
          position?: number
          value?: string
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
      english_comfort: "yes" | "no" | "somewhat"
      lead_availability: "first_half" | "second_half"
      lead_source: "study_application" | "waitlist"
      lead_status:
        | "new"
        | "qualified"
        | "waitlisted"
        | "disqualified"
        | "application_sent"
        | "completed"
        | "no_show"
      notification_channel: "sms" | "email"
      notification_status: "sent" | "failed" | "skipped"
      notification_type:
        | "immediate"
        | "reminder"
        | "application_link"
        | "delivery"
        | "no_month_nudge"
        | "waitlist_confirmation"
      nyc_borough:
        | "bronx"
        | "brooklyn"
        | "manhattan"
        | "queens"
        | "staten_island"
      referral_source:
        | "friend"
        | "instagram"
        | "tiktok"
        | "linkedin"
        | "flyer"
        | "other"
      staff_role: "owner" | "admin" | "staff"
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
      english_comfort: ["yes", "no", "somewhat"],
      lead_availability: ["first_half", "second_half"],
      lead_source: ["study_application", "waitlist"],
      lead_status: [
        "new",
        "qualified",
        "waitlisted",
        "disqualified",
        "application_sent",
        "completed",
        "no_show",
      ],
      notification_channel: ["sms", "email"],
      notification_status: ["sent", "failed", "skipped"],
      notification_type: [
        "immediate",
        "reminder",
        "application_link",
        "delivery",
        "no_month_nudge",
        "waitlist_confirmation",
      ],
      nyc_borough: [
        "bronx",
        "brooklyn",
        "manhattan",
        "queens",
        "staten_island",
      ],
      referral_source: [
        "friend",
        "instagram",
        "tiktok",
        "linkedin",
        "flyer",
        "other",
      ],
      staff_role: ["owner", "admin", "staff"],
    },
  },
} as const
