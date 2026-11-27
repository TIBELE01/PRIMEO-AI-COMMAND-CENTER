# @primeo/llm

Interface unique pour dialoguer avec les modèles d'IA, quel que soit le fournisseur.

| Dossier      | Rôle                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| `providers/` | Adaptateurs par fournisseur (`openai/`, `anthropic/`), même contrat commun |
| `routing/`   | Choix du modèle par agent, repli en cas d'indisponibilité, suivi des coûts |

Les agents ne connaissent que l'interface commune : changer le modèle d'un agent est une
modification de configuration, pas de code.
