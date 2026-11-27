-- =============================================================================
-- 0500 — Missions, planification et file de tâches
-- =============================================================================

create sequence public.mission_reference_seq;

-- -----------------------------------------------------------------------------
-- missions
-- -----------------------------------------------------------------------------
create table public.missions (
  id                    uuid primary key default gen_random_uuid(),
  reference             text not null unique
                          default 'M-' || to_char(now(), 'YYYY') || '-'
                                  || lpad(nextval('public.mission_reference_seq')::text, 6, '0'),
  title                 text not null check (length(title) between 1 and 300),
  description           text,
  priority              public.mission_priority not null default 'normal',
  status                public.mission_status not null default 'draft',
  progress              smallint not null default 0 check (progress between 0 and 100),
  parent_mission_id     uuid references public.missions (id) on delete restrict,
  created_by_user_id    uuid references public.users (id) on delete restrict,
  created_by_agent_id   uuid references public.agents (id) on delete restrict,
  due_at                timestamptz,
  started_at            timestamptz,
  completed_at          timestamptz,
  result_summary        text,
  result                jsonb,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint missions_single_creator check (num_nonnulls(created_by_user_id, created_by_agent_id) = 1),
  constraint missions_not_own_parent check (parent_mission_id is null or parent_mission_id <> id),
  constraint missions_completed_at_consistent
    check ((status in ('completed', 'failed', 'cancelled')) = (completed_at is not null)),
  constraint missions_completed_progress check (status <> 'completed' or progress = 100)
);

create index missions_status_priority_idx on public.missions (status, priority);
create index missions_due_at_idx on public.missions (due_at) where status not in ('completed', 'failed', 'cancelled');
create index missions_parent_mission_id_idx on public.missions (parent_mission_id);
create index missions_created_by_agent_id_idx on public.missions (created_by_agent_id);
create index missions_created_at_idx on public.missions (created_at desc);

create trigger missions_set_updated_at
  before update on public.missions
  for each row execute function private.set_updated_at();

-- -----------------------------------------------------------------------------
-- mission_assignments : agents affectés (plusieurs directeurs possibles)
-- -----------------------------------------------------------------------------
create table public.mission_assignments (
  mission_id    uuid not null references public.missions (id) on delete cascade,
  agent_id      uuid not null references public.agents (id) on delete restrict,
  role          public.mission_role not null default 'contributor',
  assigned_at   timestamptz not null default now(),
  primary key (mission_id, agent_id)
);

create index mission_assignments_agent_id_idx on public.mission_assignments (agent_id);

-- Un seul responsable (lead) par mission.
create unique index mission_assignments_one_lead_idx
  on public.mission_assignments (mission_id)
  where role = 'lead';

-- -----------------------------------------------------------------------------
-- mission_events : historique de la mission (ajout seul)
-- -----------------------------------------------------------------------------
create table public.mission_events (
  id               bigint generated always as identity primary key,
  mission_id       uuid not null references public.missions (id) on delete cascade,
  event_type       text not null,
  from_status      public.mission_status,
  to_status        public.mission_status,
  progress         smallint check (progress between 0 and 100),
  note             text,
  actor_type       public.actor_type not null,
  actor_user_id    uuid references public.users (id) on delete restrict,
  actor_agent_id   uuid references public.agents (id) on delete restrict,
  created_at       timestamptz not null default now(),
  constraint mission_events_actor_consistent check (
    (actor_type = 'user' and actor_user_id is not null and actor_agent_id is null)
    or (actor_type = 'agent' and actor_agent_id is not null and actor_user_id is null)
    or (actor_type in ('system', 'integration') and actor_user_id is null and actor_agent_id is null)
  )
);

create index mission_events_mission_id_created_at_idx on public.mission_events (mission_id, created_at);

create trigger mission_events_append_only
  before update or delete on public.mission_events
  for each row execute function private.prevent_mutation();

-- -----------------------------------------------------------------------------
-- mission_schedules : missions récurrentes (rapports, surveillance…)
-- -----------------------------------------------------------------------------
create table public.mission_schedules (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  agent_id            uuid not null references public.agents (id) on delete cascade,
  cron_expression     text not null,
  timezone            text not null default 'Europe/Paris',
  mission_template    jsonb not null,
  is_enabled          boolean not null default true,
  last_run_at         timestamptz,
  next_run_at         timestamptz,
  created_by_user_id  uuid not null references public.users (id) on delete restrict,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint mission_schedules_template_is_object check (jsonb_typeof(mission_template) = 'object')
);

create index mission_schedules_due_idx on public.mission_schedules (next_run_at) where is_enabled;
create index mission_schedules_agent_id_idx on public.mission_schedules (agent_id);

create trigger mission_schedules_set_updated_at
  before update on public.mission_schedules
  for each row execute function private.set_updated_at();

-- -----------------------------------------------------------------------------
-- jobs : file de tâches persistante consommée par apps/workers
-- -----------------------------------------------------------------------------
create table public.jobs (
  id                uuid primary key default gen_random_uuid(),
  job_type          text not null,
  payload           jsonb not null default '{}'::jsonb,
  status            public.job_status not null default 'queued',
  priority          smallint not null default 0,
  attempts          smallint not null default 0 check (attempts >= 0),
  max_attempts      smallint not null default 5 check (max_attempts >= 1),
  run_after         timestamptz not null default now(),
  locked_at         timestamptz,
  locked_by         text,
  last_error        text,
  idempotency_key   text unique,
  mission_id        uuid references public.missions (id) on delete set null,
  schedule_id       uuid references public.mission_schedules (id) on delete set null,
  created_at        timestamptz not null default now(),
  started_at        timestamptz,
  finished_at       timestamptz,
  updated_at        timestamptz not null default now(),
  constraint jobs_attempts_within_limit check (attempts <= max_attempts),
  constraint jobs_lock_consistent check ((status = 'running') = (locked_at is not null))
);

-- Index de dépilement : tâches prêtes, par priorité puis ancienneté.
create index jobs_dequeue_idx on public.jobs (priority desc, run_after) where status = 'queued';
create index jobs_mission_id_idx on public.jobs (mission_id);
create index jobs_failed_idx on public.jobs (finished_at desc) where status = 'failed';

create trigger jobs_set_updated_at
  before update on public.jobs
  for each row execute function private.set_updated_at();
