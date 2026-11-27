import { AIProviderError, createDeepSeekProvider, createOpenAIProvider } from "@primeo/ai-engine";
import { describe, expect, it } from "vitest";
import { createFakeFetch } from "./fake-fetch";

function completion(message: Record<string, unknown>, extra: Record<string, unknown> = {}) {
  return {
    id: "chatcmpl-test",
    object: "chat.completion",
    created: 1_790_000_000,
    model: "modele-test",
    choices: [
      {
        index: 0,
        message: { role: "assistant", refusal: null, ...message },
        finish_reason: "stop",
      },
    ],
    usage: { prompt_tokens: 50, completion_tokens: 10, total_tokens: 60 },
    ...extra,
  };
}

const TOOL = {
  name: "creer_mission",
  description: "Crée une mission.",
  inputSchema: { type: "object", properties: { titre: { type: "string" } } },
};

describe("OpenAI", () => {
  it("traduit la requête vers Chat Completions", async () => {
    const fake = createFakeFetch([{ body: completion({ content: "Bonjour." }) }]);
    const openai = createOpenAIProvider({
      apiKey: "cle-de-test",
      maxRetries: 0,
      fetch: fake.fetch,
    });
    const result = await openai.generate({
      model: "modele-openai",
      system: "Tu es le directeur marketing.",
      messages: [{ role: "user", content: "Propose une campagne." }],
      tools: [TOOL],
      reasoningEffort: "medium",
      maxOutputTokens: 2000,
    });

    const request = fake.requests[0]!;
    expect(request.url).toBe("https://api.openai.com/v1/chat/completions");
    expect(request.headers.authorization).toBe("Bearer cle-de-test");
    expect(request.body).toMatchObject({
      model: "modele-openai",
      max_completion_tokens: 2000,
      reasoning_effort: "medium",
      messages: [
        { role: "system", content: "Tu es le directeur marketing." },
        { role: "user", content: "Propose une campagne." },
      ],
      tools: [
        { type: "function", function: { name: "creer_mission", parameters: TOOL.inputSchema } },
      ],
    });
    expect(result).toMatchObject({ provider: "openai", text: "Bonjour.", finishReason: "stop" });
  });

  it("décode les appels d'outils, y compris un JSON invalide", async () => {
    const fake = createFakeFetch([
      {
        body: {
          ...completion({
            content: null,
            tool_calls: [
              {
                id: "call_1",
                type: "function",
                function: { name: "creer_mission", arguments: '{"titre":"Audit"}' },
              },
              {
                id: "call_2",
                type: "function",
                function: { name: "creer_mission", arguments: "{titre:" },
              },
            ],
          }),
          choices: [
            {
              index: 0,
              finish_reason: "tool_calls",
              message: {
                role: "assistant",
                content: null,
                refusal: null,
                tool_calls: [
                  {
                    id: "call_1",
                    type: "function",
                    function: { name: "creer_mission", arguments: '{"titre":"Audit"}' },
                  },
                  {
                    id: "call_2",
                    type: "function",
                    function: { name: "creer_mission", arguments: "{titre:" },
                  },
                ],
              },
            },
          ],
        },
      },
    ]);
    const openai = createOpenAIProvider({
      apiKey: "cle-de-test",
      maxRetries: 0,
      fetch: fake.fetch,
    });
    const result = await openai.generate({
      model: "m",
      messages: [{ role: "user", content: "x" }],
    });
    expect(result.finishReason).toBe("tool_calls");
    expect(result.toolCalls).toEqual([
      {
        id: "call_1",
        name: "creer_mission",
        arguments: { titre: "Audit" },
        rawArguments: '{"titre":"Audit"}',
      },
      { id: "call_2", name: "creer_mission", arguments: null, rawArguments: "{titre:" },
    ]);
  });

  it("renvoie l'historique d'outils au format attendu", async () => {
    const fake = createFakeFetch([{ body: completion({ content: "Mission créée." }) }]);
    const openai = createOpenAIProvider({
      apiKey: "cle-de-test",
      maxRetries: 0,
      fetch: fake.fetch,
    });
    await openai.generate({
      model: "m",
      messages: [
        { role: "user", content: "Crée la mission." },
        {
          role: "assistant",
          content: "",
          toolCalls: [
            {
              id: "call_1",
              name: "creer_mission",
              arguments: { titre: "Audit" },
              rawArguments: '{"titre":"Audit"}',
            },
          ],
        },
        { role: "tool", toolCallId: "call_1", toolName: "creer_mission", content: "OK" },
      ],
    });
    expect(fake.requests[0]!.body.messages).toEqual([
      { role: "user", content: "Crée la mission." },
      {
        role: "assistant",
        content: null,
        tool_calls: [
          {
            id: "call_1",
            type: "function",
            function: { name: "creer_mission", arguments: '{"titre":"Audit"}' },
          },
        ],
      },
      { role: "tool", tool_call_id: "call_1", content: "OK" },
    ]);
  });

  it("signale un refus", async () => {
    const fake = createFakeFetch([
      { body: completion({ content: null, refusal: "Je ne peux pas aider." }) },
    ]);
    const openai = createOpenAIProvider({
      apiKey: "cle-de-test",
      maxRetries: 0,
      fetch: fake.fetch,
    });
    const result = await openai.generate({
      model: "m",
      messages: [{ role: "user", content: "x" }],
    });
    expect(result.finishReason).toBe("refusal");
    expect(result.refusal?.explanation).toBe("Je ne peux pas aider.");
  });

  it.each([
    [401, "authentication"],
    [429, "rate_limit"],
    [500, "server"],
  ])("normalise une erreur HTTP %i", async (status, kind) => {
    const fake = createFakeFetch([
      { status, body: { error: { message: "Erreur simulée", type: "x" } } },
    ]);
    const openai = createOpenAIProvider({
      apiKey: "cle-de-test",
      maxRetries: 0,
      fetch: fake.fetch,
    });
    const error = await openai
      .generate({ model: "m", messages: [{ role: "user", content: "x" }] })
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(AIProviderError);
    expect(error).toMatchObject({ provider: "openai", kind });
  });
});

describe("DeepSeek", () => {
  it("utilise l'API DeepSeek, max_tokens et le cache propre à DeepSeek", async () => {
    const fake = createFakeFetch([
      {
        body: completion(
          { content: "Analyse terminée.", reasoning_content: "raisonnement interne" },
          {
            usage: {
              prompt_tokens: 100,
              completion_tokens: 20,
              total_tokens: 120,
              prompt_cache_hit_tokens: 64,
            },
          },
        ),
      },
    ]);
    const deepseek = createDeepSeekProvider({
      apiKey: "cle-de-test",
      maxRetries: 0,
      fetch: fake.fetch,
    });
    const result = await deepseek.generate({
      model: "deepseek-chat",
      messages: [{ role: "user", content: "x" }],
      reasoningEffort: "high",
      maxOutputTokens: 1000,
    });

    const request = fake.requests[0]!;
    expect(request.url).toBe("https://api.deepseek.com/chat/completions");
    expect(request.body).toMatchObject({ model: "deepseek-chat", max_tokens: 1000 });
    expect(request.body).not.toHaveProperty("reasoning_effort");
    expect(result.warnings[0]).toMatch(/reasoningEffort/);
    expect(result).toMatchObject({
      provider: "deepseek",
      text: "Analyse terminée.",
      usage: { inputTokens: 100, outputTokens: 20, cachedInputTokens: 64 },
    });
  });
});
