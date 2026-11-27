import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Les paquets internes sont consommés en TypeScript source.
  transpilePackages: ["@primeo/shared", "@primeo/ui"],
  poweredByHeader: false,
};

export default nextConfig;
