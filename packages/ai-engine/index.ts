// @primeo/ai-engine — interface commune vers les fournisseurs d'IA (serveur uniquement).
export { AIProviderError, kindFromStatus, type AIErrorKind } from "./errors";
export {
  AIEngine,
  type AttemptRecord,
  type EngineRequest,
  type EngineResult,
  type UsageListener,
} from "./model-router/ai-engine";
export { createAIEngineFromEnvironment } from "./model-router/from-environment";
export { parseModelReference, type ModelReference } from "./model-router/model-reference";
export {
  ANTHROPIC_PROVIDER_ID,
  AnthropicProvider,
  DEFAULT_ANTHROPIC_MODEL,
  type AnthropicProviderOptions,
} from "./providers/anthropic/anthropic-provider";
export {
  createDeepSeekProvider,
  DEEPSEEK_BASE_URL,
  DEEPSEEK_PROVIDER_ID,
} from "./providers/deepseek/deepseek-provider";
export {
  OpenAICompatibleProvider,
  type OpenAICompatibleProviderOptions,
} from "./providers/openai-compatible/openai-compatible-provider";
export { createOpenAIProvider, OPENAI_PROVIDER_ID } from "./providers/openai/openai-provider";
export { assertUsable, UnusableResponseError } from "./response-handler/guards";
export { parseToolArguments } from "./response-handler/tool-arguments";
export type * from "./types";
