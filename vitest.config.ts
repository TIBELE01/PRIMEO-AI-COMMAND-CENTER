import { defineConfig } from "vitest/config";

// Tests centralisés dans /tests (unitaires, intégration, agents).
// Les tests de bout en bout (Playwright) ont leur propre configuration dans tests/e2e.
export default defineConfig({
  test: {
    include: ["tests/{unit,integration,agents}/**/*.test.{ts,tsx}"],
    passWithNoTests: true,
  },
});
