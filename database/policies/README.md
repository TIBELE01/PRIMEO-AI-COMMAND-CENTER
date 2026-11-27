# database/policies/

Les politiques de sécurité (Row Level Security) et les droits d'accès sont **appliqués par
migration** — seule source de vérité du schéma :
[`migrations/20261127001100_row_level_security.sql`](../migrations/20261127001100_row_level_security.sql).

## Résumé

| Rôle                          | Lecture                         | Écriture                       |
| ----------------------------- | ------------------------------- | ------------------------------ |
| `service_role` (API, workers) | Tout                            | Oui, sauf tables en ajout seul |
| `authenticated` (navigateur)  | Selon les politiques ci-dessous | Aucune                         |
| `anon`                        | Aucune                          | Aucune                         |

| Tables                | Politique de lecture pour `authenticated`        |
| --------------------- | ------------------------------------------------ |
| `users`               | Son propre compte ; tous pour un dirigeant actif |
| `notifications`       | Ses propres notifications uniquement             |
| `integration_secrets` | Jamais                                           |
| Autres tables         | Dirigeant actif uniquement                       |

Toute nouvelle politique doit être ajoutée par une **nouvelle migration** et couverte par un
test dans `tests/integration/database`. Détails : [`docs/database-schema.md`](../../docs/database-schema.md#14-sécurité-daccès-rls).
