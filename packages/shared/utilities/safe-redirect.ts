/**
 * Valide une destination de redirection fournie par l'utilisateur (paramètre `next`).
 * N'accepte que des chemins internes : empêche les redirections ouvertes vers un site tiers.
 */
export function safeRedirectPath(value: unknown, fallback = "/"): string {
  if (typeof value !== "string" || value.length === 0 || value.length > 512) {
    return fallback;
  }
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  if ([...value].some((character) => character.charCodeAt(0) < 0x20)) {
    return fallback;
  }
  return value;
}
