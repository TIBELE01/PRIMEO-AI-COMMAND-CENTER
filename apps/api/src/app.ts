import Fastify, { type FastifyInstance, type FastifyLoggerOptions } from "fastify";
import type { ApiEnv } from "./config/env";
import { registerErrorHandling } from "./middleware/error-handler";
import { registerSecurity } from "./middleware/security";
import { registerHealthRoutes } from "./modules/health/health.routes";

function loggerOptions(env: ApiEnv): FastifyLoggerOptions | false {
  if (env.NODE_ENV === "test") {
    return false;
  }
  if (env.NODE_ENV === "development") {
    return { level: env.LOG_LEVEL, transport: { target: "pino-pretty" } } as FastifyLoggerOptions;
  }
  return { level: env.LOG_LEVEL };
}

/**
 * Construit l'application Fastify sans la démarrer.
 * Séparé de `main.ts` pour pouvoir être testé sans ouvrir de port réseau.
 */
export async function buildApp(env: ApiEnv): Promise<FastifyInstance> {
  const app = Fastify({ logger: loggerOptions(env) });

  await registerSecurity(app, env);
  registerErrorHandling(app);
  registerHealthRoutes(app, env);

  return app;
}
