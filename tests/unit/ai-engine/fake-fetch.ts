/** `fetch` simulé : enregistre les requêtes et renvoie les réponses prévues, dans l'ordre. */
export interface CapturedRequest {
  url: string;
  headers: Record<string, string>;
  body: Record<string, unknown>;
}

export function createFakeFetch(responses: Array<{ status?: number; body: unknown }>) {
  const requests: CapturedRequest[] = [];
  const queue = [...responses];

  const fakeFetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const headers: Record<string, string> = {};
    new Headers(init?.headers).forEach((value, key) => {
      headers[key] = value;
    });
    const rawBody = typeof init?.body === "string" ? init.body : "{}";
    requests.push({ url, headers, body: JSON.parse(rawBody) as Record<string, unknown> });

    const next = queue.shift();
    if (!next) {
      throw new Error("Aucune réponse simulée restante.");
    }
    return new Response(JSON.stringify(next.body), {
      status: next.status ?? 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;

  return { fetch: fakeFetch, requests };
}
