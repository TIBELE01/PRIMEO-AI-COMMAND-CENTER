# Primeo AI Command Center

Siège social numérique de Primeo : l'application privée depuis laquelle le PDG dirige, supervise
et coordonne une équipe de directeurs IA, sous une **autonomie contrôlée** (permissions,
validations humaines, traçabilité complète).

> Projet indépendant de la plateforme immobilière Primeo : dépôt, base de données et déploiement distincts.
> Cahier des charges : [`Contexte.MD`](./Contexte.MD).

## État du projet

**Phase 0 — structure du dépôt.** Aucun module métier n'est encore implémenté.

## Arborescence

```
.
├── apps/
│   ├── web/              Frontend : interface du PDG (Next.js) — dashboard et 8 modules
│   ├── backend/          Backend — API : point d'entrée unique des opérations (Fastify)
│   └── worker/           Backend — exécution 24/7 : file de tâches, planification, agents
├── packages/
│   ├── domain/           Modèle métier pur (missions, approbations, niveaux…)
│   ├── governance/       Garde-fou : permissions, niveaux 1/2/3, approbations, audit
│   ├── agent-runtime/    Boucle agent, mémoire, délégation, collaboration
│   ├── llm/              Abstraction multi-fournisseurs d'IA (OpenAI, Anthropic)
│   ├── tools/            Outils utilisables par les agents
│   ├── integrations/     Connecteurs Zoho, n8n, ElevenLabs, MCP
│   ├── db/               Accès Supabase et types générés
│   ├── config/           Variables d'environnement validées
│   ├── observability/    Logs et traces techniques
│   ├── tsconfig/         Configurations TypeScript partagées
│   └── eslint-config/    Configuration ESLint partagée
├── catalog/              Organisation déclarative : directions, agents, politiques
├── supabase/             Migrations SQL, tests RLS, seed
├── n8n/                  Workflows d'intégration versionnés
├── infra/                Docker local et déploiement
├── scripts/              Outillage du dépôt
├── docs/                 Architecture, ADR, sécurité, runbooks, phases
└── .github/              CI, modèle de PR, Dependabot
```

Chaque dossier important contient un `README.md` qui détaille son rôle.

## Principes d'architecture

1. **La gouvernance est appliquée par le code, jamais par le modèle d'IA.** Toute action d'un
   agent est évaluée par `@primeo/governance` avant exécution.
2. **Les agents sont des données.** Ils sont définis dans `catalog/` et en base, pas codés en dur.
3. **Aucun fournisseur d'IA imposé.** Tout passe par `@primeo/llm`.
4. **Secrets centralisés.** Ils sont lus uniquement via `@primeo/config` et détenus par
   `@primeo/integrations`.
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

| Commande         | Effet                                          |
| ---------------- | ---------------------------------------------- |
| `pnpm dev`       | Lance le frontend, l'API et le worker en local |
| `pnpm build`     | Compile les applications                       |
| `pnpm lint`      | Analyse statique                               |
| `pnpm typecheck` | Vérification des types                         |
| `pnpm test`      | Tests unitaires (Vitest)                       |
| `pnpm test:e2e`  | Tests de bout en bout (Playwright)             |
| `pnpm format`    | Formatage (Prettier)                           |
