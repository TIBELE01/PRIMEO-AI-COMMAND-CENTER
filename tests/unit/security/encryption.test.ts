import { randomBytes } from "node:crypto";
import { SecretCipher, SecretDecryptionError } from "@primeo/security/secrets";
import { describe, expect, it } from "vitest";

const keyV1 = randomBytes(32).toString("base64");
const keyV2 = randomBytes(32).toString("base64");
const SECRET = "jeton-zoho-de-test-1234567890";

describe("SecretCipher (AES-256-GCM)", () => {
  const cipher = new SecretCipher({ keys: { 1: keyV1 }, currentVersion: 1 });

  it("chiffre puis déchiffre un secret", () => {
    const encrypted = cipher.encrypt(SECRET);
    expect(encrypted.ciphertext.toString("utf8")).not.toContain(SECRET);
    expect(encrypted.iv).toHaveLength(12);
    expect(encrypted.authTag).toHaveLength(16);
    expect(cipher.decrypt(encrypted)).toBe(SECRET);
  });

  it("utilise un vecteur d'initialisation différent à chaque chiffrement", () => {
    expect(cipher.encrypt(SECRET).iv.equals(cipher.encrypt(SECRET).iv)).toBe(false);
  });

  it("détecte toute altération du chiffré", () => {
    const encrypted = cipher.encrypt(SECRET);
    encrypted.ciphertext[0]! ^= 0xff;
    expect(() => cipher.decrypt(encrypted)).toThrow(SecretDecryptionError);
  });

  it("refuse de déchiffrer avec une autre clé", () => {
    const other = new SecretCipher({ keys: { 1: keyV2 }, currentVersion: 1 });
    expect(() => other.decrypt(cipher.encrypt(SECRET))).toThrow(SecretDecryptionError);
  });

  it("compare un secret à son empreinte sans le déchiffrer", () => {
    const encrypted = cipher.encrypt(SECRET);
    expect(cipher.matches(encrypted, SECRET)).toBe(true);
    expect(cipher.matches(encrypted, "autre-valeur")).toBe(false);
  });

  it("permet la rotation de la clé maîtresse", () => {
    const encryptedV1 = cipher.encrypt(SECRET);
    const keyring = new SecretCipher({ keys: { 1: keyV1, 2: keyV2 }, currentVersion: 2 });
    expect(keyring.decrypt(encryptedV1)).toBe(SECRET);
    const rotated = keyring.rotate(encryptedV1);
    expect(rotated.keyVersion).toBe(2);
    expect(new SecretCipher({ keys: { 2: keyV2 }, currentVersion: 2 }).decrypt(rotated)).toBe(
      SECRET,
    );
  });

  it("refuse une clé maîtresse de mauvaise taille", () => {
    expect(() => new SecretCipher({ keys: { 1: "Y291cnRl" }, currentVersion: 1 })).toThrow(
      /32 octets/,
    );
  });
});
