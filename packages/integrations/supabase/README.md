# @primeo/integrations/supabase

Accès typé à la base Supabase du Command Center.

| Fichier             | Rôle                                                                         |
| ------------------- | ---------------------------------------------------------------------------- |
| `database.types.ts` | Types **générés** depuis le schéma (ne pas modifier à la main)               |
| `clients.ts`        | `createUserClient` (RLS appliquée) et `createServiceClient` (clé secrète)    |
| `query.ts`          | `unwrap` / `unwrapOne` : transforment `{ data, error }` en données ou erreur |
| `errors.ts`         | `DatabaseError`, `NotFoundError`                                             |

## Quel client utiliser ?

| Situation                                            | Client                                      | RLS        |
| ---------------------------------------------------- | ------------------------------------------- | ---------- |
| Répondre à une requête du PDG (API)                  | `createUserClient`                          | appliquée  |
| Écritures métier, traitements système (API, workers) | `createServiceClient`                       | contournée |
| Interface web (session, temps réel)                  | clients de `apps/web/src/services/supabase` | appliquée  |

Règle : on n'utilise le client de service qu'en connaissance de cause, et jamais dans du code
exécuté par le navigateur (la clé secrète n'y est d'ailleurs jamais disponible).

## Régénérer les types

Après chaque migration appliquée au projet Supabase :

```bash
npx supabase gen types typescript --project-id gidnykqxuwmalixuxbck > packages/integrations/supabase/database.types.ts
```

(ou via l'outil MCP Supabase `generate_typescript_types`), puis ré-ajouter l'en-tête du fichier.
