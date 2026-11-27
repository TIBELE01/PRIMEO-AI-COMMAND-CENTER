// Fichier GÉNÉRÉ à partir du schéma Supabase — ne pas modifier à la main.
// Régénérer après chaque migration (voir packages/integrations/supabase/README.md).

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
    PostgrestVersion: "17.1"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          actor_agent_id: string | null
          actor_type: Database["public"]["Enums"]["actor_type"]
          actor_user_id: string | null
          approval_request_id: string | null
          authorization_level: number | null
          capability_id: string | null
          details: Json
          entity_id: string | null
          entity_type: string | null
          id: number
          ip_address: unknown
          mission_id: string | null
          occurred_at: string
          outcome: Database["public"]["Enums"]["activity_outcome"]
          previous_hash: string | null
          request_id: string | null
          row_hash: string
        }
        Insert: {
          action: string
          actor_agent_id?: string | null
          actor_type: Database["public"]["Enums"]["actor_type"]
          actor_user_id?: string | null
          approval_request_id?: string | null
          authorization_level?: number | null
          capability_id?: string | null
          details?: Json
          entity_id?: string | null
          entity_type?: string | null
          id?: never
          ip_address?: unknown
          mission_id?: string | null
          occurred_at?: string
          outcome: Database["public"]["Enums"]["activity_outcome"]
          previous_hash?: string | null
          request_id?: string | null
          row_hash: string
        }
        Update: {
          action?: string
          actor_agent_id?: string | null
          actor_type?: Database["public"]["Enums"]["actor_type"]
          actor_user_id?: string | null
          approval_request_id?: string | null
          authorization_level?: number | null
          capability_id?: string | null
          details?: Json
          entity_id?: string | null
          entity_type?: string | null
          id?: never
          ip_address?: unknown
          mission_id?: string | null
          occurred_at?: string
          outcome?: Database["public"]["Enums"]["activity_outcome"]
          previous_hash?: string | null
          request_id?: string | null
          row_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_actor_agent_id_fkey"
            columns: ["actor_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_approval_request_id_fkey"
            columns: ["approval_request_id"]
            isOneToOne: false
            referencedRelation: "approval_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_capability_id_fkey"
            columns: ["capability_id"]
            isOneToOne: false
            referencedRelation: "capabilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_memories: {
        Row: {
          agent_id: string
          content: string
          created_at: string
          embedding: string | null
          expires_at: string | null
          id: string
          importance: number
          metadata: Json
          mission_id: string | null
          scope: Database["public"]["Enums"]["memory_scope"]
          source: string | null
          updated_at: string
          visibility: Database["public"]["Enums"]["memory_visibility"]
        }
        Insert: {
          agent_id: string
          content: string
          created_at?: string
          embedding?: string | null
          expires_at?: string | null
          id?: string
          importance?: number
          metadata?: Json
          mission_id?: string | null
          scope: Database["public"]["Enums"]["memory_scope"]
          source?: string | null
          updated_at?: string
          visibility?: Database["public"]["Enums"]["memory_visibility"]
        }
        Update: {
          agent_id?: string
          content?: string
          created_at?: string
          embedding?: string | null
          expires_at?: string | null
          id?: string
          importance?: number
          metadata?: Json
          mission_id?: string | null
          scope?: Database["public"]["Enums"]["memory_scope"]
          source?: string | null
          updated_at?: string
          visibility?: Database["public"]["Enums"]["memory_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "agent_memories_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_memories_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_permissions: {
        Row: {
          agent_id: string
          authorization_level: number
          capability_id: string
          constraints: Json
          created_at: string
          expires_at: string | null
          granted_at: string
          granted_by_user_id: string
          id: string
          revoked_at: string | null
          revoked_by_user_id: string | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          authorization_level: number
          capability_id: string
          constraints?: Json
          created_at?: string
          expires_at?: string | null
          granted_at?: string
          granted_by_user_id: string
          id?: string
          revoked_at?: string | null
          revoked_by_user_id?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          authorization_level?: number
          capability_id?: string
          constraints?: Json
          created_at?: string
          expires_at?: string | null
          granted_at?: string
          granted_by_user_id?: string
          id?: string
          revoked_at?: string | null
          revoked_by_user_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_permissions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_permissions_capability_id_fkey"
            columns: ["capability_id"]
            isOneToOne: false
            referencedRelation: "capabilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_permissions_granted_by_user_id_fkey"
            columns: ["granted_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_permissions_revoked_by_user_id_fkey"
            columns: ["revoked_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          avatar_url: string | null
          config_version: number
          created_at: string
          department_id: string
          display_name: string
          id: string
          kind: Database["public"]["Enums"]["agent_kind"]
          max_delegation_depth: number
          model_name: string
          model_provider: Database["public"]["Enums"]["ai_model_provider"]
          model_settings: Json
          monthly_budget_usd: number | null
          personality: string | null
          responsibilities: string[]
          slug: string
          status: Database["public"]["Enums"]["agent_status"]
          supervisor_agent_id: string | null
          system_instructions: string
          title: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          config_version?: number
          created_at?: string
          department_id: string
          display_name: string
          id?: string
          kind: Database["public"]["Enums"]["agent_kind"]
          max_delegation_depth?: number
          model_name: string
          model_provider: Database["public"]["Enums"]["ai_model_provider"]
          model_settings?: Json
          monthly_budget_usd?: number | null
          personality?: string | null
          responsibilities?: string[]
          slug: string
          status?: Database["public"]["Enums"]["agent_status"]
          supervisor_agent_id?: string | null
          system_instructions: string
          title: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          config_version?: number
          created_at?: string
          department_id?: string
          display_name?: string
          id?: string
          kind?: Database["public"]["Enums"]["agent_kind"]
          max_delegation_depth?: number
          model_name?: string
          model_provider?: Database["public"]["Enums"]["ai_model_provider"]
          model_settings?: Json
          monthly_budget_usd?: number | null
          personality?: string | null
          responsibilities?: string[]
          slug?: string
          status?: Database["public"]["Enums"]["agent_status"]
          supervisor_agent_id?: string | null
          system_instructions?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agents_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agents_supervisor_agent_id_fkey"
            columns: ["supervisor_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage: {
        Row: {
          agent_id: string | null
          cost_usd: number
          created_at: string
          error_code: string | null
          id: number
          input_tokens: number
          latency_ms: number | null
          mission_id: string | null
          model: string
          operation: string
          output_tokens: number
          provider: Database["public"]["Enums"]["integration_provider"]
          succeeded: boolean
        }
        Insert: {
          agent_id?: string | null
          cost_usd?: number
          created_at?: string
          error_code?: string | null
          id?: never
          input_tokens?: number
          latency_ms?: number | null
          mission_id?: string | null
          model: string
          operation?: string
          output_tokens?: number
          provider: Database["public"]["Enums"]["integration_provider"]
          succeeded: boolean
        }
        Update: {
          agent_id?: string | null
          cost_usd?: number
          created_at?: string
          error_code?: string | null
          id?: never
          input_tokens?: number
          latency_ms?: number | null
          mission_id?: string | null
          model?: string
          operation?: string
          output_tokens?: number
          provider?: Database["public"]["Enums"]["integration_provider"]
          succeeded?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_requests: {
        Row: {
          authorization_level: number
          capability_id: string | null
          created_at: string
          decided_at: string | null
          decided_by_user_id: string | null
          decision_comment: string | null
          executed_at: string | null
          expires_at: string | null
          id: string
          mission_id: string | null
          previous_request_id: string | null
          proposed_action: Json
          proposed_action_hash: string
          rationale: string | null
          reference: string
          requested_by_agent_id: string
          status: Database["public"]["Enums"]["approval_status"]
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          authorization_level: number
          capability_id?: string | null
          created_at?: string
          decided_at?: string | null
          decided_by_user_id?: string | null
          decision_comment?: string | null
          executed_at?: string | null
          expires_at?: string | null
          id?: string
          mission_id?: string | null
          previous_request_id?: string | null
          proposed_action: Json
          proposed_action_hash: string
          rationale?: string | null
          reference?: string
          requested_by_agent_id: string
          status?: Database["public"]["Enums"]["approval_status"]
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          authorization_level?: number
          capability_id?: string | null
          created_at?: string
          decided_at?: string | null
          decided_by_user_id?: string | null
          decision_comment?: string | null
          executed_at?: string | null
          expires_at?: string | null
          id?: string
          mission_id?: string | null
          previous_request_id?: string | null
          proposed_action?: Json
          proposed_action_hash?: string
          rationale?: string | null
          reference?: string
          requested_by_agent_id?: string
          status?: Database["public"]["Enums"]["approval_status"]
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_requests_capability_id_fkey"
            columns: ["capability_id"]
            isOneToOne: false
            referencedRelation: "capabilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_requests_decided_by_user_id_fkey"
            columns: ["decided_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_requests_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_requests_previous_request_id_fkey"
            columns: ["previous_request_id"]
            isOneToOne: false
            referencedRelation: "approval_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_requests_requested_by_agent_id_fkey"
            columns: ["requested_by_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      capabilities: {
        Row: {
          category: string
          created_at: string
          default_authorization_level: number
          description: string
          id: string
          input_schema: Json
          integration_id: string | null
          is_enabled: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          default_authorization_level: number
          description: string
          id?: string
          input_schema?: Json
          integration_id?: string | null
          is_enabled?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          default_authorization_level?: number
          description?: string
          id?: string
          input_schema?: Json
          integration_id?: string | null
          is_enabled?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "capabilities_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          agent_id: string | null
          conversation_id: string
          id: string
          joined_at: string
          left_at: string | null
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          conversation_id: string
          id?: string
          joined_at?: string
          left_at?: string | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          conversation_id?: string
          id?: string
          joined_at?: string
          left_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          created_by_agent_id: string | null
          created_by_user_id: string | null
          id: string
          kind: Database["public"]["Enums"]["conversation_kind"]
          last_message_at: string | null
          mission_id: string | null
          status: Database["public"]["Enums"]["conversation_status"]
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by_agent_id?: string | null
          created_by_user_id?: string | null
          id?: string
          kind: Database["public"]["Enums"]["conversation_kind"]
          last_message_at?: string | null
          mission_id?: string | null
          status?: Database["public"]["Enums"]["conversation_status"]
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by_agent_id?: string | null
          created_by_user_id?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["conversation_kind"]
          last_message_at?: string | null
          mission_id?: string | null
          status?: Database["public"]["Enums"]["conversation_status"]
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_created_by_agent_id_fkey"
            columns: ["created_by_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_secrets: {
        Row: {
          auth_tag: string
          ciphertext: string
          created_at: string
          expires_at: string | null
          fingerprint: string
          id: string
          integration_id: string
          iv: string
          key_version: number
          name: string
          rotated_at: string | null
          updated_at: string
        }
        Insert: {
          auth_tag: string
          ciphertext: string
          created_at?: string
          expires_at?: string | null
          fingerprint: string
          id?: string
          integration_id: string
          iv: string
          key_version?: number
          name: string
          rotated_at?: string | null
          updated_at?: string
        }
        Update: {
          auth_tag?: string
          ciphertext?: string
          created_at?: string
          expires_at?: string | null
          fingerprint?: string
          id?: string
          integration_id?: string
          iv?: string
          key_version?: number
          name?: string
          rotated_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_secrets_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          config: Json
          created_at: string
          id: string
          last_error: string | null
          last_health_check_at: string | null
          name: string
          provider: Database["public"]["Enums"]["integration_provider"]
          slug: string
          status: Database["public"]["Enums"]["integration_status"]
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          last_error?: string | null
          last_health_check_at?: string | null
          name: string
          provider: Database["public"]["Enums"]["integration_provider"]
          slug: string
          status?: Database["public"]["Enums"]["integration_status"]
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          last_error?: string | null
          last_health_check_at?: string | null
          name?: string
          provider?: Database["public"]["Enums"]["integration_provider"]
          slug?: string
          status?: Database["public"]["Enums"]["integration_status"]
          updated_at?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          attempts: number
          created_at: string
          finished_at: string | null
          id: string
          idempotency_key: string | null
          job_type: string
          last_error: string | null
          locked_at: string | null
          locked_by: string | null
          max_attempts: number
          mission_id: string | null
          payload: Json
          priority: number
          run_after: string
          schedule_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["job_status"]
          updated_at: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          finished_at?: string | null
          id?: string
          idempotency_key?: string | null
          job_type: string
          last_error?: string | null
          locked_at?: string | null
          locked_by?: string | null
          max_attempts?: number
          mission_id?: string | null
          payload?: Json
          priority?: number
          run_after?: string
          schedule_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          updated_at?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          finished_at?: string | null
          id?: string
          idempotency_key?: string | null
          job_type?: string
          last_error?: string | null
          locked_at?: string | null
          locked_by?: string | null
          max_attempts?: number
          mission_id?: string | null
          payload?: Json
          priority?: number
          run_after?: string
          schedule_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "mission_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_measurements: {
        Row: {
          created_at: string
          id: number
          kpi_id: string
          measured_at: string
          metadata: Json
          recorded_by_agent_id: string | null
          source: Database["public"]["Enums"]["measurement_source"]
          value: number
        }
        Insert: {
          created_at?: string
          id?: never
          kpi_id: string
          measured_at: string
          metadata?: Json
          recorded_by_agent_id?: string | null
          source: Database["public"]["Enums"]["measurement_source"]
          value: number
        }
        Update: {
          created_at?: string
          id?: never
          kpi_id?: string
          measured_at?: string
          metadata?: Json
          recorded_by_agent_id?: string | null
          source?: Database["public"]["Enums"]["measurement_source"]
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "kpi_measurements_kpi_id_fkey"
            columns: ["kpi_id"]
            isOneToOne: false
            referencedRelation: "kpis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpi_measurements_recorded_by_agent_id_fkey"
            columns: ["recorded_by_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      kpis: {
        Row: {
          agent_id: string | null
          created_at: string
          department_id: string | null
          description: string | null
          direction: Database["public"]["Enums"]["kpi_direction"]
          id: string
          is_active: boolean
          name: string
          objective_id: string | null
          slug: string
          target_value: number | null
          unit: string
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          department_id?: string | null
          description?: string | null
          direction: Database["public"]["Enums"]["kpi_direction"]
          id?: string
          is_active?: boolean
          name: string
          objective_id?: string | null
          slug: string
          target_value?: number | null
          unit: string
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          department_id?: string | null
          description?: string | null
          direction?: Database["public"]["Enums"]["kpi_direction"]
          id?: string
          is_active?: boolean
          name?: string
          objective_id?: string | null
          slug?: string
          target_value?: number | null
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kpis_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpis_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpis_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json
          content: string
          content_format: Database["public"]["Enums"]["content_format"]
          conversation_id: string
          created_at: string
          edited_at: string | null
          id: string
          metadata: Json
          reply_to_message_id: string | null
          sender_agent_id: string | null
          sender_type: Database["public"]["Enums"]["actor_type"]
          sender_user_id: string | null
        }
        Insert: {
          attachments?: Json
          content: string
          content_format?: Database["public"]["Enums"]["content_format"]
          conversation_id: string
          created_at?: string
          edited_at?: string | null
          id?: string
          metadata?: Json
          reply_to_message_id?: string | null
          sender_agent_id?: string | null
          sender_type: Database["public"]["Enums"]["actor_type"]
          sender_user_id?: string | null
        }
        Update: {
          attachments?: Json
          content?: string
          content_format?: Database["public"]["Enums"]["content_format"]
          conversation_id?: string
          created_at?: string
          edited_at?: string | null
          id?: string
          metadata?: Json
          reply_to_message_id?: string | null
          sender_agent_id?: string | null
          sender_type?: Database["public"]["Enums"]["actor_type"]
          sender_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_message_id_fkey"
            columns: ["reply_to_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_agent_id_fkey"
            columns: ["sender_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_user_id_fkey"
            columns: ["sender_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_assignments: {
        Row: {
          agent_id: string
          assigned_at: string
          mission_id: string
          role: Database["public"]["Enums"]["mission_role"]
        }
        Insert: {
          agent_id: string
          assigned_at?: string
          mission_id: string
          role?: Database["public"]["Enums"]["mission_role"]
        }
        Update: {
          agent_id?: string
          assigned_at?: string
          mission_id?: string
          role?: Database["public"]["Enums"]["mission_role"]
        }
        Relationships: [
          {
            foreignKeyName: "mission_assignments_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_assignments_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_events: {
        Row: {
          actor_agent_id: string | null
          actor_type: Database["public"]["Enums"]["actor_type"]
          actor_user_id: string | null
          created_at: string
          event_type: string
          from_status: Database["public"]["Enums"]["mission_status"] | null
          id: number
          mission_id: string
          note: string | null
          progress: number | null
          to_status: Database["public"]["Enums"]["mission_status"] | null
        }
        Insert: {
          actor_agent_id?: string | null
          actor_type: Database["public"]["Enums"]["actor_type"]
          actor_user_id?: string | null
          created_at?: string
          event_type: string
          from_status?: Database["public"]["Enums"]["mission_status"] | null
          id?: never
          mission_id: string
          note?: string | null
          progress?: number | null
          to_status?: Database["public"]["Enums"]["mission_status"] | null
        }
        Update: {
          actor_agent_id?: string | null
          actor_type?: Database["public"]["Enums"]["actor_type"]
          actor_user_id?: string | null
          created_at?: string
          event_type?: string
          from_status?: Database["public"]["Enums"]["mission_status"] | null
          id?: never
          mission_id?: string
          note?: string | null
          progress?: number | null
          to_status?: Database["public"]["Enums"]["mission_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "mission_events_actor_agent_id_fkey"
            columns: ["actor_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_events_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_events_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_schedules: {
        Row: {
          agent_id: string
          created_at: string
          created_by_user_id: string
          cron_expression: string
          id: string
          is_enabled: boolean
          last_run_at: string | null
          mission_template: Json
          name: string
          next_run_at: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          created_by_user_id: string
          cron_expression: string
          id?: string
          is_enabled?: boolean
          last_run_at?: string | null
          mission_template: Json
          name: string
          next_run_at?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          created_by_user_id?: string
          cron_expression?: string
          id?: string
          is_enabled?: boolean
          last_run_at?: string | null
          mission_template?: Json
          name?: string
          next_run_at?: string | null
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mission_schedules_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_schedules_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by_agent_id: string | null
          created_by_user_id: string | null
          description: string | null
          due_at: string | null
          id: string
          parent_mission_id: string | null
          priority: Database["public"]["Enums"]["mission_priority"]
          progress: number
          reference: string
          result: Json | null
          result_summary: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["mission_status"]
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by_agent_id?: string | null
          created_by_user_id?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          parent_mission_id?: string | null
          priority?: Database["public"]["Enums"]["mission_priority"]
          progress?: number
          reference?: string
          result?: Json | null
          result_summary?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["mission_status"]
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by_agent_id?: string | null
          created_by_user_id?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          parent_mission_id?: string | null
          priority?: Database["public"]["Enums"]["mission_priority"]
          progress?: number
          reference?: string
          result?: Json | null
          result_summary?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["mission_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "missions_created_by_agent_id_fkey"
            columns: ["created_by_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_parent_mission_id_fkey"
            columns: ["parent_mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          link_path: string | null
          read_at: string | null
          severity: Database["public"]["Enums"]["severity"]
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          link_path?: string | null
          read_at?: string | null
          severity?: Database["public"]["Enums"]["severity"]
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          link_path?: string | null
          read_at?: string | null
          severity?: Database["public"]["Enums"]["severity"]
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      objectives: {
        Row: {
          agent_id: string | null
          created_at: string
          department_id: string | null
          description: string | null
          id: string
          period_end: string
          period_start: string
          status: Database["public"]["Enums"]["objective_status"]
          title: string
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          period_end: string
          period_start: string
          status?: Database["public"]["Enums"]["objective_status"]
          title: string
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          period_end?: string
          period_start?: string
          status?: Database["public"]["Enums"]["objective_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "objectives_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objectives_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          author_agent_id: string | null
          content: string | null
          created_at: string
          data: Json
          department_id: string | null
          id: string
          mission_id: string | null
          period_end: string | null
          period_start: string | null
          published_at: string | null
          read_at: string | null
          report_type: Database["public"]["Enums"]["report_type"]
          status: Database["public"]["Enums"]["report_status"]
          storage_path: string | null
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_agent_id?: string | null
          content?: string | null
          created_at?: string
          data?: Json
          department_id?: string | null
          id?: string
          mission_id?: string | null
          period_end?: string | null
          period_start?: string | null
          published_at?: string | null
          read_at?: string | null
          report_type: Database["public"]["Enums"]["report_type"]
          status?: Database["public"]["Enums"]["report_status"]
          storage_path?: string | null
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_agent_id?: string | null
          content?: string | null
          created_at?: string
          data?: Json
          department_id?: string | null
          id?: string
          mission_id?: string | null
          period_end?: string | null
          period_start?: string | null
          published_at?: string | null
          read_at?: string | null
          report_type?: Database["public"]["Enums"]["report_type"]
          status?: Database["public"]["Enums"]["report_status"]
          storage_path?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_author_agent_id_fkey"
            columns: ["author_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          accepted_user_id: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by_user_id: string | null
          revoked_at: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          accepted_at?: string | null
          accepted_user_id?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by_user_id?: string | null
          revoked_at?: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          accepted_at?: string | null
          accepted_user_id?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by_user_id?: string | null
          revoked_at?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "user_invitations_accepted_user_id_fkey"
            columns: ["accepted_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_invitations_invited_by_user_id_fkey"
            columns: ["invited_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          last_seen_at: string | null
          mfa_required: boolean
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          is_active?: boolean
          last_seen_at?: string | null
          mfa_required?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          last_seen_at?: string | null
          mfa_required?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
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
      activity_outcome: "success" | "denied" | "failed" | "pending_approval"
      actor_type: "user" | "agent" | "system" | "integration"
      agent_kind: "director" | "specialist"
      agent_status: "draft" | "active" | "paused" | "retired"
      ai_model_provider: "openai" | "anthropic"
      approval_status:
        | "pending"
        | "approved"
        | "rejected"
        | "changes_requested"
        | "expired"
        | "cancelled"
        | "executed"
      content_format: "markdown" | "plain"
      conversation_kind: "direct" | "group" | "meeting" | "mission"
      conversation_status: "open" | "archived"
      integration_provider:
        | "openai"
        | "anthropic"
        | "elevenlabs"
        | "zoho"
        | "n8n"
        | "mcp"
        | "email"
        | "other"
      integration_status: "not_configured" | "active" | "error" | "disabled"
      job_status: "queued" | "running" | "succeeded" | "failed" | "cancelled"
      kpi_direction: "higher_is_better" | "lower_is_better" | "target_is_best"
      measurement_source: "system" | "agent" | "integration" | "manual"
      memory_scope: "working" | "long_term"
      memory_visibility: "private" | "department" | "organization"
      mission_priority: "low" | "normal" | "high" | "critical"
      mission_role: "lead" | "contributor" | "reviewer"
      mission_status:
        | "draft"
        | "pending"
        | "in_progress"
        | "awaiting_approval"
        | "blocked"
        | "completed"
        | "failed"
        | "cancelled"
      notification_type:
        | "approval_required"
        | "alert"
        | "report_published"
        | "mission_update"
        | "system"
      objective_status: "draft" | "active" | "achieved" | "missed" | "cancelled"
      report_status: "draft" | "published" | "archived"
      report_type:
        | "daily"
        | "weekly"
        | "monthly"
        | "financial"
        | "commercial"
        | "marketing"
        | "operational"
        | "ad_hoc"
      severity: "info" | "warning" | "critical"
      user_role: "executive" | "administrator" | "observer"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      activity_outcome: ["success", "denied", "failed", "pending_approval"],
      actor_type: ["user", "agent", "system", "integration"],
      agent_kind: ["director", "specialist"],
      agent_status: ["draft", "active", "paused", "retired"],
      ai_model_provider: ["openai", "anthropic"],
      approval_status: [
        "pending",
        "approved",
        "rejected",
        "changes_requested",
        "expired",
        "cancelled",
        "executed",
      ],
      content_format: ["markdown", "plain"],
      conversation_kind: ["direct", "group", "meeting", "mission"],
      conversation_status: ["open", "archived"],
      integration_provider: [
        "openai",
        "anthropic",
        "elevenlabs",
        "zoho",
        "n8n",
        "mcp",
        "email",
        "other",
      ],
      integration_status: ["not_configured", "active", "error", "disabled"],
      job_status: ["queued", "running", "succeeded", "failed", "cancelled"],
      kpi_direction: ["higher_is_better", "lower_is_better", "target_is_best"],
      measurement_source: ["system", "agent", "integration", "manual"],
      memory_scope: ["working", "long_term"],
      memory_visibility: ["private", "department", "organization"],
      mission_priority: ["low", "normal", "high", "critical"],
      mission_role: ["lead", "contributor", "reviewer"],
      mission_status: [
        "draft",
        "pending",
        "in_progress",
        "awaiting_approval",
        "blocked",
        "completed",
        "failed",
        "cancelled",
      ],
      notification_type: [
        "approval_required",
        "alert",
        "report_published",
        "mission_update",
        "system",
      ],
      objective_status: ["draft", "active", "achieved", "missed", "cancelled"],
      report_status: ["draft", "published", "archived"],
      report_type: [
        "daily",
        "weekly",
        "monthly",
        "financial",
        "commercial",
        "marketing",
        "operational",
        "ad_hoc",
      ],
      severity: ["info", "warning", "critical"],
      user_role: ["executive", "administrator", "observer"],
    },
  },
} as const
