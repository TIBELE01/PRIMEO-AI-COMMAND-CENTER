import { existsSync } from "node:fs";

/**
 * Charge un fichier `.env` dans `process.env` s'il existe. Les variables déjà définies ne sont
 * jamais remplacées : en production, celles de l'hébergeur s'appliquent.
 * Réservé aux processus Node.js : ne pas importer côté navigateur.
 */
export function loadEnvFile(path: string): void {
  if (existsSync(path)) {
    process.loadEnvFile(path);
  }
}
