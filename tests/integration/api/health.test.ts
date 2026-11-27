import { healthResponseSchema } from "@primeo/shared";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../../apps/api/src/app";
import { parseApiEnv } from "../../../apps/api/src/config/env";

describe("API — socle", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeAll(async () => {
    app = await buildApp(
      parseApiEnv({
        NODE_ENV: "test",
        APP_URL: "http://localhost:3000",
        NEXT_PUBLIC_SUPABASE_URL: "https://projet.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
      }),
    );
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /health répond 200 avec une réponse conforme au schéma partagé", async () => {
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    const body = healthResponseSchema.parse(response.json());
    expect(body.service).toBe("primeo-api");
    expect(body.environment).toBe("test");
  });

  it("applique les en-têtes de sécurité HTTP", async () => {
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["x-powered-by"]).toBeUndefined();
  });

  it("ne renvoie jamais en CORS une origine autre que celle du frontend", async () => {
    const allowed = await app.inject({
      method: "GET",
      url: "/health",
      headers: { origin: "http://localhost:3000" },
    });
    expect(allowed.headers["access-control-allow-origin"]).toBe("http://localhost:3000");

    const other = await app.inject({
      method: "GET",
      url: "/health",
      headers: { origin: "https://exemple-malveillant.test" },
    });
    expect(other.headers["access-control-allow-origin"]).not.toBe(
      "https://exemple-malveillant.test",
    );
    expect(other.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
  });

  it("renvoie une erreur 404 structurée pour une route inconnue", async () => {
    const response = await app.inject({ method: "GET", url: "/inexistant" });
    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ error: "not_found" });
  });
});
