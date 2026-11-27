import { defineConfig } from "vitest/config";

// Exécute les tests unitaires de tous les espaces de travail depuis la racine.
export default defineConfig({
  test: {
    projects: ["apps/*", "packages/*"],
  },
});
