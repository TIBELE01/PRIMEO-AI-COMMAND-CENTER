// Configuration ESLint racine (flat config).
// Chaque application ou paquet peut l'étendre via @primeo/eslint-config.
import base from "./packages/eslint-config/base.mjs";

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/coverage/**",
      "**/.turbo/**",
      "supabase/.temp/**",
    ],
  },
  ...base,
];
