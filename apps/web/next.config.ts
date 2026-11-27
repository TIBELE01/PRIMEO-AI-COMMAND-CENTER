import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { NextConfig } from "next";

// Le fichier .env est unique, à la racine du dépôt (hors production).
const rootEnvFile = resolve(import.meta.dirname, "../../.env");
if (process.env.NODE_ENV !== "production" && existsSync(rootEnvFile)) {
  process.loadEnvFile(rootEnvFile);
}

const nextConfig: NextConfig = {
  // Les paquets internes sont consommés en TypeScript source.
  transpilePackages: ["@primeo/shared", "@primeo/ui"],
  poweredByHeader: false,
};

export default nextConfig;
