import Anthropic from "@anthropic-ai/sdk";
import { AIProviderError, kindFromStatus } from "../../errors";
import type {
  AIProvider,
  AssistantMessage,
  ChatMessage,
  FinishReason,
  GenerateRequest,
  GenerateResult,
  ToolCall,
} from "../../types";

type BetaMessageParam = Anthropic.Beta.BetaMessageParam;
type BetaContentBlockParam = Anthropic.Beta.BetaContentBlockParam;
type BetaToolResultBlockParam = Anthropic.Beta.BetaToolResultBlockParam;

export const ANTHROPIC_PROVIDER_ID = "anthropic";

/** Modèle Claude utilisé par défaut. */
export const DEFAULT_ANTHROPIC_MODEL = "claude-opus-5-5";

/**
 * Modèles acceptant le repli côté serveur en cas de refus (`fallbacks: "default"`) :
 * la requête est relancée sur un modèle adapté au lieu de s'arrêter.
 */
const SERVER_FALLBACK_MODELS = new Set([
  "claude-fable-5-2",
  "claude-fable-5-1",
  "claude-opus-5-5",
  "claude-opus-5",
  "claude-sonnet-5-5",
]);
const SERVER_FALLBACK_BETA = "server-side-fallback-2026-07-01";

const DEFAULT_MAX_OUTPUT_TOKENS = 16_000;

export interface AnthropicProviderOptions {
  apiKey: string;
  /** Nouvelles tentatives automatiques du SDK (429, 5xx, réseau). Défaut : 2. */
  maxRetries?: number;
  /** Délai maximal d'une requête, en millisecondes. Défaut : 10 minutes. */
  timeoutMs?: number;
  /** Remplaçable pour les tests. */
  fetch?: typeof fetch;
}

/** Convertit l'historique commun au format de l'API Messages. */
function toAnthropicMessages(messages: ChatMessage[], model: string): BetaMessageParam[] {
  const result: BetaMessageParam[] = [];

  for (const message of messages) {
    if (message.role === "user") {
      result.push({ role: "user", content: message.content });
      continue;
    }

    if (message.role === "assistant") {
      const state = message.providerState;
      if (state?.provider === ANTHROPIC_PROVIDER_ID && state.model === model) {
        // Même modèle : le contenu brut (dont les blocs de réflexion) est renvoyé inchangé.
        result.push({ role: "assistant", content: state.data as BetaContentBlockParam[] });
        continue;
      }
      const blocks: BetaContentBlockParam[] = [];
      if (message.content) {
        blocks.push({ type: "text", text: message.content });
      }
      for (const call of message.toolCalls ?? []) {
        blocks.push({
          type: "tool_use",
          id: call.id,
          name: call.name,
          input: call.arguments ?? {},
        });
      }
      result.push({ role: "assistant", content: blocks });
      continue;
    }

    // Résultats d'outils : tous regroupés dans UN SEUL message utilisateur (appels parallèles).
    const block: BetaToolResultBlockParam = {
      type: "tool_result",
      tool_use_id: message.toolCallId,
      content: message.content,
      ...(message.isError ? { is_error: true } : {}),
    };
    const previous = result.at(-1);
    if (
      previous?.role === "user" &&
      Array.isArray(previous.content) &&
      previous.content.every((item) => item.type === "tool_result")
    ) {
      previous.content.push(block);
    } else {
      result.push({ role: "user", content: [block] });
    }
  }

  return result;
}

function finishReasonOf(stopReason: string | null): FinishReason {
  switch (stopReason) {
    case "end_turn":
    case "stop_sequence":
      return "stop";
    case "max_tokens":
    case "model_context_window_exceeded":
      return "length";
    case "tool_use":
      return "tool_calls";
    case "refusal":
      return "refusal";
    default:
      return "other";
  }
}

