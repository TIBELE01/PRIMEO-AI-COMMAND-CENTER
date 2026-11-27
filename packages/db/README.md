# @primeo/db

Couche d'accès aux données du projet Supabase **dédié** au Command Center
(distinct de celui de la plateforme immobilière).

| Dossier         | Contenu prévu                                                                       |
| --------------- | ----------------------------------------------------------------------------------- |
| `client/`       | Fabriques de clients Supabase : navigateur, serveur (session PDG), service (worker) |
| `types/`        | `database.types.ts` généré par la CLI Supabase à partir des migrations              |
| `repositories/` | Fonctions d'accès par agrégat (missions, approbations, journaux…)                   |

Le schéma lui-même est défini dans `/supabase/migrations`, pas ici.
Le client « service » (clé secrète, contourne la RLS) n'est jamais importé côté navigateur.
