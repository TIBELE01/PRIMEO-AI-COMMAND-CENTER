import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  applySeeds,
  asRole,
  createTestDatabase,
  inRollback,
  insertAgent,
  insertDepartment,
  insertUser,
  TEST_DATABASE_URL,
  type TestDatabase,
} from "./test-database";

const EXPECTED_TABLES = [
  "activity_logs",
  "agent_memories",
  "agent_permissions",
  "agents",
  "ai_usage",
  "approval_requests",
  "capabilities",
  "conversation_participants",
  "conversations",
  "departments",
  "integration_secrets",
  "integrations",
  "jobs",
  "kpi_measurements",
  "kpis",
  "messages",
  "mission_assignments",
  "mission_events",
  "mission_schedules",
  "missions",
  "notifications",
  "objectives",
  "reports",
  "user_invitations",
  "users",
];

describe.skipIf(!TEST_DATABASE_URL)("Base de données — migrations et garanties", () => {
  let db: TestDatabase;

  beforeAll(async () => {
    db = await createTestDatabase();
  }, 60_000);

  afterAll(async () => {
    await db?.close();
  });

  describe("structure", () => {
    it("crée exactement les tables attendues", async () => {
      const { rows } = await db.client.query<{ tablename: string }>(
        "select tablename from pg_tables where schemaname = 'public' order by tablename",
      );
      expect(rows.map((r) => r.tablename)).toEqual(EXPECTED_TABLES);
    });

    it("active la RLS sur toutes les tables", async () => {
      const { rows } = await db.client.query<{ relname: string }>(
        `select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
         where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity`,
      );
      expect(rows).toEqual([]);
    });
  });

  describe("données initiales", () => {
    it("crée les 7 directions de Primeo, de façon idempotente", async () => {
      await inRollback(db.client, async () => {
        await applySeeds(db.client);
        await applySeeds(db.client);
        const { rows } = await db.client.query<{ slug: string }>(
          "select slug from public.departments order by display_order",
        );
        expect(rows.map((r) => r.slug)).toEqual([
          "direction-generale",
          "administration-rh",
          "finance-comptabilite",
          "commercial-partenariats",
          "marketing-communication",
          "operations-experience",
          "technique-si",
        ]);
      });
    });
  });

  describe("inscription sur invitation", () => {
    async function signUp(email: string, fullName = "Personne invitée") {
      const id = randomUUID();
      await db.client.query(
        "insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3)",
        [id, email, { full_name: fullName }],
      );
      return id;
    }

    it("refuse la création d'un compte sans invitation", async () => {
      await expect(inRollback(db.client, () => signUp("inconnu@exemple.test"))).rejects.toThrow(
        /aucune invitation valide/,
      );
    });

    it("crée le profil avec le rôle de l'invitation et consomme l'invitation", async () => {
      await inRollback(db.client, async () => {
        await db.client.query(
          "insert into public.user_invitations (email, role) values ('pdg@exemple.test', 'executive')",
        );
        const id = await signUp("PDG@Exemple.test", "Président-directeur général");
        const user = await db.client.query(
          "select email, full_name, role, is_active from public.users where id = $1",
          [id],
        );
        expect(user.rows[0]).toEqual({
          email: "pdg@exemple.test",
          full_name: "Président-directeur général",
          role: "executive",
          is_active: true,
        });
        const invitation = await db.client.query<{ accepted_user_id: string }>(
          "select accepted_user_id from public.user_invitations where email = 'pdg@exemple.test'",
        );
        expect(invitation.rows[0]!.accepted_user_id).toBe(id);
      });
    });

    it("n'accepte pas deux comptes pour une même invitation", async () => {
      await expect(
        inRollback(db.client, async () => {
          await db.client.query(
            "insert into public.user_invitations (email, role) values ('unique@exemple.test', 'observer')",
          );
          await signUp("unique@exemple.test");
          await signUp("unique@exemple.test");
        }),
      ).rejects.toThrow(/aucune invitation valide/);
    });

    it("conserve l'invitation consommée si le compte est supprimé", async () => {
      await inRollback(db.client, async () => {
        await db.client.query(
          "insert into public.user_invitations (email, role) values ('depart@exemple.test', 'observer')",
        );
        const id = await signUp("depart@exemple.test");
        await db.client.query("delete from auth.users where id = $1", [id]);
        const { rows } = await db.client.query<{ accepted_at: Date | null }>(
          "select accepted_at from public.user_invitations where email = 'depart@exemple.test'",
        );
        expect(rows[0]!.accepted_at).not.toBeNull();
      });
    });

    it("refuse une invitation expirée ou révoquée", async () => {
      await expect(
        inRollback(db.client, async () => {
          await db.client.query(
            `insert into public.user_invitations (email, role, expires_at)
             values ('expire@exemple.test', 'observer', now() - interval '1 day')`,
          );
          await signUp("expire@exemple.test");
        }),
      ).rejects.toThrow(/aucune invitation valide/);
      await expect(
        inRollback(db.client, async () => {
          await db.client.query(
            `insert into public.user_invitations (email, role, revoked_at)
             values ('revoque@exemple.test', 'observer', now())`,
          );
          await signUp("revoque@exemple.test");
        }),
      ).rejects.toThrow(/aucune invitation valide/);
    });
  });

  describe("sécurité d'accès (RLS)", () => {
    it("le dirigeant lit les données opérationnelles", async () => {
      await inRollback(db.client, async () => {
        const executive = await insertUser(db.client, "executive");
        await insertDepartment(db.client);
        await db.client.query("set local role authenticated");
        await db.client.query("select set_config('request.jwt.claim.sub', $1, true)", [executive]);
        const { rows } = await db.client.query("select id from public.departments");
        expect(rows).toHaveLength(1);
      });
    });

    it("un utilisateur non dirigeant ne voit aucune donnée opérationnelle", async () => {
      await inRollback(db.client, async () => {
        const observer = await insertUser(db.client, "observer");
        await insertDepartment(db.client);
        await db.client.query("set local role authenticated");
        await db.client.query("select set_config('request.jwt.claim.sub', $1, true)", [observer]);
        const departments = await db.client.query("select id from public.departments");
        expect(departments.rows).toHaveLength(0);
        const users = await db.client.query<{ id: string }>("select id from public.users");
        expect(users.rows.map((r) => r.id)).toEqual([observer]);
      });
    });

    it("un dirigeant désactivé perd l'accès", async () => {
      await inRollback(db.client, async () => {
        const executive = await insertUser(db.client, "executive");
        await db.client.query("update public.users set is_active = false where id = $1", [
          executive,
        ]);
        await insertDepartment(db.client);
        await db.client.query("set local role authenticated");
        await db.client.query("select set_config('request.jwt.claim.sub', $1, true)", [executive]);
        const { rows } = await db.client.query("select id from public.departments");
        expect(rows).toHaveLength(0);
      });
    });

    it("le rôle anonyme n'a aucun accès", async () => {
      await expect(
        asRole(db.client, "anon", null, () => db.client.query("select * from public.missions")),
      ).rejects.toThrow(/permission denied/);
    });

    it("un utilisateur connecté, même dirigeant, ne peut pas écrire directement", async () => {
      const executive = await inRollback(db.client, () => insertUser(db.client, "executive"));
      await expect(
        asRole(db.client, "authenticated", executive, () =>
          db.client.query("insert into public.departments (slug, name) values ('x', 'X')"),
        ),
      ).rejects.toThrow(/permission denied/);
    });

    it("les secrets chiffrés sont illisibles pour un utilisateur connecté", async () => {
      await expect(
        asRole(db.client, "authenticated", null, () =>
          db.client.query("select ciphertext from public.integration_secrets"),
        ),
      ).rejects.toThrow(/permission denied/);
    });
  });

  describe("agents et permissions", () => {
    it("n'autorise qu'un directeur actif par direction", async () => {
      await expect(
        inRollback(db.client, async () => {
          const department = await insertDepartment(db.client);
          await insertAgent(db.client, department, "director");
          await insertAgent(db.client, department, "director");
        }),
      ).rejects.toThrow(/agents_one_director_per_department_idx/);
    });

    it("incrémente la version de configuration quand les instructions changent", async () => {
      await inRollback(db.client, async () => {
        const agent = await insertAgent(db.client, await insertDepartment(db.client));
        await db.client.query(
          "update public.agents set display_name = 'Nouveau nom' where id = $1",
          [agent],
        );
        await db.client.query(
          "update public.agents set system_instructions = 'Nouvelles instructions' where id = $1",
          [agent],
        );
        const { rows } = await db.client.query<{ config_version: number }>(
          "select config_version from public.agents where id = $1",
          [agent],
        );
        expect(rows[0]!.config_version).toBe(2);
      });
    });

    it("refuse une permission plus permissive que le niveau minimal de la capacité", async () => {
      await expect(
        inRollback(db.client, async () => {
          const executive = await insertUser(db.client, "executive");
          const agent = await insertAgent(db.client, await insertDepartment(db.client));
          const { rows } = await db.client.query<{ id: string }>(
            `insert into public.capabilities (slug, name, description, category, default_authorization_level)
             values ('finance.payment.create', 'Paiement', 'Émettre un paiement', 'finance', 2) returning id`,
          );
          await db.client.query(
            `insert into public.agent_permissions (agent_id, capability_id, authorization_level, granted_by_user_id)
             values ($1, $2, 1, $3)`,
            [agent, rows[0]!.id, executive],
          );
        }),
      ).rejects.toThrow(/plus permissif/);
    });

    it("refuse un niveau d'autorisation hors de 1 à 3", async () => {
      await expect(
        inRollback(db.client, () =>
          db.client.query(
            `insert into public.capabilities (slug, name, description, category, default_authorization_level)
             values ('x.y', 'X', 'X', 'x', 4)`,
          ),
        ),
      ).rejects.toThrow(/authorization_level/);
    });
  });

  describe("missions", () => {
    it("attribue une référence lisible et exige un créateur unique", async () => {
      await inRollback(db.client, async () => {
        const executive = await insertUser(db.client, "executive");
        const { rows } = await db.client.query<{ reference: string }>(
          "insert into public.missions (title, created_by_user_id) values ('Mission test', $1) returning reference",
          [executive],
        );
        expect(rows[0]!.reference).toMatch(/^M-\d{4}-\d{6}$/);
      });
      await expect(
        inRollback(db.client, () =>
          db.client.query("insert into public.missions (title) values ('Sans créateur')"),
        ),
      ).rejects.toThrow(/missions_single_creator/);
    });

    it("refuse une mission terminée sans date de fin ni progression complète", async () => {
      await expect(
        inRollback(db.client, async () => {
          const executive = await insertUser(db.client, "executive");
          await db.client.query(
            "insert into public.missions (title, status, created_by_user_id) values ('M', 'completed', $1)",
            [executive],
          );
        }),
      ).rejects.toThrow(/missions_completed/);
    });

    it("rend l'historique de mission non modifiable", async () => {
      await expect(
        inRollback(db.client, async () => {
          const executive = await insertUser(db.client, "executive");
          const { rows } = await db.client.query<{ id: string }>(
            "insert into public.missions (title, created_by_user_id) values ('M', $1) returning id",
            [executive],
          );
          await db.client.query(
            `insert into public.mission_events (mission_id, event_type, actor_type, actor_user_id)
             values ($1, 'mission.created', 'user', $2)`,
            [rows[0]!.id, executive],
          );
          await db.client.query("update public.mission_events set note = 'falsifié'");
        }),
      ).rejects.toThrow(/ajout seul/);
    });
  });

  describe("demandes de validation", () => {
    async function createApproval() {
      const executive = await insertUser(db.client, "executive");
      const agent = await insertAgent(db.client, await insertDepartment(db.client));
      const { rows } = await db.client.query<{ id: string; proposed_action_hash: string }>(
        `insert into public.approval_requests
           (requested_by_agent_id, authorization_level, title, summary, proposed_action, proposed_action_hash)
         values ($1, 2, 'Publier la campagne', 'Résumé', '{"capability":"marketing.publish","budget":500}', '')
         returning id, proposed_action_hash`,
        [agent],
      );
      return { executive, approval: rows[0]! };
    }

    it("calcule l'empreinte de l'action proposée", async () => {
      await inRollback(db.client, async () => {
        const { approval } = await createApproval();
        expect(approval.proposed_action_hash).toMatch(/^[0-9a-f]{64}$/);
      });
    });

    it("interdit de modifier l'action après sa soumission", async () => {
      await expect(
        inRollback(db.client, async () => {
          const { approval } = await createApproval();
          await db.client.query(
            `update public.approval_requests set proposed_action = '{"budget":50000}' where id = $1`,
            [approval.id],
          );
        }),
      ).rejects.toThrow(/ne peut pas être modifié/);
    });

    it("suit le circuit en attente → approuvée → exécutée", async () => {
      await inRollback(db.client, async () => {
        const { executive, approval } = await createApproval();
        await db.client.query(
          `update public.approval_requests
              set status = 'approved', decided_by_user_id = $2, decided_at = now()
            where id = $1`,
          [approval.id, executive],
        );
        await db.client.query(
          "update public.approval_requests set status = 'executed', executed_at = now() where id = $1",
          [approval.id],
        );
      });
    });

    it("interdit d'exécuter une demande qui n'a pas été approuvée", async () => {
      await expect(
        inRollback(db.client, async () => {
          const { approval } = await createApproval();
          await db.client.query(
            "update public.approval_requests set status = 'executed', executed_at = now() where id = $1",
            [approval.id],
          );
        }),
      ).rejects.toThrow(/Transition de statut interdite/);
    });

    it("exige un commentaire pour une demande de modification", async () => {
      await expect(
        inRollback(db.client, async () => {
          const { executive, approval } = await createApproval();
          await db.client.query(
            `update public.approval_requests
                set status = 'changes_requested', decided_by_user_id = $2, decided_at = now()
              where id = $1`,
            [approval.id, executive],
          );
        }),
      ).rejects.toThrow(/approval_requests_changes_need_comment/);
    });
  });

  describe("journal d'activité", () => {
    async function log(action: string) {
      await db.client.query(
        "insert into public.activity_logs (actor_type, action, outcome) values ('system', $1, 'success')",
        [action],
      );
    }

    it("chaîne les entrées et vérifie l'intégrité du journal", async () => {
      await inRollback(db.client, async () => {
        await log("system.started");
        await log("mission.created");
        await log("capability.executed");
        const chain = await db.client.query<{ previous_hash: string | null; row_hash: string }>(
          "select previous_hash, row_hash from public.activity_logs order by id",
        );
        expect(chain.rows[0]!.previous_hash).toBeNull();
        expect(chain.rows[1]!.previous_hash).toBe(chain.rows[0]!.row_hash);
        expect(chain.rows[2]!.previous_hash).toBe(chain.rows[1]!.row_hash);
        const broken = await db.client.query("select * from private.verify_activity_logs_chain()");
        expect(broken.rows).toEqual([]);
      });
    });

    it("refuse toute modification ou suppression, y compris par le service backend", async () => {
      await expect(
        inRollback(db.client, async () => {
          await log("system.started");
          await db.client.query("set local role service_role");
          await db.client.query("delete from public.activity_logs");
        }),
      ).rejects.toThrow(/ajout seul/);
    });

    it("détecte une falsification faite en contournant les protections", async () => {
      await inRollback(db.client, async () => {
        await log("system.started");
        await log("approval.decided");
        await log("capability.executed");
        // Simulation d'une attaque par un super-administrateur de la base.
        await db.client.query(
          "alter table public.activity_logs disable trigger activity_logs_append_only",
        );
        await db.client.query(
          "update public.activity_logs set outcome = 'denied' where action = 'approval.decided'",
        );
        const { rows } = await db.client.query<{ broken_id: string }>(
          "select broken_id from private.verify_activity_logs_chain()",
        );
        expect(rows).toHaveLength(1);
      });
    });
  });

  describe("communication", () => {
    it("met à jour la date du dernier message de la conversation", async () => {
      await inRollback(db.client, async () => {
        const executive = await insertUser(db.client, "executive");
        const { rows } = await db.client.query<{ id: string }>(
          "insert into public.conversations (kind, created_by_user_id) values ('direct', $1) returning id",
          [executive],
        );
        await db.client.query(
          `insert into public.messages (conversation_id, sender_type, sender_user_id, content)
           values ($1, 'user', $2, 'Bonjour')`,
          [rows[0]!.id, executive],
        );
        const conversation = await db.client.query<{ last_message_at: Date | null }>(
          "select last_message_at from public.conversations where id = $1",
          [rows[0]!.id],
        );
        expect(conversation.rows[0]!.last_message_at).not.toBeNull();
      });
    });

    it("refuse un message dont l'expéditeur est incohérent", async () => {
      await expect(
        inRollback(db.client, async () => {
          const executive = await insertUser(db.client, "executive");
          const { rows } = await db.client.query<{ id: string }>(
            "insert into public.conversations (kind, created_by_user_id) values ('direct', $1) returning id",
            [executive],
          );
          await db.client.query(
            `insert into public.messages (conversation_id, sender_type, sender_user_id, content)
             values ($1, 'agent', $2, 'Usurpation')`,
            [rows[0]!.id, executive],
          );
        }),
      ).rejects.toThrow(/messages_sender_consistent/);
    });
  });

  describe("mémoire des agents", () => {
    it("stocke un vecteur et permet la recherche par similarité", async () => {
      await inRollback(db.client, async () => {
        const agent = await insertAgent(db.client, await insertDepartment(db.client));
        const vector = `[${Array.from({ length: 1536 }, (_, i) => (i === 0 ? 1 : 0)).join(",")}]`;
        await db.client.query(
          `insert into public.agent_memories (agent_id, scope, content, embedding)
           values ($1, 'long_term', 'Le PDG préfère des rapports synthétiques.', $2)`,
          [agent, vector],
        );
        const { rows } = await db.client.query<{ content: string }>(
          `select content from public.agent_memories
           order by embedding operator(extensions.<=>) $1::extensions.vector limit 1`,
          [vector],
        );
        expect(rows[0]!.content).toContain("rapports synthétiques");
      });
    });
  });
});
