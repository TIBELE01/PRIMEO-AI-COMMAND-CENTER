import OpenAI from "openai";
import { AIProviderError, kindFromStatus } from "../../errors";
import { parseToolArguments } from "../../response-handler/tool-arguments";
import type {
  AIProvider,
  AssistantMessage,
  ChatMessage,
  FinishReason,
  GenerateRequest,
  GenerateResult,
  ProviderId,
  ToolCall,
} from "../../types";

type ChatMessageParam = OpenAI.Chat.Completions.ChatCompletionMessageParam;

const DEFAULT_MAX_OUTPUT_TOKENS = 16_000;

export interface OpenAICompatibleProviderOptions {
  /** Identifiant du fournisseur dans le moteur (ex. "openai", "deepseek"). */
  id: ProviderId;
  apiKey: string;
  /** Adresse de l'API ; omise pour OpenAI. */
  baseURL?: string;
  /**
   * Nom du paramètre de plafond de jetons : `max_completion_tokens` (OpenAI actuel) ou
   * `max_tokens` (fournisseurs compatibles plus anciens, dont DeepSeek).
   */
  maxTokensParameter: "max_completion_tokens" | "max_tokens";
  /** Le fournisseur accepte-t-il le paramètre `reasoning_effort` ? */
  supportsReasoningEffort: boolean;
  maxRetries?: number;
  timeoutMs?: number;
  fetch?: typeof fetch;
}

function toChatMessages(system: string | undefined, messages: ChatMessage[]): ChatMessageParam[] {
  const result: ChatMessageParam[] = system ? [{ role: "system", content: system }] : [];
  for (const message of messages) {
    if (message.role === "user") {
      result.push({ role: "user", content: message.content });
    } else if (message.role === "assistant") {
      // Seuls le texte et les appels d'outils sont renvoyés : l'éventuel raisonnement interne
      // d'un fournisseur (ex. reasoning_content de DeepSeek) ne doit pas être réinjecté.
      result.push({
        role: "assistant",
        content: message.content || null,
        ...(message.toolCalls?.length
          ? {
              tool_calls: message.toolCalls.map((call) => ({
                id: call.id,
                type: "function" as const,
                function: { name: call.name, arguments: call.rawArguments },
              })),
            }
          : {}),
      });
    } else {
      result.push({
        role: "tool",
        tool_call_id: message.toolCallId,
        content: message.isError ? `ERREUR : ${message.content}` : message.content,
      });
    }
  }
  return result;
}

function finishReasonOf(reason: string | null | undefined, refused: boolean): FinishReason {
  if (refused) return "refusal";
  switch (reason) {
    case "stop":
      return "stop";
    case "length":
      return "length";
    case "tool_calls":
    case "function_call":
      return "tool_calls";
    case "content_filter":
      return "content_filter";
    default:
      return "other";
  }
}

/**
 * Fournisseur pour toute API compatible « Chat Completions » d'OpenAI, via le SDK officiel
 * `openai`. Sert à OpenAI et à DeepSeek, et peut servir à d'autres (Mistral, Groq…).
 */
export class OpenAICompatibleProvider implements AIProvider {
  readonly id: ProviderId;
  private readonly client: OpenAI;
  private readonly options: OpenAICompatibleProviderOptions;

  constructor(options: OpenAICompatibleProviderOptions) {
    this.id = options.id;
    this.options = options;
    this.client = new OpenAI({
      apiKey: options.apiKey,
      maxRetries: options.maxRetries ?? 2,
      timeout: options.timeoutMs ?? 10 * 60 * 1000,
      ...(options.baseURL ? { baseURL: options.baseURL } : {}),
      ...(options.fetch ? { fetch: options.fetch } : {}),
    });
  }

  private toProviderError(error: unknown): AIProviderError {
    if (error instanceof OpenAI.APIConnectionTimeoutError) {
      return new AIProviderError({ provider: this.id, kind: "timeout", message: error.message });
    }
    if (error instanceof OpenAI.APIConnectionError) {
      return new AIProviderError({ provider: this.id, kind: "network", message: error.message });
    }
    if (error instanceof OpenAI.APIError) {
      return new AIProviderError({
        provider: this.id,
        kind: kindFromStatus(error.status),
        message: error.message,
        ...(error.status === undefined ? {} : { status: error.status }),
      });
    }
    return new AIProviderError({
      provider: this.id,
      kind: "unknown",
      message: error instanceof Error ? error.message : String(error),
    });
  }

  async generate(request: GenerateRequest): Promise<GenerateResult> {
    const warnings: string[] = [];
    const maxTokens = request.maxOutputTokens ?? DEFAULT_MAX_OUTPUT_TOKENS;
    if (request.reasoningEffort && !this.options.supportsReasoningEffort) {
      warnings.push(`reasoningEffort ignoré : non pris en charge par ${this.id}.`);
    }

    const startedAt = performance.now();
    let completion: OpenAI.Chat.Completions.ChatCompletion;
    try {
      completion = await this.client.chat.completions.create(
        {
          model: request.model,
          messages: toChatMessages(request.system, request.messages),
          [this.options.maxTokensParameter]: maxTokens,
          ...(request.tools?.length
            ? {
                tools: request.tools.map((tool) => ({
                  type: "function" as const,
                  function: {
                    name: tool.name,
                    description: tool.description,
                    parameters: tool.inputSchema,
                  },
                })),
              }
            : {}),
          ...(request.reasoningEffort && this.options.supportsReasoningEffort
            ? { reasoning_effort: request.reasoningEffort }
            : {}),
          ...(request.temperature !== undefined ? { temperature: request.temperature } : {}),
        },
        request.signal ? { signal: request.signal } : undefined,
      );
    } catch (error) {
      throw this.toProviderError(error);
    }

    const choice = completion.choices[0];
    if (!choice) {
      throw new AIProviderError({
        provider: this.id,
        kind: "unknown",
        message: "Réponse sans contenu.",
      });
    }

    const toolCalls: ToolCall[] = [];
    for (const call of choice.message.tool_calls ?? []) {
      if (call.type === "function") {
        toolCalls.push({
          id: call.id,
          name: call.function.name,
          arguments: parseToolArguments(call.function.arguments),
          rawArguments: call.function.arguments,
        });
      }
    }

    const refusalText = choice.message.refusal ?? null;
    const text = choice.message.content ?? "";
    const finishReason = finishReasonOf(choice.finish_reason, refusalText !== null);
    const message: AssistantMessage = {
      role: "assistant",
      content: text,
      ...(toolCalls.length ? { toolCalls } : {}),
    };

    // Jetons servis depuis le cache : champ OpenAI, ou champ propre à DeepSeek.
    const usage = completion.usage as
      (OpenAI.CompletionUsage & { prompt_cache_hit_tokens?: number }) | undefined;
    const cachedInputTokens =
      usage?.prompt_tokens_details?.cached_tokens ?? usage?.prompt_cache_hit_tokens ?? 0;

    return {
      provider: this.id,
      model: completion.model,
      text,
      toolCalls,
      finishReason,
      usage: {
        inputTokens: usage?.prompt_tokens ?? 0,
        outputTokens: usage?.completion_tokens ?? 0,
        cachedInputTokens,
      },
      latencyMs: Math.round(performance.now() - startedAt),
      message,
      ...(finishReason === "refusal"
        ? { refusal: { category: null, explanation: refusalText } }
        : {}),
      servedByFallbackModel: false,
      warnings,
    };
  }
}
