import { AIProviderError, AnthropicProvider, type ChatMessage } from "@primeo/ai-engine";
import { describe, expect, it } from "vitest";
import { createFakeFetch } from "./fake-fetch";

const TOOL = {
  name: "lire_rapport",
  description: "Lit un rapport par son identifiant.",
  inputSchema: { properties: { id: { type: "string" } }, required: ["id"] },
};

function anthropicMessage(overrides: Record<string, unknown> = {}) {
  return {
    id: "msg_test",
    type: "message",
    role: "assistant",
    model: "claude-opus-5-5",
    content: [
      { type: "thinking", thinking: "", signature: "signature-test" },
      { type: "text", text: "Je consulte le rapport." },
      { type: "tool_use", id: "toolu_1", name: "lire_rapport", input: { id: "R-1" } },
    ],
    stop_reason: "tool_use",
    stop_sequence: null,
    stop_details: null,
    usage: { input_tokens: 120, output_tokens: 30, cache_read_input_tokens: 80, iterations: null },
    ...overrides,
  };
}

function provider(responses: Array<{ status?: number; body: unknown }>) {
  const fake = createFakeFetch(responses);
  return {
    provider: new AnthropicProvider({ apiKey: "cle-de-test", maxRetries: 0, fetch: fake.fetch }),
    fake,
  };
}

