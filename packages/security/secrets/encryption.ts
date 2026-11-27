import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

/** Secret chiffré, tel que stocké dans la table integration_secrets. */
export interface EncryptedSecret {
  ciphertext: Buffer;
  iv: Buffer;
  authTag: Buffer;
  keyVersion: number;
  /** Empreinte HMAC (clé maîtresse) tronquée : compare deux secrets sans les déchiffrer. */
  fingerprint: string;
}

export class SecretDecryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SecretDecryptionError";
  }
}

function decodeKey(base64Key: string): Buffer {
  const key = Buffer.from(base64Key, "base64");
  if (key.length !== 32) {
    throw new Error("La clé maîtresse doit faire 32 octets (AES-256).");
  }
  return key;
}

/**
 * Chiffrement des secrets d'intégration (AES-256-GCM) avec trousseau de clés versionnées :
 * on chiffre avec la clé courante, on peut déchiffrer avec n'importe quelle version connue
 * (rotation progressive). L'authentification GCM détecte toute altération du chiffré.
 * La base de données ne voit jamais un secret en clair.
 */
export class SecretCipher {
  private readonly keys: Map<number, Buffer>;
  private readonly currentVersion: number;

  constructor(options: { keys: Record<number, string>; currentVersion: number }) {
    this.keys = new Map(
      Object.entries(options.keys).map(([version, key]) => [Number(version), decodeKey(key)]),
    );
    if (!this.keys.has(options.currentVersion)) {
      throw new Error(`Clé maîtresse de version ${options.currentVersion} absente du trousseau.`);
    }
    this.currentVersion = options.currentVersion;
  }

  private key(version: number): Buffer {
    const key = this.keys.get(version);
    if (!key) {
      throw new SecretDecryptionError(`Clé maîtresse de version ${version} indisponible.`);
    }
    return key;
  }

  /** Empreinte stable d'un secret pour une version de clé donnée. */
  fingerprint(plaintext: string, version = this.currentVersion): string {
    return createHmac("sha256", this.key(version))
      .update(plaintext, "utf8")
      .digest("hex")
      .slice(0, 16);
  }

  encrypt(plaintext: string): EncryptedSecret {
    if (plaintext.length === 0) {
      throw new Error("Impossible de chiffrer un secret vide.");
    }
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.key(this.currentVersion), iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });
    const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    return {
      ciphertext,
      iv,
      authTag: cipher.getAuthTag(),
      keyVersion: this.currentVersion,
      fingerprint: this.fingerprint(plaintext),
    };
  }

  decrypt(secret: Pick<EncryptedSecret, "ciphertext" | "iv" | "authTag" | "keyVersion">): string {
    try {
      const decipher = createDecipheriv(ALGORITHM, this.key(secret.keyVersion), secret.iv, {
        authTagLength: AUTH_TAG_LENGTH,
      });
      decipher.setAuthTag(secret.authTag);
      return Buffer.concat([decipher.update(secret.ciphertext), decipher.final()]).toString("utf8");
    } catch (error) {
      if (error instanceof SecretDecryptionError) {
        throw error;
      }
      throw new SecretDecryptionError(
        "Déchiffrement impossible : secret altéré ou clé incorrecte.",
      );
    }
  }

  /** Vrai si le secret chiffré correspond à la valeur fournie (comparaison à temps constant). */
  matches(secret: Pick<EncryptedSecret, "fingerprint" | "keyVersion">, plaintext: string): boolean {
    const expected = Buffer.from(secret.fingerprint);
    const actual = Buffer.from(this.fingerprint(plaintext, secret.keyVersion));
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }

  /** Re-chiffre avec la clé courante (rotation). */
  rotate(secret: EncryptedSecret): EncryptedSecret {
    return secret.keyVersion === this.currentVersion ? secret : this.encrypt(this.decrypt(secret));
  }
}
