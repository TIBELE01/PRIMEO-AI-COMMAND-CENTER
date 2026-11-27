import type { FastifyError, FastifyInstance } from "fastify";

/**
 * Réponses d'erreur homogènes. Les erreurs internes (5xx) ne divulguent jamais leur détail
 * au client : il est uniquement journalisé côté serveur.
 */
export function registerErrorHandling(app: FastifyInstance): void {
  app.setNotFoundHandler((request, reply) => {
    void reply.status(404).send({
      error: "not_found",
      message: `Route introuvable : ${request.method} ${request.url}`,
    });
  });

  app.setErrorHandler((error: FastifyError, request, reply) => {
    const statusCode = error.statusCode ?? 500;
    if (statusCode >= 500) {
      request.log.error({ err: error }, "Erreur interne");
      void reply
        .status(500)
        .send({ error: "internal_error", message: "Erreur interne du serveur." });
      return;
    }
    void reply
      .status(statusCode)
      .send({ error: error.code ?? "bad_request", message: error.message });
  });
}
