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

> La CLI Supabase attend par défaut un dossier `supabase/`. Son raccordement à `database/`
> sera configuré lors de la mise en place de l'environnement local.
