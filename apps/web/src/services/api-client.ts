import {
  currentUserSchema,
  healthResponseSchema,
  type CurrentUser,
  type HealthResponse,
} from "@primeo/shared";
import { API_URL } from "@/utils/env";

export type ApiHealth = { reachable: true; data: HealthResponse } | { reachable: false };

/**
 * Interroge la route de santé de l'API. Ne lève jamais d'exception : une API injoignable ou
 * une réponse non conforme est signalée comme telle, sans masquer l'état réel.
 */
export async function fetchApiHealth(): Promise<ApiHealth> {
  try {
    const response = await fetch(`${API_URL}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2_000),
    });
    if (!response.ok) {
      return { reachable: false };
    }
    const parsed = healthResponseSchema.safeParse(await response.json());
    return parsed.success ? { reachable: true, data: parsed.data } : { reachable: false };
  } catch {
    return { reachable: false };
  }
}

/**
 * Profil de l'utilisateur tel que l'API le voit (`GET /me`), à partir de son jeton d'accès.
 * Renvoie null si l'API refuse le jeton ou est injoignable.
 */
export async function fetchCurrentUserFromApi(accessToken: string): Promise<CurrentUser | null> {
  try {
    const response = await fetch(`${API_URL}/me`, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(3_000),
    });
    if (!response.ok) {
      return null;
    }
    const parsed = currentUserSchema.safeParse(await response.json());
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
