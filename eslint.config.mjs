// Configuration ESLint de tout le dépôt (flat config).
// apps/web possède sa propre configuration, qui ajoute les règles Next.js.
import js from "@eslint/js";
import tseslint from "typescript-eslint";

// Règles maison, réutilisées par apps/web/eslint.config.mjs.
export const primeoRules = {
  rules: {
    "@typescript-eslint/consistent-type-imports": "error",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "no-console": ["warn", { allow: ["warn", "error"] }],
  },
};

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/coverage/**",
      "**/.turbo/**",
      "apps/web/**",
      "tests/e2e/playwright-report/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  primeoRules,
];
