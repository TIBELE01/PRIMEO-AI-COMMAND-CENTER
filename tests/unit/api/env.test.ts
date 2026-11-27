import { describe, expect, it } from "vitest";
import { parseApiEnv } from "../../../apps/api/src/config/env";

describe("parseApiEnv", () => {
  it("applique des valeurs par défaut adaptées au développement local", () => {
    const env = parseApiEnv({});
    expect(env).toEqual({
      NODE_ENV: "development",
      LOG_LEVEL: "info",
      API_HOST: "127.0.0.1",
      API_PORT: 4000,
      APP_URL: "http://localhost:3000",
    });
  });

  it("convertit le port fourni sous forme de texte", () => {
    expect(parseApiEnv({ API_PORT: "8080" }).API_PORT).toBe(8080);
  });

  it("refuse un port invalide", () => {
    expect(() => parseApiEnv({ API_PORT: "70000" })).toThrow(/API_PORT/);
  });

  it("refuse une URL de frontend invalide", () => {
    expect(() => parseApiEnv({ APP_URL: "pas-une-url" })).toThrow(/APP_URL/);
  });

  it("refuse un environnement inconnu", () => {
    expect(() => parseApiEnv({ NODE_ENV: "staging" })).toThrow(/NODE_ENV/);
  });
});
