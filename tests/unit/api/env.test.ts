import { describe, expect, it } from "vitest";
import { parseApiEnv } from "../../../apps/api/src/config/env";

const SUPABASE = {
  NEXT_PUBLIC_SUPABASE_URL: "https://projet.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
};

describe("parseApiEnv", () => {
  it("applique des valeurs par défaut adaptées au développement local", () => {
    const env = parseApiEnv(SUPABASE);
    expect(env).toEqual({
      NODE_ENV: "development",
      LOG_LEVEL: "info",
      API_HOST: "127.0.0.1",
      API_PORT: 4000,
      APP_URL: "http://localhost:3000",
      SUPABASE_URL: "https://projet.supabase.co",
      SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
    });
  });

  it("convertit le port fourni sous forme de texte", () => {
    expect(parseApiEnv({ ...SUPABASE, API_PORT: "8080" }).API_PORT).toBe(8080);
  });

  it("refuse un port invalide", () => {
    expect(() => parseApiEnv({ ...SUPABASE, API_PORT: "70000" })).toThrow(/API_PORT/);
  });

  it("refuse une URL de frontend invalide", () => {
    expect(() => parseApiEnv({ ...SUPABASE, APP_URL: "pas-une-url" })).toThrow(/APP_URL/);
  });

  it("refuse un environnement inconnu", () => {
    expect(() => parseApiEnv({ ...SUPABASE, NODE_ENV: "staging" })).toThrow(/NODE_ENV/);
  });

  it("exige la configuration Supabase", () => {
    expect(() => parseApiEnv({})).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });
});
