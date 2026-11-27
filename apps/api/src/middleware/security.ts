import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import type { FastifyInstance } from "fastify";
import type { ApiEnv } from "../config/env";

/** En-têtes de sécurité HTTP et CORS limité à l'origine du frontend. */
export async function registerSecurity(app: FastifyInstance, env: ApiEnv): Promise<void> {
  await app.register(helmet);
  await app.register(cors, {
    origin: new URL(env.APP_URL).origin,
    credentials: true,
  });
}
