import { currentUserSchema } from "@primeo/shared";
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT, type CryptoKey } from "jose";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../../apps/api/src/app";
import { parseApiEnv } from "../../../apps/api/src/config/env";
import { createAccessTokenVerifier } from "../../../apps/api/src/modules/authentication/access-token";
import type { UserProfile } from "../../../apps/api/src/modules/authentication/user-profile";

const SUPABASE_URL = "https://projet-test.supabase.co";
const ISSUER = `${SUPABASE_URL}/auth/v1`;
const USER_ID = "6f1c2a8e-3b7d-4c55-9a1e-2f0b8d4e7a10";

const PROFILES: Record<string, UserProfile> = {
  [USER_ID]: {
    id: USER_ID,
    email: "pdg@primeo.test",
    fullName: "Président Primeo",
    role: "executive",
    isActive: true,
    mfaRequired: true,
  },
  "0b8d4e7a-2f0b-4c55-9a1e-6f1c2a8e3b7d": {
    id: "0b8d4e7a-2f0b-4c55-9a1e-6f1c2a8e3b7d",
    email: "ancien@primeo.test",
    fullName: "Ancien collaborateur",
    role: "observer",
    isActive: false,
    mfaRequired: true,
  },
};

describe("API — authentification", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  let privateKey: CryptoKey;
  let otherPrivateKey: CryptoKey;

  async function token(
    claims: Record<string, unknown> = {},
    options: { key?: CryptoKey; issuer?: string; audience?: string; expiresIn?: string } = {},
  ) {
    return new SignJWT({ aal: "aal1", ...claims })
      .setProtectedHeader({ alg: "ES256", kid: "cle-test" })
      .setSubject((claims.sub as string | undefined) ?? USER_ID)
      .setIssuer(options.issuer ?? ISSUER)
      .setAudience(options.audience ?? "authenticated")
      .setIssuedAt()
      .setExpirationTime(options.expiresIn ?? "5m")
      .sign(options.key ?? privateKey);
  }

  async function getMe(authorization?: string) {
    return app.inject({
      method: "GET",
      url: "/me",
      headers: authorization ? { authorization } : {},
    });
  }

  beforeAll(async () => {
    const pair = await generateKeyPair("ES256");
    privateKey = pair.privateKey;
    otherPrivateKey = (await generateKeyPair("ES256")).privateKey;
    const publicJwk = { ...(await exportJWK(pair.publicKey)), kid: "cle-test", alg: "ES256" };

    app = await buildApp(
      parseApiEnv({
        NODE_ENV: "test",
        NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
      }),
      {
        verifyAccessToken: createAccessTokenVerifier({
          supabaseUrl: SUPABASE_URL,
          keys: createLocalJWKSet({ keys: [publicJwk] }),
        }),
        loadUserProfile: async (_accessToken, userId) => PROFILES[userId] ?? null,
      },
    );
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("renvoie le profil de l'utilisateur authentifié", async () => {
    const response = await getMe(`Bearer ${await token()}`);
    expect(response.statusCode).toBe(200);
    expect(currentUserSchema.parse(response.json())).toEqual({
      id: USER_ID,
      email: "pdg@primeo.test",
      fullName: "Président Primeo",
      role: "executive",
      mfa: { required: true, satisfied: false },
    });
  });

  it("indique quand la double authentification a été effectuée", async () => {
    const response = await getMe(`Bearer ${await token({ aal: "aal2" })}`);
    expect(response.json().mfa.satisfied).toBe(true);
  });

  it("refuse une requête sans jeton", async () => {
    const response = await getMe();
    expect(response.statusCode).toBe(401);
  });

  it.each([
    ["signé par une autre clé", () => token({}, { key: otherPrivateKey })],
    ["émis par un autre projet", () => token({}, { issuer: "https://autre.supabase.co/auth/v1" })],
    ["destiné à une autre audience", () => token({}, { audience: "anon" })],
    ["expiré", () => token({}, { expiresIn: "-1m" })],
  ])("refuse un jeton %s", async (_label, makeToken) => {
    const response = await getMe(`Bearer ${await makeToken()}`);
    expect(response.statusCode).toBe(401);
  });

  it("refuse un jeton malformé", async () => {
    const response = await getMe("Bearer pas-un-jeton");
    expect(response.statusCode).toBe(401);
  });

  it("refuse un utilisateur sans profil applicatif", async () => {
    const response = await getMe(
      `Bearer ${await token({ sub: "11111111-1111-4111-8111-111111111111" })}`,
    );
    expect(response.statusCode).toBe(403);
  });

  it("refuse un utilisateur désactivé", async () => {
    const response = await getMe(
      `Bearer ${await token({ sub: "0b8d4e7a-2f0b-4c55-9a1e-6f1c2a8e3b7d" })}`,
    );
    expect(response.statusCode).toBe(403);
  });
});
