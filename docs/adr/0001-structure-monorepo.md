# ADR-0001 — Structure du dépôt en monorepo

- **Statut** : accepté
- **Date** : 2026-11-27

## Contexte

Le Command Center comprend une interface web, un processus d'exécution permanent et plusieurs
briques partagées (gouvernance, modèles d'IA, outils, intégrations). Il doit rester indépendant
de la plateforme immobilière Primeo.

## Décision

- Dépôt unique (monorepo) **pnpm workspaces + Turborepo**, en TypeScript strict.
- `apps/web` (Next.js) et `apps/worker` (Node.js) déployés séparément (complété par l'ADR-0002 : `apps/backend`).
- Logique partagée dans `packages/*`, avec un sens de dépendance imposé (voir `packages/README.md`).
- La gouvernance est un paquet isolé, par lequel passe toute action d'agent.
- L'organisation des agents est déclarative (`catalog/`), pas codée en dur.
- Schéma de données uniquement via migrations Supabase (`supabase/migrations`).

## Conséquences

- Un seul outillage (lint, tests, typage) pour tout le système.
- Les frontières entre paquets rendent la gouvernance testable isolément.
- Les choix restant ouverts (moteur de file de tâches, hébergement, rôle de n8n) feront l'objet
  d'ADR dédiés.
