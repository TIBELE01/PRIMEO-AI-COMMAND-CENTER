/** Erreur renvoyée par Supabase (PostgREST ou Auth), normalisée pour le reste du code. */
export class DatabaseError extends Error {
  readonly code: string | undefined;
  readonly details: string | undefined;
  readonly hint: string | undefined;

  constructor(error: { message: string; code?: string; details?: string; hint?: string }) {
    super(error.message);
    this.name = "DatabaseError";
    this.code = error.code;
    this.details = error.details;
    this.hint = error.hint;
  }
}

/** Ressource attendue mais absente (ou invisible du fait de la RLS). */
export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} introuvable.`);
    this.name = "NotFoundError";
  }
}
