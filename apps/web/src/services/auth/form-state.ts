/** État renvoyé par les actions serveur des formulaires d'authentification. */
export interface FormState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
}

export const initialFormState: FormState = { status: "idle" };

/** Convertit les erreurs de validation zod en un message par champ. */
export function toFieldErrors(issues: ReadonlyArray<{ path: PropertyKey[]; message: string }>) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    fieldErrors[key] ??= issue.message;
  }
  return fieldErrors;
}
