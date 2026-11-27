import "server-only";

import type { Database } from "@primeo/integrations/supabase";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabasePublicConfig } from "@/utils/env";

/**
 * Client Supabase côté SERVEUR (composants serveur, actions serveur, routes).
 * Il agit au nom de l'utilisateur connecté (session lue dans les cookies) : la RLS s'applique.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { url, publishableKey } = supabasePublicConfig();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Appel depuis un composant serveur : l'écriture des cookies est impossible ici,
          // le proxy (src/proxy.ts) se charge de rafraîchir la session.
        }
      },
    },
  });
}
