import { defineConfig, devices } from "@playwright/test";

// Tests de bout en bout de l'interface du PDG, sur ordinateur et sur smartphone.
export default defineConfig({
  testDir: ".",
  outputDir: "./test-results",
  reporter: [["html", { outputFolder: "./playwright-report", open: "never" }]],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: "http://localhost:3000",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "pnpm --filter @primeo/web start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
