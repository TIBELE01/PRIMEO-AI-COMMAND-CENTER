# database/

Base de données PostgreSQL du projet Supabase **dédié** au Command Center (distinct de celui de la
plateforme immobilière).

| Dossier       | Contenu                                                                        |
| ------------- | ------------------------------------------------------------------------------ |
| `migrations/` | Migrations SQL versionnées et horodatées : **seule** façon de modifier la base |
| `schemas/`    | Description de référence du schéma par domaine (tables, relations, index)      |
| `seeds/`      | Données d'initialisation pour le développement local                           |
| `policies/`   | Politiques de sécurité au niveau des lignes (RLS) et droits d'accès, par table |

## Règles

- Aucune modification de la base hors migration.
- RLS activée sur **toutes** les tables.
- Le journal d'activité est en ajout seul : ni mise à jour, ni suppression.
- Après chaque migration, régénérer les types dans `packages/integrations/supabase/`.

## Tester les migrations

```bash
TEST_DATABASE_URL=postgres://postgres:postgres@127.0.0.1:54322/postgres pnpm test:integration
```

Une base jetable est créée, toutes les migrations y sont appliquées, puis les garanties du schéma
(RLS, journal infalsifiable, circuit de validation…) sont vérifiées. Il faut un PostgreSQL 16+
avec l'extension `pgvector`.

> La CLI Supabase attend par défaut un dossier `supabase/`. Son raccordement à `database/`
> sera configuré lors de la création du projet Supabase.
