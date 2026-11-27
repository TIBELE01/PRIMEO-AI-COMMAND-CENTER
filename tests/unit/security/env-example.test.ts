import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ENVIRONMENT_CATALOG } from "@primeo/security/secrets";
import { describe, expect, it } from "vitest";

const ROOT = resolve(import.meta.dirname, "../../..");
const lines = readFileSync(resolve(ROOT, ".env.example"), "utf8").split("\n");
const assignments = new Map(
  lines
    .filter((line) => /^[A-Z][A-Z0-9_]*=/.test(line))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1)] as const;
    }),
);

describe(".env.example", () => {
  it("documente exactement les variables du catalogue central", () => {
    expect([...assignments.keys()].sort()).toEqual(Object.keys(ENVIRONMENT_CATALOG).sort());
  });

  it("ne contient aucune valeur pour les variables secrètes", () => {
    for (const [name, definition] of Object.entries(ENVIRONMENT_CATALOG)) {
      if (definition.visibility === "secret") {
        expect(assignments.get(name), name).toBe("");
      }
    }
  });
});
