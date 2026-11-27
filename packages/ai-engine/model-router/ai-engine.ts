import { AIProviderError } from "../errors";
import type { AIProvider, GenerateRequest, GenerateResult, ProviderId } from "../types";
import { parseModelReference, type ModelReference } from "./model-reference";

export interface EngineRequest extends Omit<GenerateRequest, "model"> {
  /** Modèle principal, ex. "anthropic/claude-opus-5-5". */
  model: ModelReference;
  /** Modèles essayés dans l'ordre si le précédent échoue de façon temporaire. */
  fallbacks?: ModelReference[];
}

export interface AttemptRecord {
  model: ModelReference;
  outcome: "success" | "error";
  error?: { kind: AIProviderError["kind"]; message: string };
}

export interface EngineResult extends GenerateResult {
  /** Toutes les tentatives, dans l'ordre (traçabilité). */
  attempts: AttemptRecord[];
}

/** Notifié après chaque appel réussi : sert au suivi des coûts et au journal d'activité. */
export type UsageListener = (event: {
  reference: ModelReference;
  result: GenerateResult;
}) => void | Promise<void>;

/**
 * Point d'entrée unique pour appeler un modèle d'IA. Le code appelant ne connaît que des
 * références « fournisseur/modèle » ; changer de modèle est une affaire de configuration.
 */
export class AIEngine {
  private readonly providers = new Map<ProviderId, AIProvider>();
  private readonly listeners: UsageListener[] = [];

  register(provider: AIProvider): this {
    if (this.providers.has(provider.id)) {
      throw new Error(`Fournisseur déjà enregistré : ${provider.id}.`);
    }
    this.providers.set(provider.id, provider);
    return this;
  }

  /** Fournisseurs disponibles (ceux dont la clé est configurée). */
  get providerIds(): ProviderId[] {
    return [...this.providers.keys()];
  }

  isAvailable(reference: ModelReference): boolean {
    return this.providers.has(parseModelReference(reference).provider);
  }

  onUsage(listener: UsageListener): this {
    this.listeners.push(listener);
    return this;
  }

  async generate(request: EngineRequest): Promise<EngineResult> {
    const { model, fallbacks = [], ...rest } = request;
    const chain = [model, ...fallbacks];
    const attempts: AttemptRecord[] = [];
    let lastError: AIProviderError | undefined;

    for (const reference of chain) {
      const { provider: providerId, model: providerModel } = parseModelReference(reference);
      const provider = this.providers.get(providerId);
      if (!provider) {
        lastError = new AIProviderError({
          provider: providerId,
          kind: "provider_unavailable",
          message: `Fournisseur « ${providerId} » non configuré (clé API absente).`,
        });
        attempts.push({
          model: reference,
          outcome: "error",
          error: { kind: lastError.kind, message: lastError.message },
        });
        continue;
      }

      try {
        const result = await provider.generate({ ...rest, model: providerModel });
        attempts.push({ model: reference, outcome: "success" });
        await Promise.all(this.listeners.map((listener) => listener({ reference, result })));
        return { ...result, attempts };
      } catch (error) {
        const normalized =
          error instanceof AIProviderError
            ? error
            : new AIProviderError({
                provider: providerId,
                kind: "unknown",
                message: error instanceof Error ? error.message : String(error),
              });
        attempts.push({
          model: reference,
          outcome: "error",
          error: { kind: normalized.kind, message: normalized.message },
        });
        lastError = normalized;
        // Une requête invalide ou une clé refusée ne s'arrangera pas ailleurs : on s'arrête.
        if (!normalized.retryable) {
          throw normalized;
        }
      }
    }

    throw lastError ?? new Error("Aucun modèle à essayer.");
  }
}
