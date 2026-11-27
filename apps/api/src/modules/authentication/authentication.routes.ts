import type { CurrentUser } from "@primeo/shared";
import type { FastifyInstance, preHandlerAsyncHookHandler } from "fastify";

/** Routes du module d'authentification (la connexion elle-même est gérée par Supabase Auth). */
export function registerAuthenticationRoutes(
  app: FastifyInstance,
  requireAuthenticatedUser: preHandlerAsyncHookHandler,
): void {
  app.get(
    "/me",
    { preHandler: requireAuthenticatedUser },
    async (request): Promise<CurrentUser> => {
      const user = request.currentUser!;
      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        mfa: { required: user.mfaRequired, satisfied: user.assuranceLevel === "aal2" },
      };
    },
  );
}
