import { AnthropicProvider } from "../providers/anthropic/anthropic-provider";
import { createDeepSeekProvider } from "../providers/deepseek/deepseek-provider";
import { createOpenAIProvider } from "../providers/openai/openai-provider";
import { AIEngine } from "./ai-engine";

/**
 * Construit le moteur à partir de la configuration validée (voir @primeo/security/secrets) :
 * chaque fournisseur n'est enregistré que si sa clé est présente.
 */
export function createAIEngineFromEnvironment(env: {
  ANTHROPIC_API_KEY?: string | undefined;
  OPENAI_API_KEY?: string | undefined;
  DEEPSEEK_API_KEY?: string | undefined;
}): AIEngine {
  const engine = new AIEngine();
  if (env.ANTHROPIC_API_KEY) {
    engine.register(new AnthropicProvider({ apiKey: env.ANTHROPIC_API_KEY }));
  }
  if (env.OPENAI_API_KEY) {
    engine.register(createOpenAIProvider({ apiKey: env.OPENAI_API_KEY }));
  }
  if (env.DEEPSEEK_API_KEY) {
    engine.register(createDeepSeekProvider({ apiKey: env.DEEPSEEK_API_KEY }));
  }
  return engine;
}
