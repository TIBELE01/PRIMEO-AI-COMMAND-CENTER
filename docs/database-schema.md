# Schéma de la base de données

Base **PostgreSQL** du projet Supabase dédié au Command Center (distinct de la plateforme
immobilière). Le schéma est défini **exclusivement** par les migrations de
[`database/migrations`](../database/migrations), vérifiées par les tests de
[`tests/integration/database`](../tests/integration/database).

## Sommaire

1. [Principes de conception](#1-principes-de-conception)
2. [Vue d'ensemble](#2-vue-densemble)
3. [Types communs](#3-types-communs)
4. [Identité et organisation](#4-identité-et-organisation) — `users`, `user_invitations`, `departments`, `agents`
5. [Intégrations et secrets](#5-intégrations-et-secrets) — `integrations`, `integration_secrets`
6. [Gouvernance](#6-gouvernance) — `capabilities`, `agent_permissions`
7. [Missions et exécution](#7-missions-et-exécution) — `missions`, `mission_assignments`, `mission_events`, `mission_schedules`, `jobs`
8. [Validations](#8-validations) — `approval_requests`
9. [Communication](#9-communication) — `conversations`, `conversation_participants`, `messages`
10. [Performance](#10-performance) — `objectives`, `kpis`, `kpi_measurements`
11. [Rapports et notifications](#11-rapports-et-notifications) — `reports`, `notifications`
12. [Mémoire et consommation d'IA](#12-mémoire-et-consommation-dia) — `agent_memories`, `ai_usage`
13. [Journal d'activité](#13-journal-dactivité) — `activity_logs`
14. [Sécurité d'accès (RLS)](#14-sécurité-daccès-rls)
15. [Migrations, données initiales et tests](#15-migrations-données-initiales-et-tests)
16. [Décisions et points ouverts](#16-décisions-et-points-ouverts)

---

## 1. Principes de conception

| Principe                                     | Mise en œuvre                                                                                                                                                                                                                                 |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **La base est la dernière ligne de défense** | Les règles critiques sont garanties par des contraintes et des déclencheurs, pas seulement par le code applicatif : un bogue dans l'API ne peut pas les contourner.                                                                           |
| **Écritures uniquement par le backend**      | `apps/api` et `apps/workers` écrivent avec le rôle `service_role`. Les rôles exposés au navigateur (`anon`, `authenticated`) ne peuvent **rien** écrire.                                                                                      |
| **Traçabilité inaltérable**                  | `activity_logs`, `mission_events`, `kpi_measurements` et `ai_usage` sont en **ajout seul**. Le journal d'activité est en plus **chaîné par empreintes SHA-256**.                                                                              |
| **Secrets jamais en clair**                  | Chiffrés par l'application (AES-256-GCM) avant d'atteindre la base ; illisibles par tout rôle exposé.                                                                                                                                         |
| **Historique préservé**                      | Suppressions en cascade réservées aux données dépendantes ; les entités référencées par l'historique (agents, utilisateurs, missions) sont protégées par `on delete restrict` — un agent est **retiré** (`status = 'retired'`), pas supprimé. |
| **Évolutivité**                              | Directions, agents, capacités et permissions sont des **données** : en ajouter ne demande aucune migration.                                                                                                                                   |

**Conventions**

- Tables et colonnes en `snake_case`, au pluriel pour les tables.
- Clés primaires `uuid` (`gen_random_uuid()`), sauf pour les tables à fort volume en ajout seul (`bigint` auto-incrémenté).
- Dates en `timestamptz`. `created_at` / `updated_at` sur les tables modifiables ; `updated_at` est tenu à jour par déclencheur.
- Identifiants lisibles (`slug`) en minuscules avec tirets, contrôlés par expression régulière.
- Colonnes `jsonb` contraintes à leur forme (`object` ou `array`).
- Fonctions internes dans le schéma `private`, non exposé par l'API REST de Supabase, avec `search_path` vide.

## 2. Vue d'ensemble

```mermaid
erDiagram
    users ||--o{ agent_permissions : "accorde"
    users ||--o{ missions : "crée"
    users ||--o{ approval_requests : "décide"
    users ||--o{ notifications : "reçoit"

    departments ||--o{ departments : "parent"
    departments ||--o{ agents : "rattache"
    departments ||--o{ objectives : "porte"
    departments ||--o{ kpis : "mesure"
    departments ||--o{ reports : "concerne"

    agents ||--o{ agents : "supervise"
    agents ||--o{ agent_permissions : "reçoit"
    agents ||--o{ mission_assignments : "participe"
    agents ||--o{ approval_requests : "soumet"
    agents ||--o{ agent_memories : "mémorise"
    agents ||--o{ ai_usage : "consomme"
    agents ||--o{ reports : "rédige"

    integrations ||--o{ integration_secrets : "détient"
    integrations ||--o{ capabilities : "fournit"
    capabilities ||--o{ agent_permissions : "autorise"
    capabilities ||--o{ approval_requests : "concerne"

    missions ||--o{ missions : "sous-mission"
    missions ||--o{ mission_assignments : "affecte"
    missions ||--o{ mission_events : "historise"
    missions ||--o{ jobs : "exécute"
    missions ||--o{ approval_requests : "déclenche"
    missions ||--o{ conversations : "discute"
    mission_schedules ||--o{ jobs : "planifie"

    conversations ||--o{ conversation_participants : "réunit"
    conversations ||--o{ messages : "contient"

    objectives ||--o{ kpis : "suivi par"
    kpis ||--o{ kpi_measurements : "mesuré par"

    approval_requests ||--o{ approval_requests : "version précédente"
    activity_logs }o--|| agents : "acteur"
    activity_logs }o--|| users : "acteur"
```

25 tables, réparties en 10 domaines fonctionnels.

## 3. Types communs

### Domaine `authorization_level`

Entier `smallint` contraint entre **1 et 3** :

| Niveau | Signification                                |
| ------ | -------------------------------------------- |
| 1      | Action autonome autorisée                    |
| 2      | Validation préalable du PDG requise          |
| 3      | Décision réservée à une intervention humaine |

### Types énumérés

| Type                   | Valeurs                                                                                               |
| ---------------------- | ----------------------------------------------------------------------------------------------------- |
| `user_role`            | `executive`, `administrator`, `observer`                                                              |
| `actor_type`           | `user`, `agent`, `system`, `integration`                                                              |
| `severity`             | `info`, `warning`, `critical`                                                                         |
| `agent_kind`           | `director`, `specialist`                                                                              |
| `agent_status`         | `draft`, `active`, `paused`, `retired`                                                                |
| `ai_model_provider`    | `openai`, `anthropic`, `deepseek`                                                                     |
| `mission_priority`     | `low`, `normal`, `high`, `critical`                                                                   |
| `mission_status`       | `draft`, `pending`, `in_progress`, `awaiting_approval`, `blocked`, `completed`, `failed`, `cancelled` |
| `mission_role`         | `lead`, `contributor`, `reviewer`                                                                     |
| `job_status`           | `queued`, `running`, `succeeded`, `failed`, `cancelled`                                               |
| `conversation_kind`    | `direct`, `group`, `meeting`, `mission`                                                               |
| `conversation_status`  | `open`, `archived`                                                                                    |
| `content_format`       | `markdown`, `plain`                                                                                   |
| `approval_status`      | `pending`, `approved`, `rejected`, `changes_requested`, `expired`, `cancelled`, `executed`            |
| `report_type`          | `daily`, `weekly`, `monthly`, `financial`, `commercial`, `marketing`, `operational`, `ad_hoc`         |
| `report_status`        | `draft`, `published`, `archived`                                                                      |
| `objective_status`     | `draft`, `active`, `achieved`, `missed`, `cancelled`                                                  |
| `kpi_direction`        | `higher_is_better`, `lower_is_better`, `target_is_best`                                               |
| `measurement_source`   | `system`, `agent`, `integration`, `manual`                                                            |
| `notification_type`    | `approval_required`, `alert`, `report_published`, `mission_update`, `system`                          |
| `integration_provider` | `openai`, `anthropic`, `deepseek`, `elevenlabs`, `zoho`, `n8n`, `mcp`, `email`, `other`               |
| `integration_status`   | `not_configured`, `active`, `error`, `disabled`                                                       |
| `memory_scope`         | `working`, `long_term`                                                                                |
| `memory_visibility`    | `private`, `department`, `organization`                                                               |
| `activity_outcome`     | `success`, `denied`, `failed`, `pending_approval`                                                     |

Ajouter une valeur à un type énuméré se fait par migration (`alter type … add value`).

## 4. Identité et organisation

Migration : `20261127000200_identity_and_organization.sql`

### `users` — comptes humains

Prolonge `auth.users` (Supabase Auth) avec le profil et le rôle applicatif.

| Colonne                    | Type          | Contraintes                        | Description                                       |
| -------------------------- | ------------- | ---------------------------------- | ------------------------------------------------- |
| `id`                       | `uuid`        | PK, FK → `auth.users.id` (cascade) | Même identifiant que le compte d'authentification |
| `email`                    | `text`        | unique, non nul                    | Adresse de connexion                              |
| `full_name`                | `text`        | non nul                            | Nom affiché                                       |
| `role`                     | `user_role`   | défaut `observer`                  | `executive` = PDG                                 |
| `mfa_required`             | `boolean`     | défaut `true`                      | Double authentification exigée par l'API          |
| `is_active`                | `boolean`     | défaut `true`                      | Un compte désactivé perd immédiatement tout accès |
| `last_seen_at`             | `timestamptz` |                                    | Dernière activité                                 |
| `created_at`, `updated_at` | `timestamptz` |                                    |                                                   |

### `user_invitations` — invitations

Migration : `20261127001200_user_invitations.sql`. L'inscription n'est possible **que sur
invitation** : un déclencheur sur `auth.users` refuse toute création de compte sans invitation
valide, puis crée le profil `users` avec le rôle prévu et consomme l'invitation.

| Colonne                           | Type          | Contraintes                                              | Description                                                           |
| --------------------------------- | ------------- | -------------------------------------------------------- | --------------------------------------------------------------------- |
| `id`                              | `uuid`        | PK                                                       |                                                                       |
| `email`                           | `text`        | en minuscules ; une seule invitation ouverte par adresse | Adresse invitée                                                       |
| `role`                            | `user_role`   | non nul                                                  | Rôle attribué à la création du compte                                 |
| `invited_by_user_id`              | `uuid`        | FK → `users.id` (set null)                               |                                                                       |
| `expires_at`                      | `timestamptz` | défaut : +14 jours                                       |                                                                       |
| `accepted_at`, `accepted_user_id` |               | `accepted_user_id` ⇒ `accepted_at`                       | Consommation (l'invitation reste consommée si le compte est supprimé) |
| `revoked_at`                      | `timestamptz` |                                                          | Révocation                                                            |
| `created_at`                      | `timestamptz` |                                                          |                                                                       |

Index : unique partiel sur `email` (invitations ouvertes), `invited_by_user_id`, `accepted_user_id`.
Lecture réservée au dirigeant ; aucune écriture par les rôles exposés.

### `departments` — directions

| Colonne                    | Type          | Contraintes                              | Description                                     |
| -------------------------- | ------------- | ---------------------------------------- | ----------------------------------------------- |
| `id`                       | `uuid`        | PK                                       |                                                 |
| `slug`                     | `text`        | unique, format `a-z0-9-`                 | Identifiant stable (ex. `finance-comptabilite`) |
| `name`                     | `text`        | non nul                                  | Libellé                                         |
| `description`              | `text`        |                                          |                                                 |
| `parent_id`                | `uuid`        | FK → `departments.id` (restrict), ≠ `id` | Hiérarchie optionnelle (pôles, sous-directions) |
| `display_order`            | `smallint`    | défaut 0                                 | Ordre d'affichage                               |
| `is_active`                | `boolean`     | défaut `true`                            |                                                 |
| `created_at`, `updated_at` | `timestamptz` |                                          |                                                 |

Index : `parent_id`.

### `agents` — directeurs et sous-agents IA

| Colonne                    | Type                | Contraintes                               | Description                                                                                                                                       |
| -------------------------- | ------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                       | `uuid`              | PK                                        |                                                                                                                                                   |
| `slug`                     | `text`              | unique                                    | Identifiant stable                                                                                                                                |
| `department_id`            | `uuid`              | FK → `departments.id` (restrict), non nul | Direction de rattachement                                                                                                                         |
| `supervisor_agent_id`      | `uuid`              | FK → `agents.id` (restrict), ≠ `id`       | Agent superviseur (un sous-agent dépend d'un directeur)                                                                                           |
| `kind`                     | `agent_kind`        | non nul                                   | `director` ou `specialist`                                                                                                                        |
| `status`                   | `agent_status`      | défaut `draft`                            | Seuls les agents `active` exécutent des missions                                                                                                  |
| `display_name`             | `text`              | non nul                                   | Nom de l'agent                                                                                                                                    |
| `title`                    | `text`              | non nul                                   | Fonction (ex. « Directeur financier »)                                                                                                            |
| `personality`              | `text`              |                                           | Personnalité professionnelle                                                                                                                      |
| `system_instructions`      | `text`              | non nul                                   | Instructions système                                                                                                                              |
| `responsibilities`         | `text[]`            | défaut `{}`                               | Responsabilités                                                                                                                                   |
| `model_provider`           | `ai_model_provider` | non nul                                   | Fournisseur du modèle                                                                                                                             |
| `model_name`               | `text`              | non nul                                   | Modèle utilisé                                                                                                                                    |
| `model_settings`           | `jsonb` (objet)     |                                           | Paramètres (température…)                                                                                                                         |
| `max_delegation_depth`     | `smallint`          | 0 à 5, défaut 2                           | Profondeur maximale de délégation                                                                                                                 |
| `monthly_budget_usd`       | `numeric(12,2)`     | ≥ 0                                       | Budget mensuel d'IA ; `null` = non plafonné                                                                                                       |
| `avatar_url`               | `text`              |                                           |                                                                                                                                                   |
| `config_version`           | `integer`           | défaut 1                                  | **Incrémentée automatiquement** à chaque changement de comportement (instructions, personnalité, responsabilités, modèle, paramètres, délégation) |
| `created_at`, `updated_at` | `timestamptz`       |                                           |                                                                                                                                                   |

Index : `department_id`, `supervisor_agent_id`, `status`.
Index unique partiel `agents_one_director_per_department_idx` : **un seul directeur non retiré par direction**.

Les objectifs d'un agent sont dans `objectives`, ses outils autorisés dans `agent_permissions`,
sa mémoire dans `agent_memories`, son historique dans `activity_logs`, son espace de
communication dans `conversations`.

## 5. Intégrations et secrets

Migration : `20261127000300_integrations_and_secrets.sql`

### `integrations` — services externes connectés

| Colonne                    | Type                   | Contraintes             | Description                                                         |
| -------------------------- | ---------------------- | ----------------------- | ------------------------------------------------------------------- |
| `id`                       | `uuid`                 | PK                      |                                                                     |
| `slug`                     | `text`                 | unique                  | Ex. `zoho-crm`                                                      |
| `provider`                 | `integration_provider` | non nul                 | Type de service                                                     |
| `name`                     | `text`                 | non nul                 |                                                                     |
| `status`                   | `integration_status`   | défaut `not_configured` | État réel, mis à jour par les contrôles de santé                    |
| `config`                   | `jsonb` (objet)        |                         | Configuration **non secrète** (URL, centre de données, périmètres…) |
| `last_health_check_at`     | `timestamptz`          |                         | Dernier contrôle de santé                                           |
| `last_error`               | `text`                 |                         | Dernière erreur constatée                                           |
| `created_at`, `updated_at` | `timestamptz`          |                         |                                                                     |

Index : `provider`.

### `integration_secrets` — secrets chiffrés

| Colonne                    | Type          | Contraintes                                  | Description                                                              |
| -------------------------- | ------------- | -------------------------------------------- | ------------------------------------------------------------------------ |
| `id`                       | `uuid`        | PK                                           |                                                                          |
| `integration_id`           | `uuid`        | FK → `integrations.id` (cascade)             |                                                                          |
| `name`                     | `text`        | format `snake_case` ; unique par intégration | Ex. `api_key`, `refresh_token`                                           |
| `ciphertext`               | `bytea`       | non nul                                      | Secret chiffré (AES-256-GCM)                                             |
| `iv`                       | `bytea`       | 12 octets                                    | Vecteur d'initialisation, unique par chiffrement                         |
| `auth_tag`                 | `bytea`       | 16 octets                                    | Étiquette d'authentification GCM (détecte toute altération)              |
| `key_version`              | `smallint`    | ≥ 1                                          | Version de la clé maîtresse (rotation)                                   |
| `fingerprint`              | `text`        | non nul                                      | Empreinte tronquée du secret, pour vérifier une rotation sans déchiffrer |
| `expires_at`, `rotated_at` | `timestamptz` |                                              |                                                                          |
| `created_at`, `updated_at` | `timestamptz` |                                              |                                                                          |

La clé maîtresse (`SECRETS_ENCRYPTION_KEY`) n'est **jamais** stockée en base. Le chiffrement
et le déchiffrement sont faits exclusivement par `@primeo/security/secrets`. Même une copie
complète de la base ne révèle aucun secret. Aucun rôle exposé ne peut lire cette table (droit
retiré **et** aucune politique RLS).

## 6. Gouvernance

Migration : `20261127000400_governance.sql`

### `capabilities` — actions qu'un agent peut demander

| Colonne                       | Type                  | Contraintes                       | Description                                |
| ----------------------------- | --------------------- | --------------------------------- | ------------------------------------------ |
| `id`                          | `uuid`                | PK                                |                                            |
| `slug`                        | `text`                | unique, format `domaine.action`   | Ex. `finance.payment.create`               |
| `name`, `description`         | `text`                | non nul                           |                                            |
| `category`                    | `text`                | non nul                           | Regroupement (finance, marketing…)         |
| `integration_id`              | `uuid`                | FK → `integrations.id` (restrict) | Service externe utilisé, le cas échéant    |
| `default_authorization_level` | `authorization_level` | non nul                           | **Niveau minimal** exigé pour cette action |
| `input_schema`                | `jsonb` (objet)       |                                   | Schéma JSON des paramètres attendus        |
| `is_enabled`                  | `boolean`             | défaut `true`                     | Désactivation globale immédiate            |
| `created_at`, `updated_at`    | `timestamptz`         |                                   |                                            |

Index : `integration_id`.

### `agent_permissions` — capacités accordées à chaque agent

Sans ligne active dans cette table, un agent **n'a pas accès** à la capacité (moindre privilège).

| Colonne                            | Type                  | Contraintes                                     | Description                                           |
| ---------------------------------- | --------------------- | ----------------------------------------------- | ----------------------------------------------------- |
| `id`                               | `uuid`                | PK                                              |                                                       |
| `agent_id`                         | `uuid`                | FK → `agents.id` (cascade)                      |                                                       |
| `capability_id`                    | `uuid`                | FK → `capabilities.id` (cascade)                |                                                       |
| `authorization_level`              | `authorization_level` | non nul, **≥ niveau par défaut de la capacité** | Niveau applicable à cet agent                         |
| `constraints`                      | `jsonb` (objet)       |                                                 | Limites supplémentaires (montant maximal, périmètre…) |
| `granted_by_user_id`               | `uuid`                | FK → `users.id`, **non nul**                    | Seul un humain peut accorder une permission           |
| `granted_at`, `expires_at`         | `timestamptz`         |                                                 |                                                       |
| `revoked_at`, `revoked_by_user_id` |                       | renseignés ensemble                             | Révocation (la ligne est conservée pour l'historique) |
| `created_at`, `updated_at`         | `timestamptz`         |                                                 |                                                       |

Index unique partiel : **une seule permission active** par couple agent / capacité.
Index : `capability_id`.
Déclencheur `enforce_permission_level` : refuse toute permission **plus permissive** que le
niveau minimal de la capacité (une action de niveau 2 ne peut jamais être accordée en niveau 1).

## 7. Missions et exécution

Migration : `20261127000500_missions_and_jobs.sql`

### `missions`

| Colonne                                      | Type               | Contraintes                                    | Description                         |
| -------------------------------------------- | ------------------ | ---------------------------------------------- | ----------------------------------- |
| `id`                                         | `uuid`             | PK                                             |                                     |
| `reference`                                  | `text`             | unique, auto `M-AAAA-000001`                   | Référence lisible                   |
| `title`                                      | `text`             | 1 à 300 caractères                             |                                     |
| `description`                                | `text`             |                                                | Consignes détaillées                |
| `priority`                                   | `mission_priority` | défaut `normal`                                |                                     |
| `status`                                     | `mission_status`   | défaut `draft`                                 |                                     |
| `progress`                                   | `smallint`         | 0 à 100 ; 100 si terminée                      | Avancement                          |
| `parent_mission_id`                          | `uuid`             | FK → `missions.id` (restrict), ≠ `id`          | Sous-mission issue d'une délégation |
| `created_by_user_id` / `created_by_agent_id` | `uuid`             | **exactement un** des deux                     | Créateur (PDG ou agent)             |
| `due_at`                                     | `timestamptz`      |                                                | Échéance                            |
| `started_at`                                 | `timestamptz`      |                                                |                                     |
| `completed_at`                               | `timestamptz`      | renseignée **si et seulement si** statut final |                                     |
| `result_summary`                             | `text`             |                                                | Résultat transmis                   |
| `result`                                     | `jsonb`            |                                                | Résultat structuré                  |
| `created_at`, `updated_at`                   | `timestamptz`      |                                                |                                     |

Index : `(status, priority)`, `due_at` (missions non terminées), `parent_mission_id`,
`created_by_agent_id`, `created_at desc`.

### `mission_assignments` — agents affectés

Permet d'adresser une mission à **plusieurs directeurs** simultanément.

| Colonne       | Type           | Contraintes                      | Description                         |
| ------------- | -------------- | -------------------------------- | ----------------------------------- |
| `mission_id`  | `uuid`         | PK, FK → `missions.id` (cascade) |                                     |
| `agent_id`    | `uuid`         | PK, FK → `agents.id` (restrict)  |                                     |
| `role`        | `mission_role` | défaut `contributor`             | `lead`, `contributor` ou `reviewer` |
| `assigned_at` | `timestamptz`  |                                  |                                     |

Index : `agent_id`. Index unique partiel : **un seul responsable (`lead`) par mission**.

### `mission_events` — historique (ajout seul)

| Colonne                                           | Type             | Contraintes                  | Description                  |
| ------------------------------------------------- | ---------------- | ---------------------------- | ---------------------------- |
| `id`                                              | `bigint`         | PK auto                      |                              |
| `mission_id`                                      | `uuid`           | FK → `missions.id` (cascade) |                              |
| `event_type`                                      | `text`           | non nul                      | Ex. `mission.status_changed` |
| `from_status`, `to_status`                        | `mission_status` |                              | Transition                   |
| `progress`                                        | `smallint`       | 0 à 100                      |                              |
| `note`                                            | `text`           |                              |                              |
| `actor_type` + `actor_user_id` / `actor_agent_id` |                  | cohérence vérifiée           | Auteur de l'événement        |
| `created_at`                                      | `timestamptz`    |                              |                              |

Index : `(mission_id, created_at)`. Modification et suppression **interdites**.

### `mission_schedules` — missions récurrentes

| Colonne                      | Type            | Contraintes                | Description                                   |
| ---------------------------- | --------------- | -------------------------- | --------------------------------------------- |
| `id`                         | `uuid`          | PK                         |                                               |
| `name`                       | `text`          | non nul                    | Ex. « Rapport financier hebdomadaire »        |
| `agent_id`                   | `uuid`          | FK → `agents.id` (cascade) | Agent exécutant                               |
| `cron_expression`            | `text`          | non nul                    | Récurrence                                    |
| `timezone`                   | `text`          | défaut `Europe/Paris`      |                                               |
| `mission_template`           | `jsonb` (objet) | non nul                    | Modèle de la mission créée à chaque exécution |
| `is_enabled`                 | `boolean`       | défaut `true`              |                                               |
| `last_run_at`, `next_run_at` | `timestamptz`   |                            |                                               |
| `created_by_user_id`         | `uuid`          | FK → `users.id`, non nul   |                                               |
| `created_at`, `updated_at`   | `timestamptz`   |                            |                                               |

Index : `next_run_at` (planifications actives), `agent_id`.

### `jobs` — file de tâches des workers

| Colonne                                                 | Type          | Contraintes                                            | Description                                    |
| ------------------------------------------------------- | ------------- | ------------------------------------------------------ | ---------------------------------------------- |
| `id`                                                    | `uuid`        | PK                                                     |                                                |
| `job_type`                                              | `text`        | non nul                                                | Ex. `mission.execute`, `report.generate`       |
| `payload`                                               | `jsonb`       |                                                        | Paramètres (jamais de secret)                  |
| `status`                                                | `job_status`  | défaut `queued`                                        |                                                |
| `priority`                                              | `smallint`    | défaut 0                                               | Plus grand = plus prioritaire                  |
| `attempts` / `max_attempts`                             | `smallint`    | `attempts ≤ max_attempts`                              | Relances                                       |
| `run_after`                                             | `timestamptz` | défaut `now()`                                         | Exécution différée et délai entre relances     |
| `locked_at`, `locked_by`                                |               | `locked_at` renseigné **si et seulement si** `running` | Verrou du worker                               |
| `last_error`                                            | `text`        |                                                        |                                                |
| `idempotency_key`                                       | `text`        | unique                                                 | Empêche la création en double d'une même tâche |
| `mission_id`                                            | `uuid`        | FK → `missions.id` (set null)                          |                                                |
| `schedule_id`                                           | `uuid`        | FK → `mission_schedules.id` (set null)                 |                                                |
| `created_at`, `started_at`, `finished_at`, `updated_at` | `timestamptz` |                                                        |                                                |

Index partiel de dépilement `(priority desc, run_after) where status = 'queued'`, index des
échecs `finished_at desc where status = 'failed'`, `mission_id`.
Les workers dépileront avec `select … for update skip locked`, ce qui permet plusieurs workers en parallèle sans double exécution.

## 8. Validations

Migration : `20261127000600_approvals.sql`

### `approval_requests` — décisions soumises au PDG

| Colonne                            | Type                  | Contraintes                                  | Description                                           |
| ---------------------------------- | --------------------- | -------------------------------------------- | ----------------------------------------------------- |
| `id`                               | `uuid`                | PK                                           |                                                       |
| `reference`                        | `text`                | unique, auto `V-AAAA-000001`                 |                                                       |
| `requested_by_agent_id`            | `uuid`                | FK → `agents.id`, non nul                    | Agent demandeur                                       |
| `mission_id`                       | `uuid`                | FK → `missions.id`                           | Mission concernée                                     |
| `capability_id`                    | `uuid`                | FK → `capabilities.id`                       | Action concernée                                      |
| `previous_request_id`              | `uuid`                | FK → `approval_requests.id`                  | Version précédente après une demande de modification  |
| `authorization_level`              | `authorization_level` | **≥ 2**                                      |                                                       |
| `title`, `summary`                 | `text`                | non nul                                      | Présentation au PDG                                   |
| `rationale`                        | `text`                |                                              | Justification de l'agent                              |
| `proposed_action`                  | `jsonb`               | non nul, **non modifiable**                  | Action exacte qui sera exécutée si elle est approuvée |
| `proposed_action_hash`             | `text`                | calculé automatiquement                      | Empreinte SHA-256 de l'action                         |
| `status`                           | `approval_status`     | défaut `pending`                             |                                                       |
| `decided_by_user_id`, `decided_at` |                       | obligatoires si décidée, vides si en attente |                                                       |
| `decision_comment`                 | `text`                | **obligatoire** pour `changes_requested`     |                                                       |
| `expires_at`                       | `timestamptz`         |                                              | Expiration de la demande                              |
| `executed_at`                      | `timestamptz`         | renseignée **si et seulement si** `executed` |                                                       |
| `created_at`, `updated_at`         | `timestamptz`         |                                              |                                                       |

Index : demandes en attente `(created_at) where status = 'pending'`,
`(requested_by_agent_id, created_at desc)`, `mission_id`.

**Garanties de la base**

- L'empreinte de l'action est calculée à l'insertion ; au moment de l'exécution, l'API vérifiera
  que l'action exécutée correspond exactement à cette empreinte.
- Le contenu d'une demande (agent, action, niveau, mission…) **ne peut plus être modifié** après sa création.
- Seules les transitions suivantes sont acceptées :

```mermaid
stateDiagram-v2
    [*] --> pending
    pending --> approved
    pending --> rejected
    pending --> changes_requested
    pending --> expired
    pending --> cancelled
    approved --> executed
    approved --> cancelled
```

Une demande de modification aboutit à une **nouvelle** demande liée par `previous_request_id` :
l'historique complet des versions est conservé.

## 9. Communication

Migration : `20261127000700_communication.sql`

### `conversations`

| Colonne                                      | Type                  | Contraintes                                                       | Description                                                                                                |
| -------------------------------------------- | --------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `id`                                         | `uuid`                | PK                                                                |                                                                                                            |
| `kind`                                       | `conversation_kind`   | non nul                                                           | `direct` (PDG ↔ un agent), `group` (plusieurs directeurs), `meeting` (réunion entre directions), `mission` |
| `title`                                      | `text`                |                                                                   |                                                                                                            |
| `status`                                     | `conversation_status` | défaut `open`                                                     |                                                                                                            |
| `mission_id`                                 | `uuid`                | FK → `missions.id` (set null) ; obligatoire si `kind = 'mission'` |                                                                                                            |
| `created_by_user_id` / `created_by_agent_id` | `uuid`                | exactement un                                                     |                                                                                                            |
| `last_message_at`                            | `timestamptz`         | mis à jour automatiquement                                        | Tri des conversations                                                                                      |
| `created_at`, `updated_at`                   | `timestamptz`         |                                                                   |                                                                                                            |

Index : `last_message_at desc`, `mission_id`.

### `conversation_participants`

| Colonne                | Type          | Contraintes                       | Description                 |
| ---------------------- | ------------- | --------------------------------- | --------------------------- |
| `id`                   | `uuid`        | PK                                |                             |
| `conversation_id`      | `uuid`        | FK → `conversations.id` (cascade) |                             |
| `user_id` / `agent_id` | `uuid`        | exactement un                     | Participant humain ou agent |
| `joined_at`, `left_at` | `timestamptz` |                                   |                             |

Index uniques partiels : un utilisateur et un agent ne figurent qu'une fois par conversation.
Index : `agent_id`, `user_id`.

### `messages`

| Colonne                                              | Type              | Contraintes                       | Description                                         |
| ---------------------------------------------------- | ----------------- | --------------------------------- | --------------------------------------------------- |
| `id`                                                 | `uuid`            | PK                                |                                                     |
| `conversation_id`                                    | `uuid`            | FK → `conversations.id` (cascade) |                                                     |
| `sender_type` + `sender_user_id` / `sender_agent_id` |                   | cohérence vérifiée                | Un agent ne peut pas se faire passer pour un humain |
| `reply_to_message_id`                                | `uuid`            | FK → `messages.id` (set null)     | Réponse à un message                                |
| `content`                                            | `text`            | non nul                           |                                                     |
| `content_format`                                     | `content_format`  | défaut `markdown`                 |                                                     |
| `attachments`                                        | `jsonb` (tableau) |                                   | Références de fichiers (Supabase Storage)           |
| `metadata`                                           | `jsonb` (objet)   |                                   | Modèle utilisé, jetons, etc.                        |
| `created_at`, `edited_at`                            | `timestamptz`     |                                   |                                                     |

Index : `(conversation_id, created_at)`, `sender_agent_id`.
Déclencheur : met à jour `conversations.last_message_at` à chaque nouveau message.

## 10. Performance

Migration : `20261127000800_performance_reports_notifications.sql`

### `objectives`

| Colonne                      | Type               | Contraintes       | Description                      |
| ---------------------------- | ------------------ | ----------------- | -------------------------------- |
| `id`                         | `uuid`             | PK                |                                  |
| `agent_id` / `department_id` | `uuid`             | **exactement un** | Objectif individuel ou collectif |
| `title`, `description`       | `text`             |                   |                                  |
| `status`                     | `objective_status` | défaut `draft`    |                                  |
| `period_start`, `period_end` | `date`             | fin ≥ début       | Période                          |
| `created_at`, `updated_at`   | `timestamptz`      |                   |                                  |

Index : `agent_id`, `department_id`, `(period_start, period_end)`.

### `kpis` — indicateurs

| Colonne                                     | Type            | Contraintes                     | Description                      |
| ------------------------------------------- | --------------- | ------------------------------- | -------------------------------- |
| `id`                                        | `uuid`          | PK                              |                                  |
| `slug`                                      | `text`          | unique                          | Ex. `commercial.leads_qualified` |
| `name`, `description`                       | `text`          |                                 |                                  |
| `unit`                                      | `text`          | non nul                         | `EUR`, `%`, `count`…             |
| `direction`                                 | `kpi_direction` | non nul                         | Sens d'amélioration              |
| `target_value`                              | `numeric`       | obligatoire si `target_is_best` | Cible                            |
| `department_id`, `agent_id`, `objective_id` | `uuid`          | FK                              | Rattachements                    |
| `is_active`                                 | `boolean`       |                                 |                                  |
| `created_at`, `updated_at`                  | `timestamptz`   |                                 |                                  |

Index : `department_id`, `agent_id`, `objective_id`.

### `kpi_measurements` — mesures (ajout seul)

| Colonne                | Type                 | Contraintes                 | Description          |
| ---------------------- | -------------------- | --------------------------- | -------------------- |
| `id`                   | `bigint`             | PK auto                     |                      |
| `kpi_id`               | `uuid`               | FK → `kpis.id` (cascade)    |                      |
| `value`                | `numeric`            | non nul                     |                      |
| `measured_at`          | `timestamptz`        | non nul                     | Date de la mesure    |
| `source`               | `measurement_source` | non nul                     | Origine de la donnée |
| `recorded_by_agent_id` | `uuid`               | FK → `agents.id` (set null) |                      |
| `metadata`             | `jsonb`              |                             |                      |
| `created_at`           | `timestamptz`        |                             |                      |

Index : `(kpi_id, measured_at desc)`. Les mesures ne peuvent pas être modifiées a posteriori : une
correction s'enregistre comme une nouvelle mesure.

## 11. Rapports et notifications

Migration : `20261127000800_performance_reports_notifications.sql`

### `reports`

| Colonne                                          | Type            | Contraintes                           | Description                                |
| ------------------------------------------------ | --------------- | ------------------------------------- | ------------------------------------------ |
| `id`                                             | `uuid`          | PK                                    |                                            |
| `report_type`                                    | `report_type`   | non nul                               | Quotidien, hebdomadaire, financier…        |
| `status`                                         | `report_status` | défaut `draft`                        |                                            |
| `title`, `summary`                               | `text`          |                                       |                                            |
| `content`                                        | `text`          |                                       | Corps du rapport (Markdown)                |
| `data`                                           | `jsonb`         |                                       | Données chiffrées du rapport               |
| `storage_path`                                   | `text`          |                                       | Fichier joint dans Supabase Storage (PDF…) |
| `department_id`, `author_agent_id`, `mission_id` | `uuid`          | FK                                    |                                            |
| `period_start`, `period_end`                     | `date`          | fin ≥ début                           | Période couverte                           |
| `published_at`                                   | `timestamptz`   | vide **si et seulement si** brouillon |                                            |
| `read_at`                                        | `timestamptz`   |                                       | Lu par le PDG                              |
| `created_at`, `updated_at`                       | `timestamptz`   |                                       |                                            |

Index : rapports publiés `published_at desc`, non lus, `(report_type, period_start desc)`,
`department_id`, `author_agent_id`.

### `notifications`

| Colonne                    | Type                | Contraintes                      | Description                             |
| -------------------------- | ------------------- | -------------------------------- | --------------------------------------- |
| `id`                       | `uuid`              | PK                               |                                         |
| `user_id`                  | `uuid`              | FK → `users.id` (cascade)        | Destinataire                            |
| `type`                     | `notification_type` | non nul                          |                                         |
| `severity`                 | `severity`          | défaut `info`                    | Les alertes importantes sont `critical` |
| `title`, `body`            | `text`              |                                  |                                         |
| `link_path`                | `text`              | chemin interne (`/…`) uniquement | Lien vers l'écran concerné              |
| `entity_type`, `entity_id` |                     |                                  | Objet concerné (mission, validation…)   |
| `read_at`                  | `timestamptz`       |                                  |                                         |
| `created_at`               | `timestamptz`       |                                  |                                         |

Index : non lues `(user_id, created_at desc) where read_at is null`, `(user_id, created_at desc)`.

## 12. Mémoire et consommation d'IA

Migration : `20261127000900_memory_and_ai_usage.sql`

### `agent_memories` — mémoire opérationnelle

| Colonne                    | Type                | Contraintes                                               | Description                                             |
| -------------------------- | ------------------- | --------------------------------------------------------- | ------------------------------------------------------- |
| `id`                       | `uuid`              | PK                                                        |                                                         |
| `agent_id`                 | `uuid`              | FK → `agents.id` (cascade)                                | Propriétaire                                            |
| `mission_id`               | `uuid`              | FK → `missions.id` (cascade) ; obligatoire pour `working` |                                                         |
| `scope`                    | `memory_scope`      | non nul                                                   | `working` (durée de la mission) ou `long_term`          |
| `visibility`               | `memory_visibility` | défaut `private`                                          | Partage avec la direction ou toute l'organisation       |
| `content`                  | `text`              | non nul                                                   | Information mémorisée                                   |
| `embedding`                | `vector(1536)`      |                                                           | Représentation vectorielle pour la recherche sémantique |
| `importance`               | `smallint`          | 1 à 5                                                     |                                                         |
| `source`, `metadata`       |                     |                                                           | Provenance                                              |
| `expires_at`               | `timestamptz`       |                                                           | Oubli programmé                                         |
| `created_at`, `updated_at` | `timestamptz`       |                                                           |                                                         |

Index : `(agent_id, scope)`, `mission_id`, index **HNSW** (similarité cosinus) sur `embedding`.

### `ai_usage` — appels aux modèles (ajout seul)

| Colonne                         | Type                   | Contraintes   | Description  |
| ------------------------------- | ---------------------- | ------------- | ------------ |
| `id`                            | `bigint`               | PK auto       |              |
| `agent_id`, `mission_id`        | `uuid`                 | FK (set null) |              |
| `provider`                      | `integration_provider` | non nul       |              |
| `model`, `operation`            | `text`                 |               |              |
| `input_tokens`, `output_tokens` | `integer`              | ≥ 0           |              |
| `cost_usd`                      | `numeric(12,6)`        | ≥ 0           | Coût calculé |
| `latency_ms`                    | `integer`              | ≥ 0           |              |
| `succeeded`, `error_code`       |                        |               |              |
| `created_at`                    | `timestamptz`          |               |              |

Index : `(agent_id, created_at desc)`, `mission_id`, `created_at desc`.
Sert au contrôle des budgets (`agents.monthly_budget_usd`) et au Performance Center.

## 13. Journal d'activité

Migration : `20261127001000_activity_logs.sql`

### `activity_logs`

| Colonne                                              | Type                  | Contraintes             | Description                                         |
| ---------------------------------------------------- | --------------------- | ----------------------- | --------------------------------------------------- |
| `id`                                                 | `bigint`              | PK auto                 | Ordre chronologique                                 |
| `occurred_at`                                        | `timestamptz`         |                         |                                                     |
| `actor_type` + `actor_user_id` / `actor_agent_id`    |                       | cohérence vérifiée      | Qui a agi                                           |
| `action`                                             | `text`                | format `domaine.action` | Ex. `capability.executed`, `approval.decided`       |
| `outcome`                                            | `activity_outcome`    | non nul                 | `success`, `denied`, `failed`, `pending_approval`   |
| `entity_type`, `entity_id`                           |                       |                         | Objet concerné                                      |
| `mission_id`, `capability_id`, `approval_request_id` | `uuid`                | FK (restrict)           | Contexte                                            |
| `authorization_level`                                | `authorization_level` |                         | Niveau appliqué                                     |
| `details`                                            | `jsonb` (objet)       |                         | Données consultées, paramètres (jamais de secret)   |
| `request_id`                                         | `text`                |                         | Corrélation avec les journaux techniques            |
| `ip_address`                                         | `inet`                |                         |                                                     |
| `previous_hash`                                      | `text`                |                         | Empreinte de l'entrée précédente                    |
| `row_hash`                                           | `text`                | non nul                 | Empreinte SHA-256 de cette entrée + `previous_hash` |

Index : `occurred_at desc`, `(actor_agent_id, occurred_at desc)`, `(actor_user_id, occurred_at desc)`,
`(entity_type, entity_id)`, `mission_id`, `(action, occurred_at desc)`, entrées en échec ou refusées.

**Garanties**

1. **Ajout seul** : `update`, `delete` et `truncate` sont refusés, y compris pour le backend (`service_role`).
2. **Chaînage** : chaque entrée contient l'empreinte de la précédente. Les insertions sont sérialisées
   pour garantir une chaîne continue.
3. **Vérification** : `select * from private.verify_activity_logs_chain();` renvoie les entrées
   incohérentes. Une falsification faite en contournant les protections (par un administrateur de la
   base) est donc **détectée**, ce que vérifie un test automatisé.

## 14. Sécurité d'accès (RLS)

Migration : `20261127001100_row_level_security.sql`

| Rôle            | Utilisé par                   | Lecture                                                  | Écriture                       |
| --------------- | ----------------------------- | -------------------------------------------------------- | ------------------------------ |
| `service_role`  | `apps/api`, `apps/workers`    | Tout (contourne la RLS) sauf contraintes et déclencheurs | Oui, sauf tables en ajout seul |
| `authenticated` | Navigateur (session Supabase) | Limitée par la RLS (voir ci-dessous)                     | **Aucune**                     |
| `anon`          | Navigateur non connecté       | **Aucune**                                               | **Aucune**                     |

**Politiques de lecture pour `authenticated`**

| Tables                   | Règle                                                         |
| ------------------------ | ------------------------------------------------------------- |
| `users`                  | Son propre compte ; tous les comptes pour un dirigeant        |
| `user_invitations`       | Dirigeant actif uniquement                                    |
| `notifications`          | Uniquement ses propres notifications                          |
| `integration_secrets`    | **Jamais** (droit retiré et aucune politique)                 |
| Toutes les autres tables | Réservées à un dirigeant **actif** (`private.is_executive()`) |

- La RLS est activée sur toutes les tables ; la migration **échoue** si une table en est dépourvue.
- Les droits par défaut appliqués aux futures tables empêchent toute écriture des rôles exposés.
- `private.is_executive()` s'exécute avec les droits du propriétaire (`security definer`) et un
  `search_path` vide, pour éviter toute substitution d'objet.
- La lecture côté navigateur sert au temps réel (Supabase Realtime) ; toutes les autres
  opérations passent par l'API.

## 15. Migrations, données initiales et tests

| Fichier                                                | Contenu                                                                                          |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `20261127000100_extensions_and_foundations.sql`        | Extensions (`pgcrypto`, `vector`), schéma `private`, domaine, types énumérés, fonctions communes |
| `20261127000200_identity_and_organization.sql`         | `users`, `departments`, `agents`                                                                 |
| `20261127000300_integrations_and_secrets.sql`          | `integrations`, `integration_secrets`                                                            |
| `20261127000400_governance.sql`                        | `capabilities`, `agent_permissions`                                                              |
| `20261127000500_missions_and_jobs.sql`                 | `missions`, `mission_assignments`, `mission_events`, `mission_schedules`, `jobs`                 |
| `20261127000600_approvals.sql`                         | `approval_requests`                                                                              |
| `20261127000700_communication.sql`                     | `conversations`, `conversation_participants`, `messages`                                         |
| `20261127000800_performance_reports_notifications.sql` | `objectives`, `kpis`, `kpi_measurements`, `reports`, `notifications`                             |
| `20261127000900_memory_and_ai_usage.sql`               | `agent_memories`, `ai_usage`                                                                     |
| `20261127001000_activity_logs.sql`                     | `activity_logs`, chaînage et vérification                                                        |
| `20261127001100_row_level_security.sql`                | RLS, politiques, droits                                                                          |
| `20261127001200_user_invitations.sql`                  | `user_invitations`, inscription sur invitation                                                   |
| `20261127001300_foreign_key_indexes.sql`               | Index des clés étrangères restantes (conseiller Supabase)                                        |
| `20261127001400_deepseek_provider.sql`                 | DeepSeek ajouté aux fournisseurs de modèles                                                      |

**Données initiales** — `database/seeds/001_departments.sql` crée les 7 directions de Primeo
(idempotent). Aucun agent n'est créé à ce stade : leurs définitions seront établies avec vous.

**Tests** — `tests/integration/database/schema.test.ts` crée une base vierge, applique toutes les
migrations puis vérifie notamment : la liste des tables, la RLS (dirigeant, non-dirigeant,
dirigeant désactivé, anonyme, écriture interdite, secrets illisibles), l'unicité du directeur,
le versionnage des agents, le niveau des permissions, les contraintes des missions, le circuit
de validation, l'immuabilité et le chaînage du journal, la cohérence des messages et la
recherche vectorielle.

```bash
TEST_DATABASE_URL=postgres://postgres:postgres@127.0.0.1:54322/postgres pnpm test:integration
```

Sans `TEST_DATABASE_URL`, ces tests sont ignorés localement ; la CI les exécute toujours.
Le fichier `tests/integration/database/supabase-shim.sql` reproduit le strict nécessaire de
Supabase (rôles, `auth.uid()`) pour tester sur un PostgreSQL standard.

## 16. Décisions et points ouverts

| Sujet                   | Décision                                          | Justification                                                                                                                      |
| ----------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Chiffrement des secrets | Chiffrement applicatif AES-256-GCM, clé hors base | Portable, testable, indépendant du fournisseur ; une fuite de la base seule ne révèle rien. Alternative possible : Supabase Vault. |
| File de tâches          | Table `jobs` dans PostgreSQL                      | Pas de service supplémentaire ; transactions communes avec les missions ; `skip locked` suffit au volume attendu.                  |
| Journal d'activité      | Ajout seul + chaînage SHA-256                     | Exigence de traçabilité du cahier des charges ; falsification détectable.                                                          |
| Dimension des vecteurs  | 1536                                              | Compatible avec les modèles d'embedding courants ; un changement de modèle imposera une migration.                                 |
| Suppression des agents  | Retrait (`retired`) plutôt que suppression        | Préserve l'historique et l'audit.                                                                                                  |

**Points ouverts**

- **Raccordement de la CLI Supabase** au dossier `database/` (elle attend `supabase/migrations`), à faire lors de la création du projet Supabase.
- **Partitionnement** de `activity_logs` et `ai_usage` par mois si le volume le justifie.
- **Politique de conservation** des journaux (RGPD) à définir.
