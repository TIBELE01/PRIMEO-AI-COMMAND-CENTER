import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { NextConfig } from "next";

// Le fichier .env est unique, à la racine du dépôt. Il ne remplace jamais une variable déjà
// définie : en production, ce sont celles de l'hébergeur qui s'appliquent.
const rootEnvFile = resolve(import.meta.dirname, "../../.env");
if (existsSync(rootEnvFile)) {
  process.loadEnvFile(rootEnvFile);
}

const nextConfig: NextConfig = {
  // Les paquets internes sont consommés en TypeScript source.
  transpilePackages: ["@primeo/integrations", "@primeo/security", "@primeo/shared", "@primeo/ui"],
  poweredByHeader: false,
};

export default nextConfig;
