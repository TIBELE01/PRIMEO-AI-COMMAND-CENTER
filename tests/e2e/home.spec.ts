import { expect, test } from "@playwright/test";

test("la page d'accueil s'affiche et confirme que l'API est opérationnelle", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Primeo AI Command Center");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Primeo AI Command Center");

  const status = page.getByTestId("api-status");
  await expect(status).toHaveAttribute("data-state", "online");
  await expect(status).toContainText("Opérationnelle");
});

test("la page d'accueil ne déborde pas horizontalement", async ({ page }) => {
  await page.goto("/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
