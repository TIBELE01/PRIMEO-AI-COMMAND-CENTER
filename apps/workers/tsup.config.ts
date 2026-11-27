import { defineConfig } from "tsup";

// Compile les workers en un seul fichier JavaScript, paquets internes @primeo/* inclus.
export default defineConfig({
  entry: ["src/main.ts"],
  format: ["esm"],
  platform: "node",
  target: "node22",
  outDir: "dist",
  clean: true,
  sourcemap: true,
  noExternal: [/^@primeo\//],
});