describe("AnthropicProvider", () => {
  it("traduit la requête commune vers l'API Messages", async () => {
    const { provider: claude, fake } = provider([{ body: anthropicMessage() }]);
    const result = await claude.generate({
      model: "claude-opus-5-5",
      system: "Tu es le directeur financier de Primeo.",
      messages: [{ role: "user", content: "Analyse le rapport R-1." }],
      tools: [TOOL],
      reasoningEffort: "high",
      temperature: 0.2,
    });

    const request = fake.requests[0]!;
    expect(request.url).toContain("/v1/messages");
    // La clé est transmise par le SDK officiel (en-tête d'authentification).
    expect(request.headers["x-api-key"] ?? request.headers.authorization).toContain("cle-de-test");
    expect(request.headers["anthropic-beta"]).toContain("server-side-fallback-2026-07-01");
    expect(request.body).toMatchObject({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      system: "Tu es le directeur financier de Primeo.",
      output_config: { effort: "high" },
      fallbacks: "default",
      tools: [{ name: "lire_rapport", input_schema: { type: "object", required: ["id"] } }],
    });
    // Les modèles Claude actuels refusent temperature : il n'est pas envoyé, et on prévient.
    expect(request.body).not.toHaveProperty("temperature");
    expect(result.warnings[0]).toMatch(/temperature/);
  });

  it("normalise la réponse : texte, appels d'outils, usage, état à rejouer", async () => {
    const { provider: claude } = provider([{ body: anthropicMessage() }]);
    const result = await claude.generate({
      model: "claude-opus-5-5",
      messages: [{ role: "user", content: "x" }],
    });

    expect(result).toMatchObject({
      provider: "anthropic",
      model: "claude-opus-5-5",
      text: "Je consulte le rapport.",
      finishReason: "tool_calls",
      toolCalls: [{ id: "toolu_1", name: "lire_rapport", arguments: { id: "R-1" } }],
      usage: { inputTokens: 120, outputTokens: 30, cachedInputTokens: 80 },
      servedByFallbackModel: false,
    });
    expect(result.message.providerState?.provider).toBe("anthropic");
  });

  it("rejoue le contenu brut (réflexion comprise) et regroupe les résultats d'outils", async () => {
    const { provider: claude, fake } = provider([
      { body: anthropicMessage() },
      { body: anthropicMessage() },
    ]);
    const first = await claude.generate({
      model: "claude-opus-5-5",
      messages: [{ role: "user", content: "x" }],
    });

    const history: ChatMessage[] = [
      { role: "user", content: "x" },
      first.message,
      {
        role: "tool",
        toolCallId: "toolu_1",
        toolName: "lire_rapport",
        content: "Chiffre d'affaires : 10",
      },
      {
        role: "tool",
        toolCallId: "toolu_2",
        toolName: "lire_rapport",
        content: "Introuvable",
        isError: true,
      },
    ];
    await claude.generate({ model: "claude-opus-5-5", messages: history });

    const messages = fake.requests[1]!.body.messages as Array<{ role: string; content: unknown }>;
    expect(messages).toHaveLength(3);
    expect(messages[1]!.content).toEqual(anthropicMessage().content);
    expect(messages[2]).toEqual({
      role: "user",
      content: [
        { type: "tool_result", tool_use_id: "toolu_1", content: "Chiffre d'affaires : 10" },
        { type: "tool_result", tool_use_id: "toolu_2", content: "Introuvable", is_error: true },
      ],
    });
  });

  it("ne rejoue pas l'état brut sur un autre modèle", async () => {
    const { provider: claude, fake } = provider([
      { body: anthropicMessage() },
      { body: anthropicMessage() },
    ]);
    const first = await claude.generate({
      model: "claude-opus-5-5",
      messages: [{ role: "user", content: "x" }],
    });
    await claude.generate({
      model: "claude-haiku-5-5",
      messages: [
        { role: "user", content: "x" },
        first.message,
        { role: "user", content: "Et ensuite ?" },
      ],
    });

    const request = fake.requests[1]!;
    const messages = request.body.messages as Array<{ content: unknown }>;
    expect(messages[1]!.content).toEqual([
      { type: "text", text: "Je consulte le rapport." },
      { type: "tool_use", id: "toolu_1", name: "lire_rapport", input: { id: "R-1" } },
    ]);
    // Pas de repli serveur pour ce modèle.
    expect(request.body).not.toHaveProperty("fallbacks");
  });

  it("signale un refus avec sa catégorie", async () => {
    const { provider: claude } = provider([
      {
        body: anthropicMessage({
          content: [],
          stop_reason: "refusal",
          stop_details: { type: "refusal", category: "cyber", explanation: "Demande refusée." },
        }),
      },
    ]);
    const result = await claude.generate({
      model: "claude-opus-5-5",
      messages: [{ role: "user", content: "x" }],
    });
    expect(result.finishReason).toBe("refusal");
    expect(result.refusal).toEqual({ category: "cyber", explanation: "Demande refusée." });
  });

  it("indique quand un modèle de repli a répondu", async () => {
    const { provider: claude } = provider([
      {
        body: anthropicMessage({
          content: [{ type: "text", text: "Réponse du modèle de repli." }],
          stop_reason: "end_turn",
          model: "claude-opus-4-8",
          usage: {
            input_tokens: 10,
            output_tokens: 5,
            iterations: [
              { type: "message", input_tokens: 10, output_tokens: 0 },
              { type: "fallback_message", input_tokens: 10, output_tokens: 5 },
            ],
          },
        }),
      },
    ]);
    const result = await claude.generate({
      model: "claude-opus-5-5",
      messages: [{ role: "user", content: "x" }],
    });
    expect(result.servedByFallbackModel).toBe(true);
    expect(result.model).toBe("claude-opus-4-8");
  });

  it.each([
    [401, "authentication", false],
    [429, "rate_limit", true],
    [529, "overloaded", true],
    [400, "invalid_request", false],
  ])("normalise une erreur HTTP %i", async (status, kind, retryable) => {
    const { provider: claude } = provider([
      { status, body: { type: "error", error: { type: "erreur", message: "Erreur simulée" } } },
    ]);
    const error = await claude
      .generate({ model: "claude-opus-5-5", messages: [{ role: "user", content: "x" }] })
      .catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(AIProviderError);
    expect(error).toMatchObject({ provider: "anthropic", kind, retryable, status });
  });
});
