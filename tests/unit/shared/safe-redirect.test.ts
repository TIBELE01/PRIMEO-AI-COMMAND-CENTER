import { safeRedirectPath } from "@primeo/shared";
import { describe, expect, it } from "vitest";

describe("safeRedirectPath", () => {
  it("accepte un chemin interne", () => {
    expect(safeRedirectPath("/missions?statut=ouvertes")).toBe("/missions?statut=ouvertes");
  });

  it.each([
    ["une URL externe", "https://site-malveillant.test"],
    ["une URL sans protocole", "//site-malveillant.test"],
    ["une barre oblique inversée", "/\\site-malveillant.test"],
    ["un chemin relatif", "missions"],
    ["un caractère de contrôle", "/\nSet-Cookie"],
    ["une valeur vide", ""],
    ["une valeur non textuelle", ["/a", "/b"]],
  ])("refuse %s", (_label, value) => {
    expect(safeRedirectPath(value)).toBe("/");
  });
});
