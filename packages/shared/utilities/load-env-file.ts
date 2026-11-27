import { existsSync } from "node:fs";

/**
 * Charge un fichier `.env` dans `process.env` (hors production), sans écraser les variables
 * déjà définies. En production, les variables sont fournies par l'hébergeur.
 * Réservé aux processus Node.js : ne pas importer côté navigateur.
 */
export function loadEnvFile(path: string): void {
  if (process.env.NODE_ENV === "production" || !existsSync(path)) {
    return;
  }
  process.loadEnvFile(path);
}
