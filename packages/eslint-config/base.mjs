// Règles ESLint communes à tous les espaces de travail TypeScript.
import js from "@eslint/js";
import tseslint from "typescript-eslint";

// Règles maison, réutilisées aussi par apps/web (qui charge déjà typescript-eslint via Next.js).
export const primeoRules = {
  rules: {
    "@typescript-eslint/consistent-type-imports": "error",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "no-console": ["warn", { allow: ["warn", "error"] }],
  },
};

export default [js.configs.recommended, ...tseslint.configs.recommended, primeoRules];
