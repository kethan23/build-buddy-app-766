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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      ai_chat_sessions: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          session_data: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          session_data?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          session_data?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_date: string
          booking_id: string | null
          created_at: string | null
          doctor_id: string | null
          duration_minutes: number | null
          hospital_id: string
          id: string
          notes: string | null
          patient_id: string
          status: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_date: string
          booking_id?: string | null
          created_at?: string | null
          doctor_id?: string | null
          duration_minutes?: number | null
          hospital_id: string
          id?: string
          notes?: string | null
          patient_id: string
          status?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string
          booking_id?: string | null
          created_at?: string | null
          doctor_id?: string | null
          duration_minutes?: number | null
          hospital_id?: string
          id?: string
          notes?: string | null
          patient_id?: string
          status?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          appointment_date: string | null
          created_at: string | null
          currency: string | null
          hospital_id: string | null
          id: string
          inquiry_id: string | null
          notes: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          total_amount: number | null
          treatment_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          appointment_date?: string | null
          created_at?: string | null
          currency?: string | null
          hospital_id?: string | null
          id?: string
          inquiry_id?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_amount?: number | null
          treatment_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          appointment_date?: string | null
          created_at?: string | null
          currency?: string | null
          hospital_id?: string | null
          id?: string
          inquiry_id?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_amount?: number | null
          treatment_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          hospital_id: string
          id: string
          inquiry_id: string | null
          last_message_at: string | null
          patient_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          hospital_id: string
          id?: string
          inquiry_id?: string | null
          last_message_at?: string | null
          patient_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          hospital_id?: string
          id?: string
          inquiry_id?: string | null
          last_message_at?: string | null
          patient_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          bio: string | null
          consultation_fee: number | null
          created_at: string | null
          experience_years: number | null
          hospital_id: string
          id: string
          is_available: boolean | null
          languages: Json | null
          name: string
          photo_url: string | null
          qualification: string | null
          specialty: string
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          consultation_fee?: number | null
          created_at?: string | null
          experience_years?: number | null
          hospital_id: string
          id?: string
          is_available?: boolean | null
          languages?: Json | null
          name: string
          photo_url?: string | null
          qualification?: string | null
          specialty: string
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          consultation_fee?: number | null
          created_at?: string | null
          experience_years?: number | null
          hospital_id?: string
          id?: string
          is_available?: boolean | null
          languages?: Json | null
          name?: string
          photo_url?: string | null
          qualification?: string | null
          specialty?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string | null
          description: string | null
          document_type: string
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          document_type: string
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          document_type?: string
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      hospital_certifications: {
        Row: {
          certification_name: string
          created_at: string | null
          document_url: string | null
          expiry_date: string | null
          hospital_id: string
          id: string
          issue_date: string | null
          issuing_body: string | null
        }
        Insert: {
          certification_name: string
          created_at?: string | null
          document_url?: string | null
          expiry_date?: string | null
          hospital_id: string
          id?: string
          issue_date?: string | null
          issuing_body?: string | null
        }
        Update: {
          certification_name?: string
          created_at?: string | null
          document_url?: string | null
          expiry_date?: string | null
          hospital_id?: string
          id?: string
          issue_date?: string | null
          issuing_body?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hospital_certifications_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      hospital_gallery: {
        Row: {
          caption: string | null
          created_at: string | null
          display_order: number | null
          hospital_id: string
          id: string
          image_url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          display_order?: number | null
          hospital_id: string
          id?: string
          image_url: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          display_order?: number | null
          hospital_id?: string
          id?: string
          image_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "hospital_gallery_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      hospital_specialties: {
        Row: {
          created_at: string | null
          description: string | null
          hospital_id: string
          id: string
          specialty_name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          hospital_id: string
          id?: string
          specialty_name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          hospital_id?: string
          id?: string
          specialty_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "hospital_specialties_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      hospitals: {
        Row: {
          address: string | null
          bed_capacity: number | null
          city: string | null
          country: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          email: string | null
          established_year: number | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          phone: string | null
          postal_code: string | null
          rating: number | null
          state: string | null
          total_reviews: number | null
          updated_at: string | null
          user_id: string
          verification_status: string | null
          website: string | null
          working_hours: Json | null
        }
        Insert: {
          address?: string | null
          bed_capacity?: number | null
          city?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          established_year?: number | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          phone?: string | null
          postal_code?: string | null
          rating?: number | null
          state?: string | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id: string
          verification_status?: string | null
          website?: string | null
          working_hours?: Json | null
        }
        Update: {
          address?: string | null
          bed_capacity?: number | null
          city?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          established_year?: number | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          postal_code?: string | null
          rating?: number | null
          state?: string | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string
          verification_status?: string | null
          website?: string | null
          working_hours?: Json | null
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          created_at: string | null
          hospital_id: string | null
          id: string
          message: string
          preferred_date: string | null
          status: Database["public"]["Enums"]["inquiry_status"] | null
          treatment_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          hospital_id?: string | null
          id?: string
          message: string
          preferred_date?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"] | null
          treatment_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          hospital_id?: string | null
          id?: string
          message?: string
          preferred_date?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"] | null
          treatment_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiry_messages: {
        Row: {
          attachment_url: string | null
          created_at: string | null
          id: string
          inquiry_id: string
          message: string
          sender_id: string
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string | null
          id?: string
          inquiry_id: string
          message: string
          sender_id: string
        }
        Update: {
          attachment_url?: string | null
          created_at?: string | null
          id?: string
          inquiry_id?: string
          message?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiry_messages_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_history: {
        Row: {
          allergies: string | null
          condition: string
          created_at: string | null
          diagnosis_date: string | null
          id: string
          medications: string | null
          notes: string | null
          treatment: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allergies?: string | null
          condition: string
          created_at?: string | null
          diagnosis_date?: string | null
          id?: string
          medications?: string | null
          notes?: string | null
          treatment?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allergies?: string | null
          condition?: string
          created_at?: string | null
          diagnosis_date?: string | null
          id?: string
          medications?: string | null
          notes?: string | null
          treatment?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          is_read: boolean | null
          message_type: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          related_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string | null
          currency: string | null
          id: string
          payment_date: string | null
          payment_method: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_date?: string | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_date?: string | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          full_name: string
          gender: string | null
          id: string
          nationality: string | null
          phone: string | null
          profile_image_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          full_name: string
          gender?: string | null
          id?: string
          nationality?: string | null
          phone?: string | null
          profile_image_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          nationality?: string | null
          phone?: string | null
          profile_image_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      saved_searches: {
        Row: {
          created_at: string | null
          id: string
          search_criteria: Json
          search_name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          search_criteria: Json
          search_name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          search_criteria?: Json
          search_name?: string
          user_id?: string
        }
        Relationships: []
      }
      search_analytics: {
        Row: {
          clicked_result_id: string | null
          created_at: string | null
          id: string
          results_count: number | null
          search_filters: Json | null
          search_query: string
          user_id: string | null
        }
        Insert: {
          clicked_result_id?: string | null
          created_at?: string | null
          id?: string
          results_count?: number | null
          search_filters?: Json | null
          search_query: string
          user_id?: string | null
        }
        Update: {
          clicked_result_id?: string | null
          created_at?: string | null
          id?: string
          results_count?: number | null
          search_filters?: Json | null
          search_query?: string
          user_id?: string | null
        }
        Relationships: []
      }
      treatment_packages: {
        Row: {
          category: string
          created_at: string | null
          currency: string | null
          description: string | null
          duration_days: number | null
          exclusions: Json | null
          hospital_id: string
          id: string
          inclusions: Json | null
          is_active: boolean | null
          name: string
          popularity_score: number | null
          price: number
          recovery_days: number | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          duration_days?: number | null
          exclusions?: Json | null
          hospital_id: string
          id?: string
          inclusions?: Json | null
          is_active?: boolean | null
          name: string
          popularity_score?: number | null
          price: number
          recovery_days?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          duration_days?: number | null
          exclusions?: Json | null
          hospital_id?: string
          id?: string
          inclusions?: Json | null
          is_active?: boolean | null
          name?: string
          popularity_score?: number | null
          price?: number
          recovery_days?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "treatment_packages_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      video_consultations: {
        Row: {
          appointment_id: string
          created_at: string | null
          duration_minutes: number | null
          end_time: string | null
          id: string
          notes: string | null
          recording_url: string | null
          room_id: string
          start_time: string | null
          status: string | null
        }
        Insert: {
          appointment_id: string
          created_at?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          notes?: string | null
          recording_url?: string | null
          room_id: string
          start_time?: string | null
          status?: string | null
        }
        Update: {
          appointment_id?: string
          created_at?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          notes?: string | null
          recording_url?: string | null
          room_id?: string
          start_time?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_consultations_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "patient" | "hospital" | "admin"
      booking_status:
        | "pending"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
      inquiry_status: "pending" | "responded" | "accepted" | "rejected"
      payment_status: "pending" | "completed" | "failed" | "refunded"
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
      app_role: ["patient", "hospital", "admin"],
      booking_status: [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
      ],
      inquiry_status: ["pending", "responded", "accepted", "rejected"],
      payment_status: ["pending", "completed", "failed", "refunded"],
    },
  },
} as const
