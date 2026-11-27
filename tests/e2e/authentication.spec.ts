import { expect, test } from "@playwright/test";

test.describe("authentification", () => {
  test("une page privée redirige vers la connexion en conservant la destination", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login\?next=%2F$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Connexion");
  });

  test("des identifiants inconnus sont refusés par Supabase", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Adresse e-mail").fill("inconnu@exemple.invalid");
    await page.getByLabel("Mot de passe").fill("MotDePasseInconnu2026");
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toHaveText(
      "Adresse e-mail ou mot de passe incorrect.",
    );
    await expect(page).toHaveURL(/\/login/);
  });

  test("l'inscription est refusée sans invitation", async ({ page }) => {
    await page.goto("/signup");
    await page.getByLabel("Nom complet").fill("Personne non invitée");
    await page.getByLabel("Adresse e-mail").fill(`intrus-${Date.now()}@exemple.invalid`);
    await page.getByLabel("Mot de passe", { exact: true }).fill("MotDePasseTest2026");
    await page.getByLabel("Confirmation du mot de passe").fill("MotDePasseTest2026");
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(page.getByRole("main").getByRole("alert")).toContainText(
      "n'a pas reçu d'invitation",
    );
  });

  test("le formulaire d'inscription valide les champs avant tout envoi", async ({ page }) => {
    await page.goto("/signup");
    await page.getByLabel("Nom complet").fill("Test");
    await page.getByLabel("Adresse e-mail").fill("pas-une-adresse");
    await page.getByLabel("Mot de passe", { exact: true }).fill("court");
    await page.getByLabel("Confirmation du mot de passe").fill("autre");
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(page.getByText("Adresse e-mail invalide.")).toBeVisible();
    await expect(page.getByText(/au moins 12 caractères/).first()).toBeVisible();
  });

  test("le mot de passe oublié valide l'adresse saisie", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByLabel("Adresse e-mail").fill("pas-une-adresse");
    await page.getByRole("button", { name: "Envoyer le lien" }).click();
    await expect(page.getByText("Adresse e-mail invalide.")).toBeVisible();
  });

  test("un lien de confirmation invalide renvoie vers la connexion avec un message", async ({
    page,
  }) => {
    await page.goto("/auth/callback?code=code-invalide");
    await expect(page).toHaveURL(/\/login\?error=link_invalid/);
    await expect(page.getByRole("main").getByRole("alert")).toContainText("n'est plus valide");
  });

  test("la réinitialisation exige la session ouverte par le lien reçu", async ({ page }) => {
    await page.goto("/reset-password");
    await expect(page).toHaveURL(/\/login\?next=%2Freset-password/);
  });

  test("les pages d'authentification ne débordent pas horizontalement", async ({ page }) => {
    for (const path of ["/login", "/signup", "/forgot-password"]) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });
});

test("l'API répond sur sa route de santé et protège ses routes privées", async ({ request }) => {
  const health = await request.get("http://127.0.0.1:4000/health");
  expect(health.ok()).toBe(true);
  const me = await request.get("http://127.0.0.1:4000/me");
  expect(me.status()).toBe(401);
});

test("la page de référence du design system est réservée aux personnes connectées", async ({
  page,
}) => {
  await page.goto("/design-system");
  await expect(page).toHaveURL(/\/login\?next=%2Fdesign-system/);
});
