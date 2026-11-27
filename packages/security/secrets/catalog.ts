import { z } from "zod";
import * as f from "./formats";

export type ServiceName = "web" | "api" | "workers" | "tests";

/**
 * Exigence d'une variable :
 *  - "required" : obligatoire, le service refuse de démarrer sans elle ;
 *  - "production" : obligatoire en production, facultative en développement ;
 *  - "optional" : facultative ; validée si elle est présente.
 */
export type Requirement = "required" | "production" | "optional";

export interface VariableDefinition {
  /** Description affichée dans .env.example et dans les messages d'erreur. */
  description: string;
  /** "public" : peut être exposée au navigateur. "secret" : jamais affichée, jamais exposée. */
  visibility: "public" | "secret";
  /** Services qui lisent la variable, et leur niveau d'exigence. */
  usedBy: Partial<Record<ServiceName, Requirement>>;
  schema: z.ZodType;
  default?: string;
  group: string;
}

/** Conserve le type précis du schéma de chaque variable (pour le typage des valeurs chargées). */
const v = <S extends z.ZodType>(definition: VariableDefinition & { schema: S }) => definition;

/**
 * CATALOGUE UNIQUE des variables d'environnement du Command Center.
 * Toute nouvelle variable doit être déclarée ici ET dans .env.example (un test le vérifie).
 */
