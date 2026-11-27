/**
 * Contrat commun à tous les fournisseurs d'IA. Le reste de l'application ne manipule que ces
 * types : il ne sait jamais quel fournisseur répond.
 */

/** Identifiant d'un fournisseur enregistré (ex. "anthropic", "openai", "deepseek"). */
export type ProviderId = string;

/** Schéma JSON (draft 2020-12) décrivant les paramètres d'un outil. */
export type JsonSchema = Record<string, unknown>;

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: JsonSchema;
}

export interface ToolCall {
  id: string;
  name: string;
  /** Arguments décodés. `null` si le modèle a produit un JSON invalide (voir `rawArguments`). */
  arguments: Record<string, unknown> | null;
  rawArguments: string;
}

/**
 * État propre à un fournisseur (ex. blocs de réflexion d'Anthropic), conservé tel quel et
 * renvoyé UNIQUEMENT au même fournisseur et au même modèle. Ignoré ailleurs.
 */
export interface ProviderState {
  provider: ProviderId;
  model: string;
  data: unknown;
}

export interface UserMessage {
  role: "user";
  content: string;
}

export interface AssistantMessage {
  role: "assistant";
  content: string;
  toolCalls?: ToolCall[];
  providerState?: ProviderState;
}

export interface ToolResultMessage {
  role: "tool";
  toolCallId: string;
  toolName: string;
  content: string;
  isError?: boolean;
}

export type ChatMessage = UserMessage | AssistantMessage | ToolResultMessage;

/** Profondeur de raisonnement demandée. Chaque fournisseur la traduit à sa façon. */
export type ReasoningEffort = "low" | "medium" | "high";

export interface GenerateRequest {
  /** Modèle chez le fournisseur (ex. "claude-opus-5-5"). */
  model: string;
  system?: string;
  messages: ChatMessage[];
  tools?: ToolDefinition[];
  /** Plafond de jetons générés. Défaut : 16 000. */
  maxOutputTokens?: number;
  reasoningEffort?: ReasoningEffort;
  /** Ignorée par les modèles qui ne l'acceptent pas (un avertissement est renvoyé). */
  temperature?: number;
  signal?: AbortSignal;
}

export type FinishReason =
  "stop" | "length" | "tool_calls" | "refusal" | "content_filter" | "other";

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens: number;
}

export interface GenerateResult {
  provider: ProviderId;
  /** Modèle qui a effectivement répondu (peut différer en cas de repli). */
  model: string;
  text: string;
  toolCalls: ToolCall[];
  finishReason: FinishReason;
  usage: TokenUsage;
  latencyMs: number;
  /** Message à ajouter à l'historique pour poursuivre la conversation. */
  message: AssistantMessage;
  /** Détail d'un refus (finishReason = "refusal"). */
  refusal?: { category: string | null; explanation: string | null };
  /** Vrai si un modèle de repli du fournisseur a pris le relais (ex. refus côté Anthropic). */
  servedByFallbackModel: boolean;
  warnings: string[];
}

/** Interface à implémenter pour ajouter un fournisseur. */
export interface AIProvider {
  readonly id: ProviderId;
  generate(request: GenerateRequest): Promise<GenerateResult>;
}
