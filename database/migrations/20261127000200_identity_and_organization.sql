-- =============================================================================
-- 0200 — Utilisateurs, directions et agents IA
-- =============================================================================

-- -----------------------------------------------------------------------------
-- users : comptes humains, liés à Supabase Auth (auth.users)
-- -----------------------------------------------------------------------------
create table public.users (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text not null unique,
  full_name     text not null,
  role          public.user_role not null default 'observer',
  mfa_required  boolean not null default true,
  is_active     boolean not null default true,
  last_seen_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger users_set_updated_at
  before update on public.users
  for each row execute function private.set_updated_at();

-- -----------------------------------------------------------------------------
-- departments : directions de l'entreprise (hiérarchie possible)
-- -----------------------------------------------------------------------------
create table public.departments (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name           text not null,
  description    text,
  parent_id      uuid references public.departments (id) on delete restrict,
  display_order  smallint not null default 0,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint departments_not_own_parent check (parent_id is null or parent_id <> id)
);

create index departments_parent_id_idx on public.departments (parent_id);

create trigger departments_set_updated_at
  before update on public.departments
  for each row execute function private.set_updated_at();

-- -----------------------------------------------------------------------------
-- agents : directeurs et sous-agents IA
-- -----------------------------------------------------------------------------
create table public.agents (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  department_id         uuid not null references public.departments (id) on delete restrict,
  supervisor_agent_id   uuid references public.agents (id) on delete restrict,
  kind                  public.agent_kind not null,
  status                public.agent_status not null default 'draft',
  display_name          text not null,
  title                 text not null,
  personality           text,
  system_instructions   text not null,
  responsibilities      text[] not null default '{}',
  model_provider        public.ai_model_provider not null,
  model_name            text not null,
  model_settings        jsonb not null default '{}'::jsonb,
  max_delegation_depth  smallint not null default 2 check (max_delegation_depth between 0 and 5),
  monthly_budget_usd    numeric(12, 2) check (monthly_budget_usd is null or monthly_budget_usd >= 0),
  avatar_url            text,
  config_version        integer not null default 1,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint agents_not_own_supervisor check (supervisor_agent_id is null or supervisor_agent_id <> id),
  constraint agents_model_settings_is_object check (jsonb_typeof(model_settings) = 'object')
);

create index agents_department_id_idx on public.agents (department_id);
create index agents_supervisor_agent_id_idx on public.agents (supervisor_agent_id);
create index agents_status_idx on public.agents (status);

-- Un seul directeur actif (non retiré) par direction.
create unique index agents_one_director_per_department_idx
  on public.agents (department_id)
  where kind = 'director' and status <> 'retired';

create trigger agents_set_updated_at
  before update on public.agents
  for each row execute function private.set_updated_at();

-- Incrémente la version de configuration dès qu'un élément de comportement change.
create function private.bump_agent_config_version()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (new.system_instructions, new.personality, new.responsibilities, new.model_provider,
      new.model_name, new.model_settings, new.max_delegation_depth)
     is distinct from
     (old.system_instructions, old.personality, old.responsibilities, old.model_provider,
      old.model_name, old.model_settings, old.max_delegation_depth) then
    new.config_version := old.config_version + 1;
  end if;
  return new;
end;
$$;

create trigger agents_bump_config_version
  before update on public.agents
  for each row execute function private.bump_agent_config_version();
