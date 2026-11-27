import { DatabaseError, NotFoundError } from "./errors";

/** Forme commune des réponses de supabase-js : { data, error }. */
interface SupabaseResult<T> {
  data: T;
  error: { message: string; code?: string; details?: string; hint?: string } | null;
}

/**
 * Renvoie les données d'une requête ou lève une `DatabaseError`.
 * Évite de traiter `error` à la main à chaque appel.
 */
export function unwrap<T>(result: SupabaseResult<T>): T {
  if (result.error) {
    throw new DatabaseError(result.error);
  }
  return result.data;
}

/**
 * Comme `unwrap`, mais lève une `NotFoundError` si aucune ligne n'est renvoyée.
 * À utiliser avec `.maybeSingle()`. Rappel : une ligne masquée par la RLS est « introuvable ».
 */
export function unwrapOne<T>(result: SupabaseResult<T | null>, resource: string): T {
  const data = unwrap(result);
  if (data === null) {
    throw new NotFoundError(resource);
  }
  return data;
}
