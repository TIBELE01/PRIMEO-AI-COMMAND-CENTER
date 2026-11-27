-- =============================================================================
-- 0800 — Objectifs, indicateurs de performance, rapports et notifications
-- =============================================================================

-- -----------------------------------------------------------------------------
-- objectives : objectifs d'un agent OU d'une direction sur une période
-- -----------------------------------------------------------------------------
create table public.objectives (
  id              uuid primary key default gen_random_uuid(),
  agent_id        uuid references public.agents (id) on delete cascade,
  department_id   uuid references public.departments (id) on delete cascade,
  title           text not null,
  description     text,
  status          public.objective_status not null default 'draft',
  period_start    date not null,
  period_end      date not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint objectives_single_owner check (num_nonnulls(agent_id, department_id) = 1),
  constraint objectives_period_valid check (period_end >= period_start)
);

create index objectives_agent_id_idx on public.objectives (agent_id);
create index objectives_department_id_idx on public.objectives (department_id);
create index objectives_period_idx on public.objectives (period_start, period_end);

create trigger objectives_set_updated_at
  before update on public.objectives
  for each row execute function private.set_updated_at();

-- -----------------------------------------------------------------------------
-- kpis : définition des indicateurs mesurables
-- -----------------------------------------------------------------------------
create table public.kpis (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique check (slug ~ '^[a-z0-9]+([._-][a-z0-9]+)*$'),
  name            text not null,
  description     text,
  unit            text not null,
  direction       public.kpi_direction not null,
  target_value    numeric,
  department_id   uuid references public.departments (id) on delete cascade,
  agent_id        uuid references public.agents (id) on delete cascade,
  objective_id    uuid references public.objectives (id) on delete set null,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint kpis_target_required check (direction <> 'target_is_best' or target_value is not null)
);

create index kpis_department_id_idx on public.kpis (department_id);
create index kpis_agent_id_idx on public.kpis (agent_id);
create index kpis_objective_id_idx on public.kpis (objective_id);

create trigger kpis_set_updated_at
  before update on public.kpis
  for each row execute function private.set_updated_at();

-- -----------------------------------------------------------------------------
-- kpi_measurements : valeurs mesurées (série temporelle, ajout seul)
-- -----------------------------------------------------------------------------
create table public.kpi_measurements (
  id                     bigint generated always as identity primary key,
  kpi_id                 uuid not null references public.kpis (id) on delete cascade,
  value                  numeric not null,
  measured_at            timestamptz not null,
  source                 public.measurement_source not null,
  recorded_by_agent_id   uuid references public.agents (id) on delete set null,
  metadata               jsonb not null default '{}'::jsonb,
  created_at             timestamptz not null default now()
);

create index kpi_measurements_kpi_id_measured_at_idx on public.kpi_measurements (kpi_id, measured_at desc);

create trigger kpi_measurements_append_only
  before update or delete on public.kpi_measurements
  for each row execute function private.prevent_mutation();

-- -----------------------------------------------------------------------------
-- reports : rapports produits par les agents
-- -----------------------------------------------------------------------------
create table public.reports (
  id                uuid primary key default gen_random_uuid(),
  report_type       public.report_type not null,
  status            public.report_status not null default 'draft',
  title             text not null,
  summary           text,
  content           text,
  data              jsonb not null default '{}'::jsonb,
  storage_path      text,
  department_id     uuid references public.departments (id) on delete restrict,
  author_agent_id   uuid references public.agents (id) on delete restrict,
  mission_id        uuid references public.missions (id) on delete set null,
  period_start      date,
  period_end        date,
  published_at      timestamptz,
  read_at           timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint reports_period_valid check (period_end is null or period_start is null or period_end >= period_start),
  constraint reports_published_consistent check ((status = 'draft') = (published_at is null))
);

create index reports_published_idx on public.reports (published_at desc) where status = 'published';
create index reports_type_period_idx on public.reports (report_type, period_start desc);
create index reports_department_id_idx on public.reports (department_id);
create index reports_author_agent_id_idx on public.reports (author_agent_id);
create index reports_unread_idx on public.reports (published_at desc) where status = 'published' and read_at is null;

create trigger reports_set_updated_at
  before update on public.reports
  for each row execute function private.set_updated_at();

-- -----------------------------------------------------------------------------
-- notifications : alertes et informations adressées à un utilisateur
-- -----------------------------------------------------------------------------
create table public.notifications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users (id) on delete cascade,
  type          public.notification_type not null,
  severity      public.severity not null default 'info',
  title         text not null,
  body          text,
  link_path     text check (link_path is null or link_path like '/%'),
  entity_type   text,
  entity_id     uuid,
  read_at       timestamptz,
  created_at    timestamptz not null default now()
);

create index notifications_user_unread_idx on public.notifications (user_id, created_at desc) where read_at is null;
create index notifications_user_created_at_idx on public.notifications (user_id, created_at desc);
