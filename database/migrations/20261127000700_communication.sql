-- =============================================================================
-- 0700 — Communication Center : conversations et messages
-- =============================================================================

create table public.conversations (
  id                   uuid primary key default gen_random_uuid(),
  kind                 public.conversation_kind not null,
  title                text,
  status               public.conversation_status not null default 'open',
  mission_id           uuid references public.missions (id) on delete set null,
  created_by_user_id   uuid references public.users (id) on delete restrict,
  created_by_agent_id  uuid references public.agents (id) on delete restrict,
  last_message_at      timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint conversations_single_creator
    check (num_nonnulls(created_by_user_id, created_by_agent_id) = 1),
  constraint conversations_mission_kind check (kind <> 'mission' or mission_id is not null)
);

create index conversations_last_message_at_idx on public.conversations (last_message_at desc nulls last);
create index conversations_mission_id_idx on public.conversations (mission_id);

create trigger conversations_set_updated_at
  before update on public.conversations
  for each row execute function private.set_updated_at();

-- -----------------------------------------------------------------------------
-- conversation_participants : humains et agents présents dans une conversation
-- -----------------------------------------------------------------------------
create table public.conversation_participants (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references public.conversations (id) on delete cascade,
  user_id          uuid references public.users (id) on delete cascade,
  agent_id         uuid references public.agents (id) on delete cascade,
  joined_at        timestamptz not null default now(),
  left_at          timestamptz,
  constraint conversation_participants_single_identity check (num_nonnulls(user_id, agent_id) = 1)
);

create unique index conversation_participants_user_unique_idx
  on public.conversation_participants (conversation_id, user_id) where user_id is not null;
create unique index conversation_participants_agent_unique_idx
  on public.conversation_participants (conversation_id, agent_id) where agent_id is not null;
create index conversation_participants_agent_id_idx on public.conversation_participants (agent_id);
create index conversation_participants_user_id_idx on public.conversation_participants (user_id);

-- -----------------------------------------------------------------------------
-- messages
-- -----------------------------------------------------------------------------
create table public.messages (
  id                   uuid primary key default gen_random_uuid(),
  conversation_id      uuid not null references public.conversations (id) on delete cascade,
  sender_type          public.actor_type not null,
  sender_user_id       uuid references public.users (id) on delete restrict,
  sender_agent_id      uuid references public.agents (id) on delete restrict,
  reply_to_message_id  uuid references public.messages (id) on delete set null,
  content              text not null,
  content_format       public.content_format not null default 'markdown',
  attachments          jsonb not null default '[]'::jsonb,
  metadata             jsonb not null default '{}'::jsonb,
  created_at           timestamptz not null default now(),
  edited_at            timestamptz,
  constraint messages_sender_consistent check (
    (sender_type = 'user' and sender_user_id is not null and sender_agent_id is null)
    or (sender_type = 'agent' and sender_agent_id is not null and sender_user_id is null)
    or (sender_type in ('system', 'integration') and sender_user_id is null and sender_agent_id is null)
  ),
  constraint messages_attachments_is_array check (jsonb_typeof(attachments) = 'array'),
  constraint messages_metadata_is_object check (jsonb_typeof(metadata) = 'object')
);

create index messages_conversation_id_created_at_idx on public.messages (conversation_id, created_at);
create index messages_sender_agent_id_idx on public.messages (sender_agent_id);

-- Met à jour la date du dernier message de la conversation.
create function private.touch_conversation_last_message()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  update public.conversations
     set last_message_at = new.created_at
   where id = new.conversation_id
     and (last_message_at is null or last_message_at < new.created_at);
  return new;
end;
$$;

create trigger messages_touch_conversation
  after insert on public.messages
  for each row execute function private.touch_conversation_last_message();
