import { describe, expect, it } from "vitest";
import { authErrorMessage } from "../../../apps/web/src/services/auth/messages";

describe("authErrorMessage", () => {
  it("explique un refus d'inscription sans invitation", () => {
    expect(authErrorMessage({ message: "Database error saving new user", status: 500 })).toMatch(
      /invitation/,
    );
  });

  it("ne précise pas si c'est l'e-mail ou le mot de passe qui est faux", () => {
    expect(
      authErrorMessage({ code: "invalid_credentials", message: "Invalid login credentials" }),
    ).toBe("Adresse e-mail ou mot de passe incorrect.");
  });

  it("ne révèle jamais le message technique d'une erreur inconnue", () => {
    const message = authErrorMessage({ code: "unexpected", message: "relation x does not exist" });
    expect(message).not.toContain("relation");
  });
});
