import { existsSync } from "node:fs";
import { defineConfig } from "vitest/config";

// Variables locales (ex. TEST_DATABASE_URL) lues depuis le .env racine s'il existe.
if (existsSync(".env")) {
  process.loadEnvFile(".env");
}

// Tests centralisés dans /tests (unitaires, intégration, agents).
// Les tests de bout en bout (Playwright) ont leur propre configuration dans tests/e2e.
export default defineConfig({
  test: {
    include: ["tests/{unit,integration,agents}/**/*.test.{ts,tsx}"],
    passWithNoTests: true,
  },
});
