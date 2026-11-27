# @primeo/agent-system

Tout ce qui définit et fait vivre les agents IA.

| Dossier          | Rôle                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------- |
| `registry/`      | Registre des agents actifs et de leur hiérarchie (direction → directeur → sous-agents)   |
| `definitions/`   | Définitions déclaratives des agents (un fichier par agent), synchronisées en base        |
| `personalities/` | Profils de personnalité professionnelle réutilisables                                    |
| `instructions/`  | Instructions système par fonction et par direction                                       |
| `capabilities/`  | Capacités (outils) utilisables par les agents, chacune avec son niveau d'autorisation    |
| `collaboration/` | Missions multi-directeurs, réunions entre directions, échanges d'informations autorisées |
| `agent-manager/` | Cycle de vie d'un agent : exécution d'une mission, délégation, budget, limites           |

Ajouter un directeur ou un sous-agent = ajouter une définition, sans modifier le moteur.
Toute capacité est exécutée **après** validation par `@primeo/security`.
