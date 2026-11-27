import { z } from "zod";

/** Variables d'environnement de l'API, validées au démarrage. */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  API_HOST: z.string().min(1).default("127.0.0.1"),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  APP_URL: z.url().default("http://localhost:3000"),
  SUPABASE_URL: z.url({ error: "SUPABASE_URL doit être l'URL du projet Supabase." }),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1, { error: "SUPABASE_PUBLISHABLE_KEY est requis." }),
});

export type ApiEnv = z.infer<typeof envSchema>;

/**
 * Valide la configuration. Lève une erreur explicite si une variable est invalide :
 * l'API refuse de démarrer plutôt que de fonctionner avec une configuration incorrecte.
 */
export function parseApiEnv(source: NodeJS.ProcessEnv = process.env): ApiEnv {
  // Les valeurs publiques Supabase peuvent être partagées avec le frontend (NEXT_PUBLIC_*).
  const result = envSchema.safeParse({
    ...source,
    SUPABASE_URL: source.SUPABASE_URL ?? source.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY:
      source.SUPABASE_PUBLISHABLE_KEY ?? source.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")} : ${issue.message}`)
      .join("\n");
    throw new Error(`Configuration de l'API invalide :\n${details}`);
  }
  return result.data;
}
