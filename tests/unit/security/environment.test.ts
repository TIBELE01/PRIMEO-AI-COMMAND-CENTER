import {
  describeEnvironment,
  EnvironmentValidationError,
  loadEnvironment,
} from "@primeo/security/secrets";
import { describe, expect, it } from "vitest";

const SUPABASE = {
  NEXT_PUBLIC_SUPABASE_URL: "https://projet.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_exemple",
};
const SECRET_VALUE = "sk-ant-ceci-est-une-fausse-cle-de-test-0123456789";

function issuesOf(fn: () => unknown) {
  try {
    fn();
  } catch (error) {
    if (error instanceof EnvironmentValidationError) {
      return error;
    }
    throw error;
  }
  throw new Error("Aucune erreur levée.");
}

describe("loadEnvironment", () => {
  it("applique les valeurs par défaut et convertit les types", () => {
    const env = loadEnvironment("api", SUPABASE);
    expect(env.API_PORT).toBe(4000);
    expect(env.NODE_ENV).toBe("development");
    expect(env.SECRETS_ENCRYPTION_KEY_VERSION).toBe(1);
  });

  it("signale toutes les variables obligatoires manquantes", () => {
    const error = issuesOf(() => loadEnvironment("api", {}));
    expect(error.issues.map((issue) => issue.variable).sort()).toEqual([
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "NEXT_PUBLIC_SUPABASE_URL",
    ]);
  });

  it("exige en production les variables marquées « prod »", () => {
    expect(() => loadEnvironment("api", { ...SUPABASE })).not.toThrow();
    const error = issuesOf(() => loadEnvironment("api", { ...SUPABASE, NODE_ENV: "production" }));
    expect(error.issues.map((issue) => issue.variable)).toContain("SECRETS_ENCRYPTION_KEY");
  });

  it.each([
    ["une clé Anthropic au mauvais format", "ANTHROPIC_API_KEY", "cle-invalide"],
    ["une clé publiable à la place d'une clé secrète", "SUPABASE_SECRET_KEY", "sb_publishable_xyz"],
    ["une clé maîtresse de mauvaise taille", "SECRETS_ENCRYPTION_KEY", "dHJvcC1jb3VydGU="],
    ["une URL Supabase en HTTP", "NEXT_PUBLIC_SUPABASE_URL", "http://projet.supabase.co"],
    ["un port hors limites", "API_PORT", "70000"],
  ])("refuse %s", (_label, variable, value) => {
    const error = issuesOf(() => loadEnvironment("api", { ...SUPABASE, [variable]: value }));
    expect(error.issues).toEqual([expect.objectContaining({ variable, problem: "invalid" })]);
  });

  it("n'affiche jamais la valeur d'une variable invalide", () => {
    const leaked = `${SECRET_VALUE} avec espaces`;
    const error = issuesOf(() =>
      loadEnvironment("api", { ...SUPABASE, ANTHROPIC_API_KEY: leaked }),
    );
    expect(error.message).not.toContain(SECRET_VALUE);
  });

  it("ne renvoie que les variables déclarées pour le service", () => {
    const env = loadEnvironment("web", { ...SUPABASE, ANTHROPIC_API_KEY: SECRET_VALUE });
    expect(env).not.toHaveProperty("ANTHROPIC_API_KEY");
  });

  it("masque les secrets dans le résumé de configuration", () => {
    const summary = describeEnvironment(
      loadEnvironment("api", { ...SUPABASE, ANTHROPIC_API_KEY: SECRET_VALUE }),
    );
    expect(summary.ANTHROPIC_API_KEY).toBe("défini (masqué)");
    expect(JSON.stringify(summary)).not.toContain(SECRET_VALUE);
  });
});
