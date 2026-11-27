# @primeo/api — API du Command Center (backend)

Serveur **Fastify** (Node.js, TypeScript). Point d'entrée **unique** de toutes les opérations :
le frontend, n8n et les futurs clients (application mobile, plateforme Primeo, partenaires)
passent par lui.

## Organisation de `src/`

| Élément       | Rôle                                                                                                      |
| ------------- | --------------------------------------------------------------------------------------------------------- |
| `main.ts`     | Démarrage du serveur                                                                                      |
| `config/`     | Configuration de l'API (port, CORS, limites) validée au démarrage                                         |
| `middleware/` | Traitements transverses : journalisation des requêtes, en-têtes de sécurité, limitation de débit, erreurs |
| `guards/`     | Contrôles d'accès par route : PDG authentifié (MFA), signature des webhooks n8n                           |
| `modules/`    | Un dossier par domaine fonctionnel (routes, validation des entrées, appel aux paquets)                    |

## Modules

| Module            | Périmètre                                                             |
| ----------------- | --------------------------------------------------------------------- |
| `authentication/` | Connexion, session, double authentification                           |
| `users/`          | Comptes humains (le PDG aujourd'hui, d'autres rôles demain)           |
| `organization/`   | Paramètres de l'entreprise, vue d'ensemble pour l'Executive Dashboard |
| `departments/`    | Directions et leur hiérarchie                                         |
| `agents/`         | Directeurs et sous-agents IA : configuration, historique              |
| `missions/`       | Mission Control : création, attribution, suivi, résultats             |
| `communication/`  | Communication Center : conversations PDG ↔ agents, multi-directeurs   |
| `approvals/`      | Approval Center : approuver, refuser, demander une modification       |
| `performance/`    | Objectifs et indicateurs par agent et par direction                   |
| `reports/`        | Rapports quotidiens, hebdomadaires, mensuels et thématiques           |
| `notifications/`  | Alertes et notifications au PDG                                       |
| `audit/`          | Activity Logs : consultation du journal d'activité (lecture seule)    |

## Règles

- Aucune règle métier dans les routes : elles délèguent aux paquets `@primeo/*`.
- Toute action d'agent passe par `@primeo/security`.
- L'API n'exécute jamais un agent pendant une requête : elle crée une tâche, que `apps/workers` traite.
