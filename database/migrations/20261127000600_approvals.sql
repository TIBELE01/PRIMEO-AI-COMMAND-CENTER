-- =============================================================================
-- 0600 — Demandes de validation (Approval Center)
-- =============================================================================

create sequence public.approval_reference_seq;

create table public.approval_requests (
  id                         uuid primary key default gen_random_uuid(),
  reference                  text not null unique
                               default 'V-' || to_char(now(), 'YYYY') || '-'
                                       || lpad(nextval('public.approval_reference_seq')::text, 6, '0'),
  requested_by_agent_id      uuid not null references public.agents (id) on delete restrict,
  mission_id                 uuid references public.missions (id) on delete restrict,
  capability_id              uuid references public.capabilities (id) on delete restrict,
  previous_request_id        uuid references public.approval_requests (id) on delete restrict,
  authorization_level        public.authorization_level not null check (authorization_level >= 2),
  title                      text not null,
  summary                    text not null,
  rationale                  text,
  proposed_action            jsonb not null,
  proposed_action_hash       text not null,
  status                     public.approval_status not null default 'pending',
  decided_by_user_id         uuid references public.users (id) on delete restrict,
  decided_at                 timestamptz,
  decision_comment           text,
  expires_at                 timestamptz,
  executed_at                timestamptz,
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now(),
  constraint approval_requests_decision_complete check (
    status not in ('approved', 'rejected', 'changes_requested', 'executed')
    or (decided_by_user_id is not null and decided_at is not null)
  ),
  constraint approval_requests_pending_undecided
    check (status <> 'pending' or (decided_by_user_id is null and decided_at is null)),
  constraint approval_requests_changes_need_comment
    check (status <> 'changes_requested' or decision_comment is not null),
  constraint approval_requests_executed_consistent
    check ((status = 'executed') = (executed_at is not null))
);

create index approval_requests_pending_idx on public.approval_requests (created_at) where status = 'pending';
create index approval_requests_agent_idx on public.approval_requests (requested_by_agent_id, created_at desc);
create index approval_requests_mission_id_idx on public.approval_requests (mission_id);

create trigger approval_requests_set_updated_at
  before update on public.approval_requests
  for each row execute function private.set_updated_at();

-- Calcule l'empreinte de l'action proposée : l'action exécutée devra correspondre exactement
-- à celle que le PDG a approuvée.
create function private.approval_hash_proposed_action()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.proposed_action_hash := encode(extensions.digest(new.proposed_action::text, 'sha256'), 'hex');
  return new;
end;
$$;

create trigger approval_requests_hash_on_insert
  before insert on public.approval_requests
  for each row execute function private.approval_hash_proposed_action();

-- Garantit l'intégrité de la demande et la validité des transitions de statut.
create function private.approval_guard_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (new.requested_by_agent_id, new.mission_id, new.capability_id, new.authorization_level,
      new.proposed_action, new.proposed_action_hash, new.previous_request_id, new.created_at)
     is distinct from
     (old.requested_by_agent_id, old.mission_id, old.capability_id, old.authorization_level,
      old.proposed_action, old.proposed_action_hash, old.previous_request_id, old.created_at) then
    raise exception 'Le contenu d''une demande de validation ne peut pas être modifié après sa création.'
      using errcode = 'insufficient_privilege';
  end if;

  if new.status is distinct from old.status and not (
       (old.status = 'pending'
         and new.status in ('approved', 'rejected', 'changes_requested', 'expired', 'cancelled'))
       or (old.status = 'approved' and new.status in ('executed', 'cancelled'))
     ) then
    raise exception 'Transition de statut interdite : % → %.', old.status, new.status
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger approval_requests_guard_update
  before update on public.approval_requests
  for each row execute function private.approval_guard_update();
