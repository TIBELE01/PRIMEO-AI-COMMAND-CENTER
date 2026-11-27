# Primeo AI Command Center

Siège social numérique de Primeo : l'application privée depuis laquelle le PDG dirige, supervise
et coordonne une équipe de directeurs IA, sous une **autonomie contrôlée** (permissions,
validations humaines, traçabilité complète).

> Projet indépendant de la plateforme immobilière Primeo : dépôt, base de données et déploiement distincts.
> Cahier des charges : [`Contexte.MD`](./Contexte.MD).

## État du projet

**Phase 0 — socle technique.** Le frontend, l'API et les workers démarrent et communiquent ;
aucun module métier n'est encore implémenté.

| Service  | Adresse locale               | Technologie                          |
| -------- | ---------------------------- | ------------------------------------ |
| Frontend | http://localhost:3000        | Next.js 16, React 19, Tailwind CSS 4 |
| API      | http://localhost:4000/health | Fastify 5                            |
| Workers  | (processus de fond)          | Node.js 22                           |

## Arborescence

```
.
├── apps/
│   ├── web/             Frontend : interface du PDG (Next.js)
│   ├── api/             Backend : API, point d'entrée unique des opérations (Fastify)
│   └── workers/         Backend : exécution 24/7 (agents, tâches planifiées, rapports, surveillance)
├── packages/
│   ├── ai-engine/       Fournisseurs d'IA (OpenAI, Anthropic, ElevenLabs), routage, mémoire
│   ├── agent-system/    Définitions, capacités, collaboration et cycle de vie des agents
│   ├── orchestration/   n8n, workflows, répartition des tâches, événements
│   ├── integrations/    Zoho, Supabase, MCP, e-mail, API tierces
│   ├── security/        Permissions, niveaux d'autorisation 1/2/3, règles de validation, secrets
│   ├── shared/          Types, constantes, schémas, utilitaires
│   └── ui/              Design system, composants, graphiques
├── infrastructure/      Docker, déploiement, supervision, sauvegardes
├── database/            Migrations, schémas, données initiales, politiques RLS
├── docs/                Architecture (et décisions), API, agents, gouvernance, déploiement
└── tests/               Tests unitaires, d'intégration, de bout en bout et des agents
```

Chaque dossier important contient un `README.md` qui détaille son rôle.

## Principes d'architecture

1. **La gouvernance est appliquée par le code, jamais par le modèle d'IA.** Toute action d'un
   agent est évaluée par `@primeo/security` avant exécution.
2. **Les agents sont des données.** Ajouter un agent = ajouter une définition dans `packages/agent-system`.
3. **Aucun fournisseur d'IA imposé.** Tout passe par `@primeo/ai-engine`.
4. **Secrets centralisés** dans `@primeo/security/secrets`, jamais exposés au navigateur ni aux agents.
5. **Rien de simulé.** Une fonctionnalité n'est livrée qu'opérationnelle et testée.

## Prérequis

- Node.js ≥ 22.12 (voir `.nvmrc`)
- pnpm ≥ 10 (`corepack enable`)

## Démarrage

```bash
pnpm install
```

```bash
cp .env.example .env
```

```bash
pnpm dev
```

## Commandes

| Commande         | Effet                                        |
| ---------------- | -------------------------------------------- |
| `pnpm dev`       | Lance le frontend, l'API et les workers      |
| `pnpm build`     | Compile les applications                     |
| `pnpm start`     | Lance les versions compilées                 |
| `pnpm lint`      | Analyse statique                             |
| `pnpm typecheck` | Vérification des types                       |
| `pnpm test`      | Tests unitaires, d'intégration et des agents |
| `pnpm test:e2e`  | Tests de bout en bout (Playwright)           |
| `pnpm format`    | Formatage (Prettier)                         |
