"use client";

import type { Database } from "@primeo/integrations/supabase";
import { createBrowserClient } from "@supabase/ssr";
import { supabasePublicConfig } from "@/utils/env";

/**
 * Client Supabase du NAVIGATEUR (clé publiable, session dans les cookies).
 * Usage prévu : temps réel et lecture soumise à la RLS. Aucune écriture métier :
 * les écritures passent par l'API.
 */
export function createSupabaseBrowserClient() {
  const { url, publishableKey } = supabasePublicConfig();
  return createBrowserClient<Database>(url, publishableKey);
}
