# @primeo/eslint-config

Configuration ESLint (flat config) partagée.

- `primeoRules` (export nommé) : règles maison seules, utilisées par `apps/web` en complément de `eslint-config-next`.

- `base.mjs` : règles JavaScript + TypeScript communes.

La configuration spécifique à Next.js est déclarée directement dans `apps/web/eslint.config.mjs`,
qui étend cette base.
