-- =============================================================================
-- 0300 — Configuration des intégrations et secrets chiffrés
-- =============================================================================

-- -----------------------------------------------------------------------------
-- integrations : services externes connectés (configuration NON secrète)
-- -----------------------------------------------------------------------------
create table public.integrations (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  provider              public.integration_provider not null,
  name                  text not null,
  status                public.integration_status not null default 'not_configured',
  config                jsonb not null default '{}'::jsonb,
  last_health_check_at  timestamptz,
  last_error            text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint integrations_config_is_object check (jsonb_typeof(config) = 'object')
);

create index integrations_provider_idx on public.integrations (provider);

create trigger integrations_set_updated_at
  before update on public.integrations
  for each row execute function private.set_updated_at();

-- -----------------------------------------------------------------------------
-- integration_secrets : secrets chiffrés côté application (AES-256-GCM)
--
-- La base ne voit JAMAIS un secret en clair. Le chiffrement et le déchiffrement sont faits
-- exclusivement par @primeo/security/secrets, avec une clé maîtresse hors base
-- (variable SECRETS_ENCRYPTION_KEY). key_version permet la rotation de cette clé.
-- -----------------------------------------------------------------------------
create table public.integration_secrets (
  id               uuid primary key default gen_random_uuid(),
  integration_id   uuid not null references public.integrations (id) on delete cascade,
  name             text not null check (name ~ '^[a-z0-9]+(_[a-z0-9]+)*$'),
  ciphertext       bytea not null,
  iv               bytea not null check (octet_length(iv) = 12),
  auth_tag         bytea not null check (octet_length(auth_tag) = 16),
  key_version      smallint not null default 1 check (key_version >= 1),
  fingerprint      text not null,
  expires_at       timestamptz,
  rotated_at       timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint integration_secrets_unique_name unique (integration_id, name)
);

comment on column public.integration_secrets.fingerprint is
  'Empreinte SHA-256 tronquée du secret en clair : permet de vérifier une rotation sans déchiffrer.';

create trigger integration_secrets_set_updated_at
  before update on public.integration_secrets
  for each row execute function private.set_updated_at();
