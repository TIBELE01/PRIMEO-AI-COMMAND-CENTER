-- =============================================================================
-- 1100 — Sécurité : Row Level Security et droits d'accès
--
-- Modèle :
--   * Toutes les ÉCRITURES passent par apps/api et apps/workers, connectés avec le rôle
--     service_role (contourne la RLS). Aucun rôle exposé au navigateur ne peut écrire.
--   * Les rôles exposés (anon, authenticated) n'ont qu'un accès en LECTURE, limité par la RLS,
--     utile notamment au temps réel (Supabase Realtime) de l'interface du PDG.
--   * Les secrets chiffrés ne sont lisibles par aucun rôle exposé.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Fonctions d'identité
-- -----------------------------------------------------------------------------

-- Vrai si l'utilisateur connecté est un dirigeant actif.
create function private.is_executive()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role = 'executive'
      and u.is_active
  );
$$;

revoke execute on all functions in schema private from public;
grant usage on schema private to authenticated;
grant execute on function private.is_executive() to authenticated;

-- -----------------------------------------------------------------------------
-- RLS activée sur toutes les tables du schéma public
-- -----------------------------------------------------------------------------
do $$
declare
  t record;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t.tablename);
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- Droits de table : aucun accès anonyme, lecture seule pour les utilisateurs connectés
-- -----------------------------------------------------------------------------
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
revoke insert, update, delete, truncate, references, trigger on all tables in schema public from authenticated;
revoke all on all sequences in schema public from authenticated;
grant select on all tables in schema public to authenticated;

-- Secrets : invisibles pour tout rôle exposé, même en cas d'erreur de politique RLS.
revoke all on public.integration_secrets from authenticated;

-- Même règles pour les tables créées par de futures migrations.
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke all on sequences from anon;
alter default privileges in schema public revoke insert, update, delete, truncate on tables from authenticated;

-- -----------------------------------------------------------------------------
-- Politiques de lecture
-- -----------------------------------------------------------------------------

-- users : chacun voit son propre compte ; le dirigeant voit tous les comptes.
create policy users_select on public.users
  for select to authenticated
  using (id = (select auth.uid()) or (select private.is_executive()));

-- notifications : strictement personnelles.
create policy notifications_select_own on public.notifications
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Tables opérationnelles : lecture réservée au dirigeant.
do $$
declare
  t text;
begin
  foreach t in array array[
    'departments', 'agents', 'integrations', 'capabilities', 'agent_permissions',
    'missions', 'mission_assignments', 'mission_events', 'mission_schedules', 'jobs',
    'approval_requests', 'conversations', 'conversation_participants', 'messages',
    'objectives', 'kpis', 'kpi_measurements', 'reports', 'agent_memories', 'ai_usage',
    'activity_logs'
  ] loop
    execute format(
      'create policy %I on public.%I for select to authenticated using ((select private.is_executive()))',
      t || '_select_executive', t
    );
  end loop;
end;
$$;

-- integration_secrets : aucune politique → aucun accès hors service_role.

-- -----------------------------------------------------------------------------
-- Garde-fou : échoue si une table du schéma public n'a pas la RLS activée.
-- -----------------------------------------------------------------------------
do $$
declare
  missing text;
begin
  select string_agg(c.relname, ', ') into missing
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity;

  if missing is not null then
    raise exception 'RLS non activée sur : %', missing;
  end if;
end;
$$;
