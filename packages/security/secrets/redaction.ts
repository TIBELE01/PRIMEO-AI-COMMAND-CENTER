import { ENVIRONMENT_CATALOG, type VariableName } from "./catalog";

export const REDACTED = "[secret masqué]";

/** Motifs de secrets connus, masqués même s'ils ne proviennent pas de l'environnement. */
const SECRET_PATTERNS: RegExp[] = [
  /sb_secret_[\w-]{10,}/g,
  /sk-ant-[\w-]{10,}/g,
  /sk-[A-Za-z0-9_-]{20,}/g,
  /eyJ[\w-]{10,}\.[\w-]{10,}\.[\w-]{10,}/g,
  /(Bearer\s+)[\w.~+/-]{20,}=*/gi,
];

/**
 * Masque dans un texte (message d'erreur, journal) :
 *  - les valeurs des variables secrètes de l'environnement ;
 *  - les motifs de clés et de jetons connus.
 */
export function redactSecrets(
  text: string,
  source: Record<string, string | undefined> = process.env,
): string {
  let result = text;
  for (const [name, definition] of Object.entries(ENVIRONMENT_CATALOG)) {
    if (definition.visibility !== "secret") {
      continue;
    }
    const value = source[name as VariableName];
    if (value && value.length >= 8) {
      result = result.split(value).join(REDACTED);
    }
  }
  for (const pattern of SECRET_PATTERNS) {
    result = result.replace(pattern, (match, bearerPrefix: string | undefined) =>
      typeof bearerPrefix === "string" && /^Bearer/i.test(bearerPrefix)
        ? `${bearerPrefix}${REDACTED}`
        : REDACTED,
    );
  }
  return result;
}
