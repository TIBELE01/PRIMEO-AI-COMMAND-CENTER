# @primeo/domain

Le **cœur métier** du Command Center, écrit en TypeScript pur, sans dépendance d'infrastructure
(ni base de données, ni réseau, ni fournisseur d'IA). C'est la partie la plus testée du système.

| Dossier          | Contenu prévu                                                            |
| ---------------- | ------------------------------------------------------------------------ |
| `directions/`    | Directions de l'entreprise et leur hiérarchie                            |
| `agents/`        | Directeurs et sous-agents : identité, rôle, objectifs, responsabilités   |
| `missions/`      | Missions et leur machine à états (création → validation)                 |
| `approvals/`     | Demandes de validation : approuver / refuser / demander une modification |
| `conversations/` | Fils de discussion PDG ↔ agents et agent ↔ agent                         |
| `reports/`       | Types de rapports et périodicités                                        |
| `performance/`   | Objectifs, indicateurs (KPI) et mesures                                  |
| `authorization/` | Niveaux d'autorisation 1 / 2 / 3 et leurs invariants                     |
