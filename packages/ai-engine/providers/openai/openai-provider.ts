import { OpenAICompatibleProvider } from "../openai-compatible/openai-compatible-provider";

export const OPENAI_PROVIDER_ID = "openai";

/** Fournisseur OpenAI (API Chat Completions). */
export function createOpenAIProvider(options: {
  apiKey: string;
  maxRetries?: number;
  timeoutMs?: number;
  fetch?: typeof fetch;
}): OpenAICompatibleProvider {
  return new OpenAICompatibleProvider({
    id: OPENAI_PROVIDER_ID,
    maxTokensParameter: "max_completion_tokens",
    supportsReasoningEffort: true,
    ...options,
  });
}
