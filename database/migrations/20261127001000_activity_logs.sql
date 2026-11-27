-- =============================================================================
-- 1000 — Journal d'activité (Activity Logs) : ajout seul, chaîné par empreintes
-- =============================================================================

create table public.activity_logs (
  id                    bigint generated always as identity primary key,
  occurred_at           timestamptz not null default now(),
  actor_type            public.actor_type not null,
  actor_user_id         uuid references public.users (id) on delete restrict,
  actor_agent_id        uuid references public.agents (id) on delete restrict,
  action                text not null check (action ~ '^[a-z_]+(\.[a-z_]+)+$'),
  outcome               public.activity_outcome not null,
  entity_type           text,
  entity_id             uuid,
  mission_id            uuid references public.missions (id) on delete restrict,
  capability_id         uuid references public.capabilities (id) on delete restrict,
  approval_request_id   uuid references public.approval_requests (id) on delete restrict,
  authorization_level   public.authorization_level,
  details               jsonb not null default '{}'::jsonb,
  request_id            text,
  ip_address            inet,
  previous_hash         text,
  row_hash              text not null,
  constraint activity_logs_actor_consistent check (
    (actor_type = 'user' and actor_user_id is not null and actor_agent_id is null)
    or (actor_type = 'agent' and actor_agent_id is not null and actor_user_id is null)
    or (actor_type in ('system', 'integration') and actor_user_id is null and actor_agent_id is null)
  ),
  constraint activity_logs_details_is_object check (jsonb_typeof(details) = 'object')
);

create index activity_logs_occurred_at_idx on public.activity_logs (occurred_at desc);
create index activity_logs_actor_agent_idx on public.activity_logs (actor_agent_id, occurred_at desc);
create index activity_logs_actor_user_idx on public.activity_logs (actor_user_id, occurred_at desc);
create index activity_logs_entity_idx on public.activity_logs (entity_type, entity_id);
create index activity_logs_mission_id_idx on public.activity_logs (mission_id);
create index activity_logs_action_idx on public.activity_logs (action, occurred_at desc);
create index activity_logs_non_success_idx on public.activity_logs (occurred_at desc) where outcome <> 'success';

-- Chaînage : chaque ligne contient l'empreinte de la précédente. Toute altération ultérieure
-- (même directe, par un administrateur de la base) devient détectable par vérification de la chaîne.
create function private.activity_logs_chain_hash()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Sérialise les insertions pour garantir un chaînage sans trou ni bifurcation.
  perform pg_advisory_xact_lock(hashtext('public.activity_logs'));

  select l.row_hash into new.previous_hash
  from public.activity_logs l
  order by l.id desc
  limit 1;

  new.row_hash := encode(
    extensions.digest(
      coalesce(new.previous_hash, '') || '|'
        || (to_jsonb(new) - 'row_hash' - 'previous_hash')::text,
      'sha256'
    ),
    'hex'
  );
  return new;
end;
$$;

create trigger activity_logs_chain_hash
  before insert on public.activity_logs
  for each row execute function private.activity_logs_chain_hash();

create trigger activity_logs_append_only
  before update or delete on public.activity_logs
  for each row execute function private.prevent_mutation();

create trigger activity_logs_no_truncate
  before truncate on public.activity_logs
  for each statement execute function private.prevent_mutation();

-- Vérifie l'intégrité de la chaîne. Renvoie les identifiants des lignes incohérentes
-- (aucune ligne renvoyée = journal intègre).
create function private.verify_activity_logs_chain()
returns table (broken_id bigint)
language sql
stable
set search_path = ''
as $$
  with ordered as (
    select
      l.id,
      l.previous_hash,
      l.row_hash,
      lag(l.row_hash) over (order by l.id) as expected_previous_hash,
      encode(
        extensions.digest(
          coalesce(l.previous_hash, '') || '|'
            || (to_jsonb(l) - 'row_hash' - 'previous_hash')::text,
          'sha256'
        ),
        'hex'
      ) as recomputed_hash
    from public.activity_logs l
  )
  select o.id
  from ordered o
  where o.previous_hash is distinct from o.expected_previous_hash
     or o.row_hash <> o.recomputed_hash
  order by o.id;
$$;