function toProviderError(error: unknown): AIProviderError {
  if (error instanceof Anthropic.APIConnectionTimeoutError) {
    return new AIProviderError({
      provider: ANTHROPIC_PROVIDER_ID,
      kind: "timeout",
      message: error.message,
    });
  }
  if (error instanceof Anthropic.APIConnectionError) {
    return new AIProviderError({
      provider: ANTHROPIC_PROVIDER_ID,
      kind: "network",
      message: error.message,
    });
  }
  if (error instanceof Anthropic.APIError) {
    return new AIProviderError({
      provider: ANTHROPIC_PROVIDER_ID,
      kind: kindFromStatus(error.status),
      message: error.message,
      ...(error.status === undefined ? {} : { status: error.status }),
    });
  }
  return new AIProviderError({
    provider: ANTHROPIC_PROVIDER_ID,
    kind: "unknown",
    message: error instanceof Error ? error.message : String(error),
  });
}

/** Fournisseur Anthropic (Claude), via le SDK officiel. */
export class AnthropicProvider implements AIProvider {
  readonly id = ANTHROPIC_PROVIDER_ID;
  private readonly client: Anthropic;

  constructor(options: AnthropicProviderOptions) {
    this.client = new Anthropic({
      apiKey: options.apiKey,
      maxRetries: options.maxRetries ?? 2,
      timeout: options.timeoutMs ?? 10 * 60 * 1000,
      ...(options.fetch ? { fetch: options.fetch } : {}),
    });
  }

  async generate(request: GenerateRequest): Promise<GenerateResult> {
    const warnings: string[] = [];
    if (request.temperature !== undefined) {
      // Les modèles Claude actuels refusent les paramètres d'échantillonnage.
      warnings.push("temperature ignorée : non prise en charge par les modèles Claude actuels.");
    }

    const useServerFallback = SERVER_FALLBACK_MODELS.has(request.model);
    const startedAt = performance.now();

    let response: Anthropic.Beta.BetaMessage;
    try {
      response = await this.client.beta.messages.create(
        {
          model: request.model,
          max_tokens: request.maxOutputTokens ?? DEFAULT_MAX_OUTPUT_TOKENS,
          messages: toAnthropicMessages(request.messages, request.model),
          ...(request.system ? { system: request.system } : {}),
          ...(request.tools?.length
            ? {
                tools: request.tools.map((tool) => ({
                  name: tool.name,
                  description: tool.description,
                  input_schema: { type: "object" as const, ...tool.inputSchema },
                })),
              }
            : {}),
          ...(request.reasoningEffort
            ? { output_config: { effort: request.reasoningEffort } }
            : {}),
          ...(useServerFallback
            ? { betas: [SERVER_FALLBACK_BETA], fallbacks: "default" as const }
            : {}),
        },
        request.signal ? { signal: request.signal } : undefined,
      );
    } catch (error) {
      throw toProviderError(error);
    }

    const textParts: string[] = [];
    const toolCalls: ToolCall[] = [];
    for (const block of response.content) {
      if (block.type === "text") {
        textParts.push(block.text);
      } else if (block.type === "tool_use") {
        const input =
          block.input !== null && typeof block.input === "object" && !Array.isArray(block.input)
            ? (block.input as Record<string, unknown>)
            : null;
        toolCalls.push({
          id: block.id,
          name: block.name,
          arguments: input,
          rawArguments: JSON.stringify(block.input),
        });
      }
    }

    const text = textParts.join("");
    const message: AssistantMessage = {
      role: "assistant",
      content: text,
      ...(toolCalls.length ? { toolCalls } : {}),
      providerState: {
        provider: ANTHROPIC_PROVIDER_ID,
        model: request.model,
        data: response.content,
      },
    };
    const finishReason = finishReasonOf(response.stop_reason);
    const servedByFallbackModel = (response.usage.iterations ?? []).some(
      (entry) => entry.type === "fallback_message",
    );

    return {
      provider: ANTHROPIC_PROVIDER_ID,
      model: response.model,
      text,
      toolCalls,
      finishReason,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        cachedInputTokens: response.usage.cache_read_input_tokens ?? 0,
      },
      latencyMs: Math.round(performance.now() - startedAt),
      message,
      ...(finishReason === "refusal"
        ? {
            refusal: {
              category: response.stop_details?.category ?? null,
              explanation: response.stop_details?.explanation ?? null,
            },
          }
        : {}),
      servedByFallbackModel,
      warnings,
    };
  }
}
