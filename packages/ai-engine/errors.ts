import type { ProviderId } from "./types";

export type AIErrorKind =
  | "authentication"
  | "permission"
  | "invalid_request"
  | "not_found"
  | "rate_limit"
  | "overloaded"
  | "server"
  | "timeout"
  | "network"
  | "provider_unavailable"
  | "unknown";

const RETRYABLE: ReadonlySet<AIErrorKind> = new Set([
  "rate_limit",
  "overloaded",
  "server",
  "timeout",
  "network",
]);

/** Erreur normalisée, identique quel que soit le fournisseur. */
export class AIProviderError extends Error {
  readonly provider: ProviderId;
  readonly kind: AIErrorKind;
  readonly status: number | undefined;
  /** Vrai si une nouvelle tentative (ou un autre fournisseur) a une chance de réussir. */
  readonly retryable: boolean;

  constructor(options: {
    provider: ProviderId;
    kind: AIErrorKind;
    message: string;
    status?: number;
  }) {
    super(options.message);
    this.name = "AIProviderError";
    this.provider = options.provider;
    this.kind = options.kind;
    this.status = options.status;
    this.retryable = RETRYABLE.has(options.kind);
  }
}

/** Classe un code HTTP en type d'erreur normalisé. */
export function kindFromStatus(status: number | undefined): AIErrorKind {
  if (status === undefined) return "network";
  if (status === 401) return "authentication";
  if (status === 403) return "permission";
  if (status === 404) return "not_found";
  if (status === 408) return "timeout";
  if (status === 429) return "rate_limit";
  if (status === 529 || status === 503) return "overloaded";
  if (status >= 500) return "server";
  if (status >= 400) return "invalid_request";
  return "unknown";
}
