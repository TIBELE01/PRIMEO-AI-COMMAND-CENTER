import { SERVICES, type HealthResponse } from "@primeo/shared";
import type { FastifyInstance } from "fastify";
import type { ApiEnv } from "../../config/env";

/** Route de santé : utilisée par le frontend, la supervision et l'hébergeur. */
export function registerHealthRoutes(app: FastifyInstance, env: ApiEnv): void {
  app.get("/health", async (): Promise<HealthResponse> => ({
    status: "ok",
    service: SERVICES.api,
    environment: env.NODE_ENV,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  }));
}
