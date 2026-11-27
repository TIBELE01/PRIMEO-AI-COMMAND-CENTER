import { z } from "zod";

/** Variables d'environnement de l'API, validées au démarrage. */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  API_HOST: z.string().min(1).default("127.0.0.1"),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  APP_URL: z.url().default("http://localhost:3000"),
});

export type ApiEnv = z.infer<typeof envSchema>;

/**
 * Valide la configuration. Lève une erreur explicite si une variable est invalide :
 * l'API refuse de démarrer plutôt que de fonctionner avec une configuration incorrecte.
 */
export function parseApiEnv(source: NodeJS.ProcessEnv = process.env): ApiEnv {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")} : ${issue.message}`)
      .join("\n");
    throw new Error(`Configuration de l'API invalide :\n${details}`);
  }
  return result.data;
}
