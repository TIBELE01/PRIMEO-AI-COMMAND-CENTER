import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, devices } from "@playwright/test";

// Variables locales (Supabase…) lues depuis le .env racine s'il existe.
const rootEnvFile = resolve(import.meta.dirname, "../../.env");
if (existsSync(rootEnvFile)) {
  process.loadEnvFile(rootEnvFile);
}

// Chemin optionnel vers un Chromium déjà installé (environnements sans téléchargement de navigateur).
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const launchOptions = executablePath ? { executablePath } : {};

/**
 * Tests de bout en bout : l'API et l'interface sont démarrées dans leur version compilée
 * (`pnpm build` est exécuté au préalable par `pnpm test:e2e`).
 */
export default defineConfig({
  testDir: ".",
  testMatch: "**/*.spec.ts",
  outputDir: "./test-results",
  reporter: [["list"], ["html", { outputFolder: "./playwright-report", open: "never" }]],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: "http://localhost:3000",
    launchOptions,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], launchOptions } },
    { name: "mobile", use: { ...devices["Pixel 7"], launchOptions } },
  ],
  webServer: [
    {
      command: "pnpm --filter @primeo/api start",
      url: "http://127.0.0.1:4000/health",
      env: {
        NODE_ENV: "production",
        API_PORT: "4000",
        APP_URL: "http://localhost:3000",
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
          process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
      },
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "pnpm --filter @primeo/web start",
      url: "http://localhost:3000",
      env: { NEXT_PUBLIC_API_URL: "http://127.0.0.1:4000" },
      reuseExistingServer: !process.env.CI,
    },
  ],
});
