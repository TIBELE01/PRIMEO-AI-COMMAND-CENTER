/** Référence de modèle indépendante du code : "fournisseur/modèle" (ex. "anthropic/claude-opus-5-5"). */
export type ModelReference = `${string}/${string}`;

export function parseModelReference(reference: string): { provider: string; model: string } {
  const separator = reference.indexOf("/");
  if (separator <= 0 || separator === reference.length - 1) {
    throw new Error(
      `Référence de modèle invalide : « ${reference} » (attendu : fournisseur/modèle).`,
    );
  }
  return { provider: reference.slice(0, separator), model: reference.slice(separator + 1) };
}
