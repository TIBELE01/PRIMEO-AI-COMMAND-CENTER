# @primeo/backend — API du Command Center

Serveur **Fastify** (Node.js, TypeScript). C'est le **point d'entrée unique** de toutes les
opérations métier : l'interface du PDG, n8n et les futurs clients (application mobile,
plateforme Primeo, partenaires) passent tous par lui.

## Organisation

```
src/
├── index.ts                Démarrage du serveur
├── server/                 Construction de l'application Fastify, gestion des erreurs
├── plugins/
│   ├── auth/               Vérification du jeton Supabase du PDG (MFA exigée)
│   └── security/           En-têtes de sécurité, CORS, limitation de débit
├── modules/                Une route d'API par module fonctionnel
│   ├── dashboard/          A. Executive Dashboard (agrégats)
│   ├── directors/          B. AI Directors
│   ├── communications/     C. Communication Center
│   ├── missions/           D. Mission Control
│   ├── approvals/          E. Approval Center
│   ├── performance/        F. Performance Center
│   ├── reports/            G. Reports Center
│   └── activity/           H. Activity Logs
└── webhooks/n8n/           Réception des webhooks n8n (signature vérifiée)
```

Chaque module contient ses routes, la validation des entrées (schémas) et l'appel aux paquets
`@primeo/*`. **Aucune règle métier n'est écrite dans les routes** : elles délèguent à
`@primeo/domain` et `@primeo/governance`.

## Répartition backend

| Dossier        | Rôle                                                               |
| -------------- | ------------------------------------------------------------------ |
| `apps/backend` | Répond aux requêtes (API synchrone)                                |
| `apps/worker`  | Exécute les agents et les tâches planifiées en arrière-plan (24/7) |
| `packages/*`   | Logique partagée par les deux                                      |

L'API ne fait jamais tourner un agent pendant une requête : elle crée une tâche, que le worker exécute.

## Commandes

```bash
pnpm --filter @primeo/backend dev
```
