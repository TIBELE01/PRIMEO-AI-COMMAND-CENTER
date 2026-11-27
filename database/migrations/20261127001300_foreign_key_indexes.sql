-- =============================================================================
-- 1300 — Index des clés étrangères restantes et durcissement
-- (recommandations du conseiller de performance et de sécurité de Supabase)
-- =============================================================================

create index activity_logs_approval_request_id_idx on public.activity_logs (approval_request_id);
create index activity_logs_capability_id_idx on public.activity_logs (capability_id);
create index agent_permissions_granted_by_user_id_idx on public.agent_permissions (granted_by_user_id);
create index agent_permissions_revoked_by_user_id_idx on public.agent_permissions (revoked_by_user_id);
create index approval_requests_capability_id_idx on public.approval_requests (capability_id);
create index approval_requests_decided_by_user_id_idx on public.approval_requests (decided_by_user_id);
create index approval_requests_previous_request_id_idx on public.approval_requests (previous_request_id);
create index conversations_created_by_agent_id_idx on public.conversations (created_by_agent_id);
create index conversations_created_by_user_id_idx on public.conversations (created_by_user_id);
create index jobs_schedule_id_idx on public.jobs (schedule_id);
create index kpi_measurements_recorded_by_agent_id_idx on public.kpi_measurements (recorded_by_agent_id);
create index messages_reply_to_message_id_idx on public.messages (reply_to_message_id);
create index messages_sender_user_id_idx on public.messages (sender_user_id);
create index mission_events_actor_agent_id_idx on public.mission_events (actor_agent_id);
create index mission_events_actor_user_id_idx on public.mission_events (actor_user_id);
create index mission_schedules_created_by_user_id_idx on public.mission_schedules (created_by_user_id);
create index missions_created_by_user_id_idx on public.missions (created_by_user_id);
create index reports_mission_id_idx on public.reports (mission_id);

-- La fonction rls_auto_enable() est installée par Supabase (déclencheur d'événement qui active
-- la RLS sur toute nouvelle table). Elle n'a pas à être appelable via l'API REST.
do $$
begin
  if exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'rls_auto_enable'
  ) then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end;
$$;
