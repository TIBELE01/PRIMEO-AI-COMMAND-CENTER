import { OpenAICompatibleProvider } from "../openai-compatible/openai-compatible-provider";

export const DEEPSEEK_PROVIDER_ID = "deepseek";
export const DEEPSEEK_BASE_URL = "https://api.deepseek.com";

/** Fournisseur DeepSeek (API compatible OpenAI). */
export function createDeepSeekProvider(options: {
  apiKey: string;
  maxRetries?: number;
  timeoutMs?: number;
  fetch?: typeof fetch;
}): OpenAICompatibleProvider {
  return new OpenAICompatibleProvider({
    id: DEEPSEEK_PROVIDER_ID,
    baseURL: DEEPSEEK_BASE_URL,
    maxTokensParameter: "max_tokens",
    supportsReasoningEffort: false,
    ...options,
  });
}
