import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Les paquets internes sont consommés en TypeScript source.
  transpilePackages: ["@primeo/config", "@primeo/domain"],
  poweredByHeader: false,
};

export default nextConfig;
