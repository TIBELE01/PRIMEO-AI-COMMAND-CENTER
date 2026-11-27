-- =============================================================================
-- 0400 — Gouvernance : capacités (outils) et permissions des agents
-- =============================================================================

-- -----------------------------------------------------------------------------
-- capabilities : actions qu'un agent peut demander à exécuter (outils)
-- -----------------------------------------------------------------------------
create table public.capabilities (
  id                             uuid primary key default gen_random_uuid(),
  slug                           text not null unique check (slug ~ '^[a-z0-9]+([._-][a-z0-9]+)*$'),
  name                           text not null,
  description                    text not null,
  category                       text not null,
  integration_id                 uuid references public.integrations (id) on delete restrict,
  default_authorization_level    public.authorization_level not null,
  input_schema                   jsonb not null default '{}'::jsonb,
  is_enabled                     boolean not null default true,
  created_at                     timestamptz not null default now(),
  updated_at                     timestamptz not null default now(),
  constraint capabilities_input_schema_is_object check (jsonb_typeof(input_schema) = 'object')
);

create index capabilities_integration_id_idx on public.capabilities (integration_id);

create trigger capabilities_set_updated_at
  before update on public.capabilities
  for each row execute function private.set_updated_at();

-- -----------------------------------------------------------------------------
-- agent_permissions : capacités accordées à chaque agent (moindre privilège)
-- Sans ligne active ici, un agent n'a PAS accès à la capacité.
-- -----------------------------------------------------------------------------
create table public.agent_permissions (
  id                    uuid primary key default gen_random_uuid(),
  agent_id              uuid not null references public.agents (id) on delete cascade,
  capability_id         uuid not null references public.capabilities (id) on delete cascade,
  authorization_level   public.authorization_level not null,
  constraints           jsonb not null default '{}'::jsonb,
  granted_by_user_id    uuid not null references public.users (id) on delete restrict,
  granted_at            timestamptz not null default now(),
  expires_at            timestamptz,
  revoked_at            timestamptz,
  revoked_by_user_id    uuid references public.users (id) on delete restrict,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint agent_permissions_constraints_is_object check (jsonb_typeof(constraints) = 'object'),
  constraint agent_permissions_revocation_complete
    check ((revoked_at is null) = (revoked_by_user_id is null))
);

-- Une seule permission active par couple agent / capacité.
create unique index agent_permissions_active_unique_idx
  on public.agent_permissions (agent_id, capability_id)
  where revoked_at is null;
create index agent_permissions_capability_id_idx on public.agent_permissions (capability_id);

create trigger agent_permissions_set_updated_at
  before update on public.agent_permissions
  for each row execute function private.set_updated_at();

-- Une permission ne peut jamais être PLUS permissive que le niveau par défaut de la capacité
-- (ex. une capacité de niveau 2 ne peut pas être accordée en niveau 1).
create function private.enforce_permission_level()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  default_level smallint;
begin
  select c.default_authorization_level into default_level
  from public.capabilities c
  where c.id = new.capability_id;

  if new.authorization_level < default_level then
    raise exception
      'Permission refusée : niveau % plus permissif que le niveau minimal % de la capacité.',
      new.authorization_level, default_level
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger agent_permissions_enforce_level
  before insert or update of authorization_level, capability_id on public.agent_permissions
  for each row execute function private.enforce_permission_level();
