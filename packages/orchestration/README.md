# @primeo/orchestration

Coordination des tâches et des événements du système.

| Dossier            | Rôle                                                                          |
| ------------------ | ----------------------------------------------------------------------------- |
| `n8n/`             | Client n8n : déclencher un workflow, vérifier la signature des webhooks reçus |
| `workflows/`       | Workflows n8n exportés en JSON et versionnés (`<domaine>.<action>.json`)      |
| `task-dispatcher/` | Mise en file des tâches, priorités, relances, idempotence                     |
| `event-manager/`   | Publication et abonnement aux événements internes (mission terminée, alerte…) |

n8n sert aux **intégrations** et aux automatisations mécaniques. L'orchestration des agents,
les permissions et les validations restent dans le code du Command Center.
Les identifiants de n8n ne sont jamais stockés dans les fichiers de `workflows/`.
