import "server-only";

import type { Tables } from "@primeo/integrations/supabase";
import { cache } from "react";
import { createSupabaseServerClient } from "@/services/supabase/server";

export type UserProfile = Pick<
  Tables<"users">,
  "id" | "email" | "full_name" | "role" | "is_active" | "mfa_required"
>;

/**
 * Utilisateur connecté et autorisé, vérifié côté serveur :
 *  1. jeton de session vérifié (signature contrôlée) ;
 *  2. profil applicatif présent et actif (lecture soumise à la RLS).
 * Renvoie null si l'une des conditions n'est pas remplie. Mis en cache pour la requête.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims.sub;
  if (typeof userId !== "string") {
    return null;
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id, email, full_name, role, is_active, mfa_required")
    .eq("id", userId)
    .maybeSingle();

  if (!profile || !profile.is_active) {
    return { status: "unauthorized" as const };
  }

  return {
    status: "authorized" as const,
    profile: profile satisfies UserProfile,
    assuranceLevel: claimsData?.claims.aal === "aal2" ? ("aal2" as const) : ("aal1" as const),
  };
});
