import Fastify, { type FastifyInstance, type FastifyLoggerOptions } from "fastify";
import type { ApiEnv } from "./config/env";
import { createAuthenticationGuard } from "./guards/authenticate";
import {
  createAccessTokenVerifier,
  type AccessTokenVerifier,
} from "./modules/authentication/access-token";
import { registerAuthenticationRoutes } from "./modules/authentication/authentication.routes";
import {
  createUserProfileLoader,
  type UserProfileLoader,
} from "./modules/authentication/user-profile";
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

/** Dépendances externes remplaçables (notamment dans les tests). */
export interface AppDependencies {
  verifyAccessToken: AccessTokenVerifier;
  loadUserProfile: UserProfileLoader;
}

/**
 * Construit l'application Fastify sans la démarrer.
 * Séparé de `main.ts` pour pouvoir être testé sans ouvrir de port réseau.
 */
export async function buildApp(
  env: ApiEnv,
  overrides: Partial<AppDependencies> = {},
): Promise<FastifyInstance> {
  const app = Fastify({ logger: loggerOptions(env) });
  app.decorateRequest("currentUser", null);

  const dependencies: AppDependencies = {
    verifyAccessToken:
      overrides.verifyAccessToken ?? createAccessTokenVerifier({ supabaseUrl: env.SUPABASE_URL }),
    loadUserProfile:
      overrides.loadUserProfile ??
      createUserProfileLoader({
        supabaseUrl: env.SUPABASE_URL,
        publishableKey: env.SUPABASE_PUBLISHABLE_KEY,
      }),
  };
  const requireAuthenticatedUser = createAuthenticationGuard(dependencies);

  await registerSecurity(app, env);
  registerErrorHandling(app);
  registerHealthRoutes(app, env);
  registerAuthenticationRoutes(app, requireAuthenticatedUser);

  return app;
}
