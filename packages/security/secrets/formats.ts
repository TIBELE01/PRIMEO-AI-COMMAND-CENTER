import { z } from "zod";

/** Formats des valeurs attendues. Les messages ne contiennent JAMAIS la valeur reçue. */

export const httpsUrl = z
  .url({ error: "doit être une URL valide." })
  .refine(
    (value) =>
      value.startsWith("https://") || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(value),
    {
      error: "doit utiliser HTTPS (HTTP n'est accepté qu'en local).",
    },
  );

export const anyUrl = z.url({ error: "doit être une URL valide." });

const jwtLike = /^eyJ[\w-]+\.[\w-]+\.[\w-]+$/;

export const supabasePublishableKey = z
  .string()
  .refine((value) => value.startsWith("sb_publishable_") || jwtLike.test(value), {
    error: "doit être une clé publiable Supabase (sb_publishable_…).",
  });

export const supabaseSecretKey = z
  .string()
  .refine((value) => value.startsWith("sb_secret_") || jwtLike.test(value), {
    error: "doit être une clé secrète Supabase (sb_secret_…).",
  })
  .refine((value) => !value.startsWith("sb_publishable_"), {
    error: "contient une clé publiable au lieu d'une clé secrète.",
  });

export const postgresUrl = z
  .string()
  .regex(/^postgres(ql)?:\/\/.+/, { error: "doit être une URL PostgreSQL (postgres://…)." });

export const openAIKey = z
  .string()
  .regex(/^sk-[\w-]{20,}$/, { error: "doit être une clé OpenAI (sk-…)." });

export const anthropicKey = z
  .string()
  .regex(/^sk-ant-[\w-]{20,}$/, { error: "doit être une clé Anthropic (sk-ant-…)." });

export const deepSeekKey = z
  .string()
  .regex(/^sk-[\w-]{20,}$/, { error: "doit être une clé DeepSeek (sk-…)." });

export const opaqueToken = (minLength: number) =>
  z.string().min(minLength, { error: `doit contenir au moins ${minLength} caractères.` });

/** Clé de 32 octets encodée en base64 (AES-256). */
export const base64Key32 = z.string().refine(
  (value) => {
    try {
      return Buffer.from(value, "base64").length === 32 && /^[A-Za-z0-9+/]+={0,2}$/.test(value);
    } catch {
      return false;
    }
  },
  { error: "doit être une clé de 32 octets encodée en base64 (openssl rand -base64 32)." },
);

export const port = z.coerce
  .number({ error: "doit être un numéro de port." })
  .int()
  .min(1)
  .max(65535, { error: "doit être compris entre 1 et 65535." });

export const zohoDataCenter = z.enum(["com", "eu", "in", "com.au", "jp", "ca", "sa", "com.cn"], {
  error: "doit être un centre de données Zoho (com, eu, in, com.au, jp, ca, sa, com.cn).",
});
