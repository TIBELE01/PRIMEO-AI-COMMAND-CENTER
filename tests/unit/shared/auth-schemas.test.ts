import { loginSchema, resetPasswordSchema, signupSchema } from "@primeo/shared";
import { describe, expect, it } from "vitest";

const valid = {
  fullName: "Président Primeo",
  email: "  PDG@Primeo.test ",
  password: "Motdepasse2026",
  passwordConfirmation: "Motdepasse2026",
};

describe("schémas d'authentification", () => {
  it("normalise l'adresse e-mail", () => {
    expect(signupSchema.parse(valid).email).toBe("pdg@primeo.test");
  });

  it.each([
    ["trop court", "Court2026"],
    ["sans majuscule", "motdepasse2026"],
    ["sans minuscule", "MOTDEPASSE2026"],
    ["sans chiffre", "MotDePasseSansChiffre"],
  ])("refuse un mot de passe %s", (_label, password) => {
    const result = signupSchema.safeParse({ ...valid, password, passwordConfirmation: password });
    expect(result.success).toBe(false);
  });

  it("refuse une confirmation différente", () => {
    const result = resetPasswordSchema.safeParse({
      password: "Motdepasse2026",
      passwordConfirmation: "Motdepasse2027",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["passwordConfirmation"]);
  });

  it("refuse une adresse e-mail invalide à la connexion", () => {
    expect(loginSchema.safeParse({ email: "pdg", password: "x" }).success).toBe(false);
  });
});
