import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export type TypedSupabaseClient = SupabaseClient<Database>;

const serverAuthOptions = {
  persistSession: false,
  autoRefreshToken: false,
  detectSessionInUrl: false,
} as const;

/**
 * Client agissant AU NOM d'un utilisateur, à partir de son jeton d'accès.
 * La RLS s'applique : l'utilisateur ne voit que ce que les politiques l'autorisent à voir.
 * C'est le client par défaut pour répondre à une requête du PDG dans l'API.
 */
export function createUserClient(options: {
  url: string;
  publishableKey: string;
  accessToken: string;
}): TypedSupabaseClient {
  return createClient<Database>(options.url, options.publishableKey, {
    auth: serverAuthOptions,
    global: { headers: { Authorization: `Bearer ${options.accessToken}` } },
  });
}

/**
 * Client de SERVICE (clé secrète) : contourne la RLS.
 * Réservé à apps/api et apps/workers, pour les écritures et les traitements système.
 * Ne doit JAMAIS être importé dans du code exécuté par le navigateur.
 */
export function createServiceClient(options: {
  url: string;
  secretKey: string;
}): TypedSupabaseClient {
  if ("window" in globalThis) {
    throw new Error("Le client de service Supabase ne peut pas être utilisé dans un navigateur.");
  }
  return createClient<Database>(options.url, options.secretKey, { auth: serverAuthOptions });
}
