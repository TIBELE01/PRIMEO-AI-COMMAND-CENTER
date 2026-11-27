# @primeo/ai-engine

Interface unique vers les modèles d'IA (OpenAI, Anthropic, DeepSeek…). Serveur uniquement.
Documentation complète : [`docs/architecture/ai-engine.md`](../../docs/architecture/ai-engine.md).

| Dossier / fichier                | Rôle                                                                        |
| -------------------------------- | --------------------------------------------------------------------------- |
| `types.ts`, `errors.ts`          | Contrat commun et erreurs normalisées                                       |
| `providers/anthropic/`           | Claude, via le SDK officiel `@anthropic-ai/sdk`                             |
| `providers/openai-compatible/`   | Toute API « Chat Completions », via le SDK officiel `openai`                |
| `providers/openai/`, `deepseek/` | Fabriques des fournisseurs OpenAI et DeepSeek                               |
| `providers/elevenlabs/`          | Voix (phase ultérieure)                                                     |
| `model-router/`                  | `AIEngine` : références `fournisseur/modèle`, replis, suivi de consommation |
| `response-handler/`              | Décodage des arguments d'outils, contrôle des réponses inexploitables       |
| `prompts/`, `memory/`            | Assemblage des instructions et mémoire des agents (phases suivantes)        |

Changer le modèle d'un agent est une modification de configuration, pas de code.
