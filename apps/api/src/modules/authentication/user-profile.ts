import { createUserClient, unwrap } from "@primeo/integrations/supabase";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: "executive" | "administrator" | "observer";
  isActive: boolean;
  mfaRequired: boolean;
}

export type UserProfileLoader = (
  accessToken: string,
  userId: string,
) => Promise<UserProfile | null>;

/**
 * Charge le profil applicatif AU NOM de l'utilisateur (son jeton est transmis à Supabase) :
 * la RLS s'applique, l'utilisateur ne peut lire que son propre profil.
 */
export function createUserProfileLoader(options: {
  supabaseUrl: string;
  publishableKey: string;
}): UserProfileLoader {
  return async (accessToken, userId) => {
    const supabase = createUserClient({
      url: options.supabaseUrl,
      publishableKey: options.publishableKey,
      accessToken,
    });
    const row = unwrap(
      await supabase
        .from("users")
        .select("id, email, full_name, role, is_active, mfa_required")
        .eq("id", userId)
        .maybeSingle(),
    );
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      role: row.role,
      isActive: row.is_active,
      mfaRequired: row.mfa_required,
    };
  };
}
