import type { FastifyReply, FastifyRequest } from "fastify";
import type { AccessTokenVerifier } from "../modules/authentication/access-token";
import type { UserProfile, UserProfileLoader } from "../modules/authentication/user-profile";

export interface AuthenticatedUser extends UserProfile {
  accessToken: string;
  assuranceLevel: "aal1" | "aal2";
}

declare module "fastify" {
  interface FastifyRequest {
    currentUser: AuthenticatedUser | null;
  }
}

function bearerToken(request: FastifyRequest): string | null {
  const header = request.headers.authorization;
  if (!header) {
    return null;
  }
  const [scheme, token] = header.split(" ");
  return scheme?.toLowerCase() === "bearer" && token ? token : null;
}

/**
 * Garde des routes privées :
 *  - 401 si le jeton est absent, invalide ou expiré ;
 *  - 403 si l'utilisateur n'a pas de profil applicatif actif.
 */
export function createAuthenticationGuard(dependencies: {
  verifyAccessToken: AccessTokenVerifier;
  loadUserProfile: UserProfileLoader;
}) {
  return async function requireAuthenticatedUser(request: FastifyRequest, reply: FastifyReply) {
    const token = bearerToken(request);
    if (!token) {
      return reply
        .status(401)
        .send({ error: "unauthenticated", message: "Authentification requise." });
    }

    let verified;
    try {
      verified = await dependencies.verifyAccessToken(token);
    } catch {
      return reply
        .status(401)
        .send({ error: "unauthenticated", message: "Session invalide ou expirée." });
    }

    const profile = await dependencies.loadUserProfile(token, verified.userId);
    if (!profile || !profile.isActive) {
      return reply.status(403).send({ error: "forbidden", message: "Accès non autorisé." });
    }

    request.currentUser = {
      ...profile,
      accessToken: token,
      assuranceLevel: verified.assuranceLevel,
    };
  };
}
