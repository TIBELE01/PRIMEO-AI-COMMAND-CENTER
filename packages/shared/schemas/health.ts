import { z } from "zod";

/**
 * Réponse de la route de santé `GET /health` de l'API.
 * Partagée entre l'API (production de la réponse) et le frontend (lecture validée).
 */
export const healthResponseSchema = z.object({
  status: z.literal("ok"),
  service: z.string(),
  environment: z.enum(["development", "test", "production"]),
  uptimeSeconds: z.number().nonnegative(),
  timestamp: z.iso.datetime(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;
