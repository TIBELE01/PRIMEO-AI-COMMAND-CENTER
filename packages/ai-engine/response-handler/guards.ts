import type { GenerateResult } from "../types";

/** Résultat exploitable : ni refusé, ni tronqué. Utile avant d'agir sur une réponse. */
export class UnusableResponseError extends Error {
  readonly result: GenerateResult;

  constructor(result: GenerateResult, reason: string) {
    super(reason);
    this.name = "UnusableResponseError";
    this.result = result;
  }
}

export function assertUsable(result: GenerateResult): GenerateResult {
  if (result.finishReason === "refusal") {
    throw new UnusableResponseError(result, "Le modèle a refusé la demande.");
  }
  if (result.finishReason === "length") {
    throw new UnusableResponseError(result, "Réponse tronquée : plafond de jetons atteint.");
  }
  if (result.finishReason === "content_filter") {
    throw new UnusableResponseError(result, "Réponse bloquée par le filtre du fournisseur.");
  }
  return result;
}