export const ENVIRONMENT_CATALOG = {
  // --- Application ---------------------------------------------------------------
  NODE_ENV: v({
    group: "Application",
    description: "Environnement d'exécution.",
    visibility: "public",
    usedBy: { web: "optional", api: "optional", workers: "optional" },
    schema: z.enum(["development", "test", "production"]),
    default: "development",
  }),
  LOG_LEVEL: v({
    group: "Application",
    description: "Niveau de journalisation des services Node.js.",
    visibility: "public",
    usedBy: { api: "optional", workers: "optional" },
    schema: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]),
    default: "info",
  }),
  APP_URL: v({
    group: "Application",
    description: "Adresse de l'interface, utilisée par l'API pour autoriser les requêtes (CORS).",
    visibility: "public",
    usedBy: { api: "optional" },
    schema: f.anyUrl,
    default: "http://localhost:3000",
  }),
  NEXT_PUBLIC_APP_URL: v({
    group: "Application",
    description: "Adresse publique de l'interface (liens envoyés par e-mail).",
    visibility: "public",
    usedBy: { web: "production" },
    schema: f.httpsUrl,
    default: "http://localhost:3000",
  }),
  NEXT_PUBLIC_API_URL: v({
    group: "Application",
    description: "Adresse de l'API, utilisée par l'interface.",
    visibility: "public",
    usedBy: { web: "production" },
    schema: f.httpsUrl,
    default: "http://localhost:4000",
  }),
  API_HOST: v({
    group: "Application",
    description: "Adresse d'écoute de l'API (0.0.0.0 en conteneur).",
    visibility: "public",
    usedBy: { api: "optional" },
    schema: z.string().min(1),
    default: "127.0.0.1",
  }),
  API_PORT: v({
    group: "Application",
    description: "Port d'écoute de l'API.",
    visibility: "public",
    usedBy: { api: "optional" },
    schema: f.port,
    default: "4000",
  }),

  // --- Supabase ------------------------------------------------------------------
  NEXT_PUBLIC_SUPABASE_URL: v({
    group: "Supabase",
    description: "URL du projet Supabase DÉDIÉ au Command Center.",
    visibility: "public",
    usedBy: { web: "required", api: "required", workers: "optional" },
    schema: f.httpsUrl,
  }),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: v({
    group: "Supabase",
    description: "Clé publiable Supabase (sb_publishable_…). Publique, la RLS s'applique.",
    visibility: "public",
    usedBy: { web: "required", api: "required", workers: "optional" },
    schema: f.supabasePublishableKey,
  }),
  SUPABASE_SECRET_KEY: v({
    group: "Supabase",
    description:
      "Clé secrète Supabase (sb_secret_…) : contourne la RLS. API et workers uniquement.",
    visibility: "secret",
    usedBy: { api: "optional", workers: "optional" },
    schema: f.supabaseSecretKey,
  }),
  DATABASE_URL: v({
    group: "Supabase",
    description: "Connexion PostgreSQL directe (outillage, migrations).",
    visibility: "secret",
    usedBy: {},
    schema: f.postgresUrl,
  }),

  // --- Chiffrement des secrets --------------------------------------------------
  SECRETS_ENCRYPTION_KEY: v({
    group: "Chiffrement des secrets",
    description:
      "Clé maîtresse AES-256 des secrets d'intégration stockés en base (openssl rand -base64 32).",
    visibility: "secret",
    usedBy: { api: "production", workers: "production" },
    schema: f.base64Key32,
  }),
  SECRETS_ENCRYPTION_KEY_VERSION: v({
    group: "Chiffrement des secrets",
    description: "Version de la clé maîtresse courante (à incrémenter à chaque rotation).",
    visibility: "public",
    usedBy: { api: "optional", workers: "optional" },
    schema: z.coerce.number().int().min(1).max(32767),
    default: "1",
  }),

  // --- Fournisseurs d'IA ----------------------------------------------------------
  OPENAI_API_KEY: v({
    group: "Fournisseurs d'IA",
    description: "Clé API OpenAI. Le fournisseur est désactivé si elle est absente.",
    visibility: "secret",
    usedBy: { api: "optional", workers: "optional" },
    schema: f.openAIKey,
  }),
  ANTHROPIC_API_KEY: v({
    group: "Fournisseurs d'IA",
    description: "Clé API Anthropic (Claude). Le fournisseur est désactivé si elle est absente.",
    visibility: "secret",
    usedBy: { api: "optional", workers: "optional" },
    schema: f.anthropicKey,
  }),
  DEEPSEEK_API_KEY: v({
    group: "Fournisseurs d'IA",
    description: "Clé API DeepSeek. Le fournisseur est désactivé si elle est absente.",
    visibility: "secret",
    usedBy: { api: "optional", workers: "optional" },
    schema: f.deepSeekKey,
  }),

  // --- n8n ------------------------------------------------------------------------
  N8N_BASE_URL: v({
    group: "n8n",
    description: "Adresse de l'instance n8n.",
    visibility: "public",
    usedBy: { api: "optional", workers: "optional" },
    schema: f.httpsUrl,
  }),
  N8N_API_KEY: v({
    group: "n8n",
    description: "Clé API n8n (déclenchement des workflows).",
    visibility: "secret",
    usedBy: { api: "optional", workers: "optional" },
    schema: f.opaqueToken(16),
  }),
  N8N_WEBHOOK_SIGNING_SECRET: v({
    group: "n8n",
    description: "Secret partagé de signature des webhooks n8n (32 caractères minimum).",
    visibility: "secret",
    usedBy: { api: "optional" },
    schema: f.opaqueToken(32),
  }),

  // --- Zoho -----------------------------------------------------------------------
  ZOHO_DATA_CENTER: v({
    group: "Zoho",
    description: "Centre de données du compte Zoho (com, eu, in…).",
    visibility: "public",
    usedBy: { api: "optional", workers: "optional" },
    schema: f.zohoDataCenter,
  }),
  ZOHO_CLIENT_ID: v({
    group: "Zoho",
    description: "Identifiant du client OAuth Zoho.",
    visibility: "public",
    usedBy: { api: "optional", workers: "optional" },
    schema: f.opaqueToken(10),
  }),
  ZOHO_CLIENT_SECRET: v({
    group: "Zoho",
    description: "Secret du client OAuth Zoho.",
    visibility: "secret",
    usedBy: { api: "optional", workers: "optional" },
    schema: f.opaqueToken(10),
  }),
  ZOHO_REFRESH_TOKEN: v({
    group: "Zoho",
    description: "Jeton de rafraîchissement OAuth Zoho.",
    visibility: "secret",
    usedBy: { api: "optional", workers: "optional" },
    schema: f.opaqueToken(20),
  }),

  // --- ElevenLabs -----------------------------------------------------------------
  ELEVENLABS_API_KEY: v({
    group: "ElevenLabs",
    description: "Clé API ElevenLabs (voix et agents téléphoniques).",
    visibility: "secret",
    usedBy: { api: "optional", workers: "optional" },
    schema: f.opaqueToken(20),
  }),

  // --- Tests ----------------------------------------------------------------------
  TEST_DATABASE_URL: v({
    group: "Tests",
    description: "Serveur PostgreSQL 16+ avec pgvector, pour créer des bases de test jetables.",
    visibility: "secret",
    usedBy: { tests: "optional" },
    schema: f.postgresUrl,
  }),
} satisfies Record<string, VariableDefinition>;

export type VariableName = keyof typeof ENVIRONMENT_CATALOG;

/** Type de la valeur validée d'une variable (ex. API_PORT → number). */
export type VariableValue<K extends VariableName> = z.output<
  (typeof ENVIRONMENT_CATALOG)[K]["schema"]
>;

/** Variables qu'un service a le droit de lire. */
export function variablesForService(service: ServiceName): VariableName[] {
  return (Object.keys(ENVIRONMENT_CATALOG) as VariableName[]).filter(
    (name) => ENVIRONMENT_CATALOG[name].usedBy[service] !== undefined,
  );
}
