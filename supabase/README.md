# supabase/

Projet Supabase **dédié** au Command Center, géré avec la CLI Supabase (`supabase init` complétera
`config.toml` lors de la mise en place de l'environnement local).

| Élément       | Rôle                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------ |
| `migrations/` | Migrations SQL versionnées : **seule** source de vérité du schéma (tables, RLS, fonctions) |
| `tests/`      | Tests pgTAP, notamment des politiques RLS et de l'immuabilité du journal d'audit           |
| `functions/`  | Edge Functions, uniquement si un besoin précis le justifie                                 |
| `seed.sql`    | Données de développement local                                                             |

## Règles

- Aucune modification du schéma hors migration.
- RLS activée sur **toutes** les tables, sans exception.
- Le journal d'activité est en ajout seul (aucune mise à jour ni suppression possible).
- Après chaque migration, régénérer `packages/db/src/types/database.types.ts`.
