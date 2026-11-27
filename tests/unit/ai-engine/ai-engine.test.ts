import {
  AIEngine,
  AIProviderError,
  createAIEngineFromEnvironment,
  type AIProvider,
  type GenerateRequest,
  type GenerateResult,
} from "@primeo/ai-engine";
import { describe, expect, it, vi } from "vitest";

function result(provider: string, model: string): GenerateResult {
  return {
    provider,
    model,
    text: `Réponse de ${provider}`,
    toolCalls: [],
    finishReason: "stop",
    usage: { inputTokens: 1, outputTokens: 1, cachedInputTokens: 0 },
    latencyMs: 1,
    message: { role: "assistant", content: `Réponse de ${provider}` },
    servedByFallbackModel: false,
    warnings: [],
  };
}

function stubProvider(
  id: string,
  behaviour: (request: GenerateRequest) => GenerateResult | Error,
): AIProvider & {
  calls: GenerateRequest[];
} {
  const calls: GenerateRequest[] = [];
  return {
    id,
    calls,
    async generate(request) {
      calls.push(request);
      const outcome = behaviour(request);
      if (outcome instanceof Error) throw outcome;
      return outcome;
    },
  };
}

const ok = (id: string) => stubProvider(id, (request) => result(id, request.model));
const failing = (id: string, kind: AIProviderError["kind"]) =>
  stubProvider(id, () => new AIProviderError({ provider: id, kind, message: `échec ${kind}` }));

const messages = [{ role: "user" as const, content: "Bonjour" }];

describe("AIEngine", () => {
  it("achemine la requête vers le fournisseur de la référence", async () => {
    const anthropic = ok("anthropic");
    const engine = new AIEngine().register(anthropic).register(ok("openai"));
    const response = await engine.generate({ model: "anthropic/claude-opus-5-5", messages });
    expect(anthropic.calls[0]!.model).toBe("claude-opus-5-5");
    expect(response.provider).toBe("anthropic");
    expect(response.attempts).toEqual([{ model: "anthropic/claude-opus-5-5", outcome: "success" }]);
  });

  it("bascule sur le modèle de repli en cas d'erreur temporaire", async () => {
    const engine = new AIEngine()
      .register(failing("anthropic", "overloaded"))
      .register(ok("deepseek"));
    const response = await engine.generate({
      model: "anthropic/claude-opus-5-5",
      fallbacks: ["deepseek/deepseek-chat"],
      messages,
    });
    expect(response.provider).toBe("deepseek");
    expect(response.attempts.map((attempt) => attempt.outcome)).toEqual(["error", "success"]);
  });

  it("ne bascule pas si l'erreur ne peut pas se résoudre ailleurs", async () => {
    const deepseek = ok("deepseek");
    const engine = new AIEngine()
      .register(failing("anthropic", "invalid_request"))
      .register(deepseek);
    await expect(
      engine.generate({
        model: "anthropic/claude-opus-5-5",
        fallbacks: ["deepseek/deepseek-chat"],
        messages,
      }),
    ).rejects.toMatchObject({ kind: "invalid_request" });
    expect(deepseek.calls).toHaveLength(0);
  });

  it("ignore un fournisseur non configuré et passe au suivant", async () => {
    const engine = new AIEngine().register(ok("openai"));
    const response = await engine.generate({
      model: "anthropic/claude-opus-5-5",
      fallbacks: ["openai/modele-openai"],
      messages,
    });
    expect(response.provider).toBe("openai");
    expect(response.attempts[0]).toMatchObject({
      outcome: "error",
      error: { kind: "provider_unavailable" },
    });
  });

  it("échoue clairement si aucun fournisseur n'est disponible", async () => {
    await expect(
      new AIEngine().generate({ model: "anthropic/claude-opus-5-5", messages }),
    ).rejects.toMatchObject({
      kind: "provider_unavailable",
    });
  });

  it("notifie la consommation après chaque appel réussi", async () => {
    const listener = vi.fn();
    const engine = new AIEngine().register(ok("anthropic")).onUsage(listener);
    await engine.generate({ model: "anthropic/claude-opus-5-5", messages });
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ reference: "anthropic/claude-opus-5-5" }),
    );
  });

  it("refuse une référence de modèle mal formée", async () => {
    await expect(
      new AIEngine().generate({ model: "claude" as `${string}/${string}`, messages }),
    ).rejects.toThrow(/fournisseur\/modèle/);
  });

  it("n'enregistre que les fournisseurs dont la clé est configurée", () => {
    const engine = createAIEngineFromEnvironment({
      ANTHROPIC_API_KEY: "cle",
      DEEPSEEK_API_KEY: "cle",
    });
    expect(engine.providerIds.sort()).toEqual(["anthropic", "deepseek"]);
    expect(engine.isAvailable("openai/modele")).toBe(false);
  });
});
