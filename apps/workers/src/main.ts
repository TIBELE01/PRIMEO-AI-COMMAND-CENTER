import { fileURLToPath } from "node:url";
import { SERVICES } from "@primeo/shared";
import { loadEnvFile } from "@primeo/shared/node";
import { pino } from "pino";

loadEnvFile(fileURLToPath(new URL("../../../.env", import.meta.url)));

const isDevelopment = (process.env.NODE_ENV ?? "development") === "development";
const logger = pino({
  name: SERVICES.workers,
  level: process.env.LOG_LEVEL ?? "info",
  ...(isDevelopment ? { transport: { target: "pino-pretty" } } : {}),
});

// Aucune tâche n'est encore enregistrée : la file de tâches, le planificateur et l'exécution
// des agents seront branchés ici dans les phases suivantes.
logger.info("Workers démarrés — aucune tâche enregistrée pour le moment.");

// Maintient le processus actif jusqu'à un signal d'arrêt (comportement d'un service permanent).
const keepAlive = setInterval(() => undefined, 60_000);

function shutdown(signal: string): void {
  logger.info(`Signal ${signal} reçu, arrêt des workers…`);
  clearInterval(keepAlive);
  logger.flush();
  process.exit(0);
}
process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
