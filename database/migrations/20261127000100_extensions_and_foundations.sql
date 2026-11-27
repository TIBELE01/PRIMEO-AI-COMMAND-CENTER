-- =============================================================================
-- 0100 — Extensions, schéma privé, types et fonctions communes
-- =============================================================================

create extension if not exists pgcrypto with schema extensions;
create extension if not exists vector with schema extensions;

-- Schéma non exposé par l'API REST de Supabase : fonctions internes de sécurité.
create schema if not exists private;
revoke all on schema private from public;

-- -----------------------------------------------------------------------------
-- Domaine : niveau d'autorisation des actions d'agents
--   1 = action autonome autorisée
--   2 = validation préalable du PDG requise
--   3 = décision réservée à une intervention humaine
-- -----------------------------------------------------------------------------
create domain public.authorization_level as smallint
  check (value between 1 and 3);

-- -----------------------------------------------------------------------------
-- Types énumérés
-- -----------------------------------------------------------------------------
create type public.user_role as enum ('executive', 'administrator', 'observer');
create type public.actor_type as enum ('user', 'agent', 'system', 'integration');
create type public.severity as enum ('info', 'warning', 'critical');

create type public.agent_kind as enum ('director', 'specialist');
create type public.agent_status as enum ('draft', 'active', 'paused', 'retired');
create type public.ai_model_provider as enum ('openai', 'anthropic');

create type public.mission_priority as enum ('low', 'normal', 'high', 'critical');
create type public.mission_status as enum (
  'draft', 'pending', 'in_progress', 'awaiting_approval', 'blocked', 'completed', 'failed', 'cancelled'
);
create type public.mission_role as enum ('lead', 'contributor', 'reviewer');
create type public.job_status as enum ('queued', 'running', 'succeeded', 'failed', 'cancelled');

create type public.conversation_kind as enum ('direct', 'group', 'meeting', 'mission');
create type public.conversation_status as enum ('open', 'archived');
create type public.content_format as enum ('markdown', 'plain');

create type public.approval_status as enum (
  'pending', 'approved', 'rejected', 'changes_requested', 'expired', 'cancelled', 'executed'
);

create type public.report_type as enum (
  'daily', 'weekly', 'monthly', 'financial', 'commercial', 'marketing', 'operational', 'ad_hoc'
);
create type public.report_status as enum ('draft', 'published', 'archived');

create type public.objective_status as enum ('draft', 'active', 'achieved', 'missed', 'cancelled');
create type public.kpi_direction as enum ('higher_is_better', 'lower_is_better', 'target_is_best');
create type public.measurement_source as enum ('system', 'agent', 'integration', 'manual');

create type public.notification_type as enum (
  'approval_required', 'alert', 'report_published', 'mission_update', 'system'
);

create type public.integration_provider as enum (
  'openai', 'anthropic', 'elevenlabs', 'zoho', 'n8n', 'mcp', 'email', 'other'
);
create type public.integration_status as enum ('not_configured', 'active', 'error', 'disabled');

create type public.memory_scope as enum ('working', 'long_term');
create type public.memory_visibility as enum ('private', 'department', 'organization');

create type public.activity_outcome as enum ('success', 'denied', 'failed', 'pending_approval');

-- -----------------------------------------------------------------------------
-- Fonctions utilitaires communes
-- -----------------------------------------------------------------------------

-- Met à jour automatiquement la colonne updated_at.
create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Interdit toute modification ou suppression : tables en ajout seul.
create function private.prevent_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'La table %.% est en ajout seul : % interdit.',
    tg_table_schema, tg_table_name, tg_op
    using errcode = 'insufficient_privilege';
end;
$$;
