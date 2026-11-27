import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from "jose";

export interface VerifiedAccessToken {
  userId: string;
  /** Niveau d'authentification : aal2 = double authentification effectuée. */
  assuranceLevel: "aal1" | "aal2";
}

export type AccessTokenVerifier = (token: string) => Promise<VerifiedAccessToken>;

/**
 * Vérifie un jeton d'accès Supabase LOCALEMENT : signature (clés publiques du projet),
 * émetteur, audience et expiration. Aucun appel réseau par requête (clés mises en cache).
 */
export function createAccessTokenVerifier(options: {
  supabaseUrl: string;
  keys?: JWTVerifyGetKey;
}): AccessTokenVerifier {
  const issuer = `${options.supabaseUrl.replace(/\/$/, "")}/auth/v1`;
  const keys = options.keys ?? createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));

  return async (token) => {
    const { payload } = await jwtVerify(token, keys, {
      issuer,
      audience: "authenticated",
      algorithms: ["ES256", "RS256"],
    });
    if (typeof payload.sub !== "string" || payload.sub.length === 0) {
      throw new Error("Jeton sans identifiant d'utilisateur.");
    }
    return { userId: payload.sub, assuranceLevel: payload.aal === "aal2" ? "aal2" : "aal1" };
  };
}
