import { randomUUID } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import pg from "pg";

const ROOT = resolve(import.meta.dirname, "../../..");
const MIGRATIONS_DIR = join(ROOT, "database/migrations");
const SEEDS_DIR = join(ROOT, "database/seeds");
const SHIM_FILE = join(import.meta.dirname, "supabase-shim.sql");

/** URL d'un serveur PostgreSQL (avec pgvector) sur lequel créer des bases de test jetables. */
export const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;

export interface TestDatabase {
  client: pg.Client;
  close: () => Promise<void>;
}

/**
 * Crée une base vierge, y applique l'environnement Supabase simulé puis toutes les migrations
 * dans l'ordre. La base est supprimée à la fermeture.
 */
export async function createTestDatabase(): Promise<TestDatabase> {
  if (!TEST_DATABASE_URL) {
    throw new Error("TEST_DATABASE_URL n'est pas défini.");
  }
  const name = `primeo_test_${randomUUID().replaceAll("-", "")}`;

  const admin = new pg.Client({ connectionString: TEST_DATABASE_URL });
  await admin.connect();
  await admin.query(`create database ${name}`);

  const url = new URL(TEST_DATABASE_URL);
  url.pathname = `/${name}`;
  const client = new pg.Client({ connectionString: url.toString() });
  await client.connect();

  await client.query(readFileSync(SHIM_FILE, "utf8"));
  for (const file of readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort()) {
    await client.query(readFileSync(join(MIGRATIONS_DIR, file), "utf8"));
  }

  return {
    client,
    close: async () => {
      await client.end();
      await admin.query(`drop database if exists ${name} with (force)`);
      await admin.end();
    },
  };
}

/**
 * Exécute `fn` dans une transaction annulée à la fin, sous un rôle Supabase donné et,
 * le cas échéant, avec l'identité d'un utilisateur connecté.
 */
export async function asRole<T>(
  client: pg.Client,
  role: "anon" | "authenticated" | "service_role",
  userId: string | null,
  fn: () => Promise<T>,
): Promise<T> {
  await client.query("begin");
  try {
    await client.query(`set local role ${role}`);
    await client.query("select set_config('request.jwt.claim.sub', $1, true)", [userId ?? ""]);
    return await fn();
  } finally {
    await client.query("rollback");
  }
}

/** Applique les fichiers de `database/seeds`, dans l'ordre. */
export async function applySeeds(client: pg.Client): Promise<void> {
  for (const file of readdirSync(SEEDS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort()) {
    await client.query(readFileSync(join(SEEDS_DIR, file), "utf8"));
  }
}

/** Exécute `fn` dans une transaction toujours annulée (isolation entre les tests). */
export async function inRollback<T>(client: pg.Client, fn: () => Promise<T>): Promise<T> {
  await client.query("begin");
  try {
    return await fn();
  } finally {
    await client.query("rollback");
  }
}

/** Insère un utilisateur (auth.users + public.users) et renvoie son identifiant. */
export async function insertUser(
  client: pg.Client,
  role: "executive" | "administrator" | "observer",
): Promise<string> {
  const id = randomUUID();
  const email = `${id}@test.primeo.local`;
  // Parcours réel : invitation, puis création du compte Auth (le profil est créé par déclencheur).
  await client.query("insert into public.user_invitations (email, role) values ($1, $2)", [
    email,
    role,
  ]);
  await client.query("insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3)", [
    id,
    email,
    { full_name: `Utilisateur ${role}` },
  ]);
  return id;
}

/** Insère une direction et renvoie son identifiant. */
export async function insertDepartment(
  client: pg.Client,
  slug = `dir-${randomUUID().slice(0, 8)}`,
) {
  const { rows } = await client.query<{ id: string }>(
    "insert into public.departments (slug, name) values ($1, $2) returning id",
    [slug, `Direction ${slug}`],
  );
  return rows[0]!.id;
}

/** Insère un agent et renvoie son identifiant. */
export async function insertAgent(
  client: pg.Client,
  departmentId: string,
  kind: "director" | "specialist" = "specialist",
) {
  const slug = `agent-${randomUUID().slice(0, 8)}`;
  const { rows } = await client.query<{ id: string }>(
    `insert into public.agents
       (slug, department_id, kind, status, display_name, title, system_instructions, model_provider, model_name)
     values ($1, $2, $3, 'active', $4, 'Fonction de test', 'Instructions de test', 'anthropic', 'modele-test')
     returning id`,
    [slug, departmentId, kind, `Agent ${slug}`],
  );
  return rows[0]!.id;
}
