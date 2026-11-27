import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = resolve(import.meta.dirname, "../../..");

/** Motifs de clés et d'identifiants réels. Les valeurs factices des tests ne les déclenchent pas. */
const PATTERNS: Array<[string, RegExp]> = [
  ["clé secrète Supabase", /sb_secret_[A-Za-z0-9_-]{16,}/],
  ["clé publiable Supabase", /sb_publishable_[A-Za-z0-9_-]{16,}/],
  ["clé Anthropic", /sk-ant-(api|admin)\d*-[A-Za-z0-9_-]{20,}/],
  ["clé OpenAI", /sk-(proj|svcacct)-[A-Za-z0-9_-]{20,}/],
  ["clé de type sk- longue", /\bsk-[A-Za-z0-9]{40,}\b/],
  ["jeton JWT", /eyJ[A-Za-z0-9_-]{20,}\.eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/],
  ["clé d'accès AWS", /AKIA[0-9A-Z]{16}/],
  ["clé privée", /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
];

const BINARY = /\.(png|jpe?g|gif|webp|ico|woff2?|ttf|pdf)$/i;

describe("aucun secret codé en dur", () => {
  const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], {
    cwd: ROOT,
    encoding: "utf8",
  })
    .split("\n")
    .filter((file) => file && !BINARY.test(file) && file !== "pnpm-lock.yaml");

  it("analyse les fichiers du dépôt", () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it("ne trouve aucune clé, aucun jeton, aucun identifiant", () => {
    const findings: string[] = [];
    for (const file of files) {
      let content: string;
      try {
        content = readFileSync(resolve(ROOT, file), "utf8");
      } catch {
        continue;
      }
      for (const [label, pattern] of PATTERNS) {
        if (pattern.test(content)) {
          findings.push(`${file} : ${label}`);
        }
      }
    }
    expect(findings).toEqual([]);
  });
});
