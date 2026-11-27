import { REDACTED, redactSecrets } from "@primeo/security/secrets";
import { describe, expect, it } from "vitest";

describe("redactSecrets", () => {
  it("masque la valeur des variables secrètes de l'environnement", () => {
    const text = redactSecrets("échec avec la clé n8n-cle-tres-secrete-123", {
      N8N_API_KEY: "n8n-cle-tres-secrete-123",
    });
    expect(text).toBe(`échec avec la clé ${REDACTED}`);
  });

  it("ne masque pas les variables publiques", () => {
    expect(
      redactSecrets("projet https://projet.supabase.co", {
        NEXT_PUBLIC_SUPABASE_URL: "https://projet.supabase.co",
      }),
    ).toContain("projet.supabase.co");
  });

  // Valeurs factices assemblées à l'exécution : le détecteur de secrets du dépôt ne doit pas
  // trouver de clé littérale dans le code source.
  it.each([
    ["une clé Anthropic", ["sk", "ant", "api03", "abcdefghijklmnopqrstuvwxyz"].join("-")],
    ["une clé secrète Supabase", ["sb", "secret", "abcdefghijklmnop"].join("_")],
    ["un jeton JWT", "eyJhbGciOiJFUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.c2lnbmF0dXJlLWZhdXNzZQ"],
  ])("masque %s même hors environnement", (_label, secret) => {
    expect(redactSecrets(`erreur : ${secret}`, {})).toBe(`erreur : ${REDACTED}`);
  });

  it("masque le jeton d'un en-tête Authorization", () => {
    expect(redactSecrets("Authorization: Bearer abcdefghijklmnopqrstuvwxyz012345", {})).toBe(
      `Authorization: Bearer ${REDACTED}`,
    );
  });
});
