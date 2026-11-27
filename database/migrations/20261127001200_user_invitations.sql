-- =============================================================================
-- 1200 — Invitations : l'inscription n'est possible que sur invitation
--
-- Toute création de compte dans Supabase Auth (auth.users) est refusée si l'adresse e-mail
-- ne correspond pas à une invitation valide. Le profil applicatif (public.users) est créé
-- automatiquement avec le rôle prévu par l'invitation.
-- =============================================================================

create table public.user_invitations (
  id                   uuid primary key default gen_random_uuid(),
  email                text not null check (email = lower(email) and email like '%_@_%'),
  role                 public.user_role not null,
  invited_by_user_id   uuid references public.users (id) on delete set null,
  expires_at           timestamptz not null default now() + interval '14 days',
  accepted_at          timestamptz,
  accepted_user_id     uuid references public.users (id) on delete set null,
  revoked_at           timestamptz,
  created_at           timestamptz not null default now(),
  -- accepted_user_id peut redevenir nul si le compte est supprimé : l'invitation reste consommée.
  constraint user_invitations_accepted_consistent
    check (accepted_user_id is null or accepted_at is not null)
);

-- Une seule invitation ouverte par adresse.
create unique index user_invitations_open_email_idx
  on public.user_invitations (email)
  where accepted_at is null and revoked_at is null;

create index user_invitations_invited_by_idx on public.user_invitations (invited_by_user_id);
create index user_invitations_accepted_user_idx on public.user_invitations (accepted_user_id);

alter table public.user_invitations enable row level security;
revoke all on public.user_invitations from anon;
revoke insert, update, delete, truncate on public.user_invitations from authenticated;

create policy user_invitations_select_executive on public.user_invitations
  for select to authenticated
  using ((select private.is_executive()));

-- -----------------------------------------------------------------------------
-- Création d'un compte Supabase Auth → vérification de l'invitation + profil applicatif
-- -----------------------------------------------------------------------------
create function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  invitation public.user_invitations%rowtype;
  normalized_email text := lower(new.email);
begin
  select i.* into invitation
  from public.user_invitations i
  where i.email = normalized_email
    and i.accepted_at is null
    and i.revoked_at is null
    and i.expires_at > now()
  for update;

  if not found then
    raise exception 'Inscription refusée : aucune invitation valide pour cette adresse.'
      using errcode = 'insufficient_privilege', hint = 'signup_not_invited';
  end if;

  insert into public.users (id, email, full_name, role, is_active)
  values (
    new.id,
    normalized_email,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), normalized_email),
    invitation.role,
    true
  );

  update public.user_invitations
     set accepted_at = now(), accepted_user_id = new.id
   where id = invitation.id;

  return new;
end;
$$;

revoke execute on function private.handle_new_auth_user() from public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_auth_user();
