# @primeo/tsconfig

Configurations TypeScript partagées par tout le monorepo.

| Fichier        | Usage                                                          |
| -------------- | -------------------------------------------------------------- |
| `base.json`    | Règles strictes communes (strict, `noUncheckedIndexedAccess`…) |
| `library.json` | Paquets internes de `packages/*`                               |
| `node.json`    | Processus Node (`apps/backend`, `apps/worker`, scripts)        |
| `nextjs.json`  | Application Next.js (`apps/web`)                               |

Toute modification ici affecte l'ensemble du dépôt : à faire avec prudence et via une revue.
