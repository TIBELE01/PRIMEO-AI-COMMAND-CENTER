import { loadEnvironment } from "@primeo/security/secrets";

/** Configuration de l'API, validée au démarrage par le module central @primeo/security/secrets. */
export interface ApiEnv {
  NODE_ENV: "development" | "test" | "production";
  LOG_LEVEL: "fatal" | "error" | "warn" | "info" | "debug" | "trace" | "silent";
  API_HOST: string;
  API_PORT: number;
  APP_URL: string;
  SUPABASE_URL: string;
  SUPABASE_PUBLISHABLE_KEY: string;
}

/**
 * Valide la configuration. Lève une `EnvironmentValidationError` explicite (sans jamais
 * afficher de valeur) : l'API refuse de démarrer plutôt que de fonctionner mal configurée.
 */
export function parseApiEnv(source: Record<string, string | undefined> = process.env): ApiEnv {
  const env = loadEnvironment("api", source);
  return {
    NODE_ENV: env.NODE_ENV ?? "development",
    LOG_LEVEL: env.LOG_LEVEL ?? "info",
    API_HOST: env.API_HOST ?? "127.0.0.1",
    API_PORT: env.API_PORT ?? 4000,
    APP_URL: env.APP_URL ?? "http://localhost:3000",
    // Variables obligatoires pour l'API : leur présence est garantie par loadEnvironment.
    SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL!,
    SUPABASE_PUBLISHABLE_KEY: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  };
}
