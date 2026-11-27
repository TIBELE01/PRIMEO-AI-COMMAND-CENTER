import { fileURLToPath } from "node:url";
import { loadEnvFile } from "@primeo/shared/node";
import { buildApp } from "./app";
import { parseApiEnv } from "./config/env";

loadEnvFile(fileURLToPath(new URL("../../../.env", import.meta.url)));

const env = parseApiEnv();
const app = await buildApp(env);

async function shutdown(signal: string): Promise<void> {
  app.log.info(`Signal ${signal} reçu, arrêt de l'API…`);
  await app.close();
  process.exit(0);
}
process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));

try {
  await app.listen({ host: env.API_HOST, port: env.API_PORT });
} catch (error) {
  app.log.error(error, "Impossible de démarrer l'API");
  process.exit(1);
}
