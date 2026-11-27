# @primeo/ai-engine

Interface unique vers les modèles d'IA, quel que soit le fournisseur.

| Dossier             | Rôle                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------ |
| `providers/`        | Adaptateurs au même contrat : `openai/`, `anthropic/` (texte), `elevenlabs/` (voix)  |
| `model-router/`     | Choix du modèle par agent, repli si un fournisseur est indisponible, suivi des coûts |
| `prompts/`          | Assemblage des instructions système à partir de la configuration de l'agent          |
| `memory/`           | Mémoire courte (conversation), de travail (mission) et longue (recherche sémantique) |
| `response-handler/` | Validation des réponses structurées et extraction des demandes d'action              |

Changer le modèle d'un agent est une modification de configuration, pas de code.
