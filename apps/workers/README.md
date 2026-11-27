# @primeo/workers — exécution 24 h/24 (backend)

Processus Node.js de longue durée, déployé séparément de l'API. C'est lui qui fait **réellement
travailler** les agents, y compris quand le PDG n'est pas connecté.

| Dossier              | Rôle                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------ |
| `scheduled-tasks/`   | Missions planifiées et déclenchements récurrents                                     |
| `background-jobs/`   | Consommation de la file de tâches, relances avec délai croissant, tâches en échec    |
| `agent-execution/`   | Exécution d'une mission par un agent ; suspension et reprise après validation du PDG |
| `report-generation/` | Production des rapports quotidiens, hebdomadaires, mensuels et thématiques           |
| `monitoring/`        | Surveillance d'indicateurs et détection d'anomalies → alertes au PDG                 |

## Principes

- Chaque tâche est **idempotente** : la relancer ne produit pas deux fois le même effet.
- Toute action d'agent passe par `@primeo/security` avant exécution.
- Chaque exécution est tracée dans le journal d'activité.
