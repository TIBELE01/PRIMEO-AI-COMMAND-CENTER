-- =============================================================================
-- 0900 — Mémoire opérationnelle des agents et consommation des modèles d'IA
-- =============================================================================

-- -----------------------------------------------------------------------------
-- agent_memories : mémoire de travail (liée à une mission) et mémoire longue
-- La dimension 1536 correspond aux modèles d'embedding de type text-embedding-3-small.
-- Changer de modèle d'embedding impose une migration de cette colonne.
-- -----------------------------------------------------------------------------
create table public.agent_memories (
  id            uuid primary key default gen_random_uuid(),
  agent_id      uuid not null references public.agents (id) on delete cascade,
  mission_id    uuid references public.missions (id) on delete cascade,
  scope         public.memory_scope not null,
  visibility    public.memory_visibility not null default 'private',
  content       text not null,
  embedding     extensions.vector(1536),
  importance    smallint not null default 3 check (importance between 1 and 5),
  source        text,
  metadata      jsonb not null default '{}'::jsonb,
  expires_at    timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint agent_memories_working_needs_mission check (scope <> 'working' or mission_id is not null)
);

create index agent_memories_agent_scope_idx on public.agent_memories (agent_id, scope);
create index agent_memories_mission_id_idx on public.agent_memories (mission_id);
create index agent_memories_embedding_idx
  on public.agent_memories using hnsw (embedding extensions.vector_cosine_ops);

create trigger agent_memories_set_updated_at
  before update on public.agent_memories
  for each row execute function private.set_updated_at();

-- -----------------------------------------------------------------------------
-- ai_usage : chaque appel à un modèle d'IA (coûts, budgets, performance)
-- -----------------------------------------------------------------------------
create table public.ai_usage (
  id              bigint generated always as identity primary key,
  agent_id        uuid references public.agents (id) on delete set null,
  mission_id      uuid references public.missions (id) on delete set null,
  provider        public.integration_provider not null,
  model           text not null,
  operation       text not null default 'completion',
  input_tokens    integer not null default 0 check (input_tokens >= 0),
  output_tokens   integer not null default 0 check (output_tokens >= 0),
  cost_usd        numeric(12, 6) not null default 0 check (cost_usd >= 0),
  latency_ms      integer check (latency_ms >= 0),
  succeeded       boolean not null,
  error_code      text,
  created_at      timestamptz not null default now()
);

create index ai_usage_agent_id_created_at_idx on public.ai_usage (agent_id, created_at desc);
create index ai_usage_mission_id_idx on public.ai_usage (mission_id);
create index ai_usage_created_at_idx on public.ai_usage (created_at desc);

create trigger ai_usage_append_only
  before update or delete on public.ai_usage
  for each row execute function private.prevent_mutation();
