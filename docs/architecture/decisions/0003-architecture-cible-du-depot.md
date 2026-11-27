# ADR-0003 — Architecture cible du dépôt

- **Statut** : accepté
- **Date** : 2026-11-27
- **Remplace** : ADR-0001, ADR-0002

## Contexte

Le PDG a défini l'organisation cible du dépôt. Elle regroupe les responsabilités par grands
domaines (moteur d'IA, système d'agents, orchestration, sécurité, intégrations, interface).

## Décision

- Monorepo **pnpm + Turborepo**, TypeScript strict.
- `apps/web` (Next.js, frontend), `apps/api` (Fastify, backend API), `apps/workers` (exécution 24/7).
- Sept paquets partagés : `shared`, `security`, `ai-engine`, `agent-system`, `orchestration`,
  `integrations`, `ui`, avec un sens de dépendance imposé (`packages/README.md`).
- Base de données dans `database/`, infrastructure dans `infrastructure/`.
- Tests centralisés dans `tests/` (unitaires, intégration, bout en bout, agents).
- Configuration partagée à la racine (`tsconfig.base.json`, `eslint.config.mjs`).

## Correspondance avec l'organisation précédente

| Avant                                         | Après                                         |
| --------------------------------------------- | --------------------------------------------- |
| `apps/backend`, `apps/worker`                 | `apps/api`, `apps/workers`                    |
| `packages/domain`, `config`                   | `packages/shared`                             |
| `packages/governance`                         | `packages/security`                           |
| `packages/llm`                                | `packages/ai-engine`                          |
| `packages/agent-runtime`, `tools`, `catalog/` | `packages/agent-system`                       |
| `n8n/`                                        | `packages/orchestration/workflows`            |
| `packages/db`, `supabase/`                    | `packages/integrations/supabase`, `database/` |
| `infra/`                                      | `infrastructure/`                             |

## Conséquences

- Les tests ne sont plus à côté du code mais dans `tests/`, organisés par type.
- `apps/web/src/pages/` est interprété par Next.js comme le Pages Router : voir `apps/web/README.md`.
- La CLI Supabase devra être configurée pour utiliser `database/`.
