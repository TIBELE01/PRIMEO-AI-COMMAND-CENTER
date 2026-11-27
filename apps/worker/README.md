# @primeo/worker — exécution 24 h/24

Processus Node.js de longue durée, déployé séparément de l'interface web. C'est lui qui fait
**réellement travailler** les agents, y compris quand le PDG n'est pas connecté.

| Dossier      | Rôle                                                                                            |
| ------------ | ----------------------------------------------------------------------------------------------- |
| `queue/`     | Consommation de la file de tâches persistante, relances avec backoff, tâches en échec           |
| `scheduler/` | Missions planifiées et rapports périodiques (quotidien, hebdomadaire, mensuel)                  |
| `jobs/`      | Gestionnaires de tâches : exécuter une mission, reprendre après validation, produire un rapport |
| `monitors/`  | Surveillance d'indicateurs et détection d'anomalies → alertes au PDG                            |

## Principes

- Chaque tâche est **idempotente** : la relancer ne produit pas deux fois le même effet.
- Toute action d'agent passe par `@primeo/governance` avant exécution.
- Une tâche en attente de validation (niveau 2) est suspendue, puis reprise après la décision du PDG.
- Le choix définitif du moteur de file de tâches fera l'objet d'un ADR (`docs/adr/`).
