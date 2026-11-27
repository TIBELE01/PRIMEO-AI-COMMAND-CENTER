# Gestion des variables d'environnement et des secrets

## Principes

1. **Aucun secret dans le code.** Clés, jetons et identifiants viennent uniquement de
   l'environnement (fichier `.env` local, jamais commité ; variables de l'hébergeur en production)
   ou, pour les intégrations configurées depuis l'interface, de la table chiffrée
   `integration_secrets`.
2. **Un catalogue unique** — `packages/security/secrets/catalog.ts` — déclare chaque variable :
   description, format, visibilité (`public` / `secret`), services qui la lisent et niveau
   d'exigence (`required`, `production`, `optional`).
3. **Validation au démarrage.** Chaque service charge sa configuration avec
   `loadEnvironment(service)` et **refuse de démarrer** si une variable obligatoire manque ou si
   une valeur n'a pas le bon format. Le message liste tous les problèmes, sans jamais afficher
   une valeur.
4. **Moindre exposition.** Un service ne reçoit que les variables déclarées pour lui. Seules les
   variables `NEXT_PUBLIC_*` (publiques) atteignent le navigateur.
5. **Rien dans les journaux.** Les en-têtes `Authorization` et `Cookie` sont masqués dans les
   journaux de l'API ; `redactSecrets()` masque les valeurs secrètes et les motifs de clés connus
   dans les messages d'erreur.

## Où la validation a lieu

| Service   | Point d'entrée                           | Comportement                                                            |
| --------- | ---------------------------------------- | ----------------------------------------------------------------------- |
| API       | `apps/api/src/main.ts` → `parseApiEnv()` | Arrêt avec code 1 et message explicite                                  |
| Workers   | `apps/workers/src/main.ts`               | Arrêt avec code 1 ; résumé de configuration journalisé, secrets masqués |
| Interface | `apps/web/src/instrumentation.ts`        | Le serveur Next.js refuse de démarrer                                   |

## Formats contrôlés (exemples)

| Variable                                                    | Contrôle                                                   |
| ----------------------------------------------------------- | ---------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`                                  | URL HTTPS (HTTP accepté uniquement en local)               |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`                      | `sb_publishable_…`                                         |
| `SUPABASE_SECRET_KEY`                                       | `sb_secret_…` — refuse une clé publiable collée par erreur |
| `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` / `DEEPSEEK_API_KEY` | `sk-ant-…` / `sk-…`                                        |
| `SECRETS_ENCRYPTION_KEY`                                    | Exactement 32 octets en base64                             |
| `N8N_WEBHOOK_SIGNING_SECRET`                                | 32 caractères minimum                                      |

## Secrets d'intégration chiffrés

`SecretCipher` (`@primeo/security/secrets`) chiffre en **AES-256-GCM** avant tout stockage dans
`integration_secrets` :

- vecteur d'initialisation aléatoire à chaque chiffrement ; étiquette d'authentification qui
  détecte toute altération ;
- clé maîtresse `SECRETS_ENCRYPTION_KEY` hors base ; une copie de la base ne révèle rien ;
- **trousseau versionné** pour la rotation : on chiffre avec la clé courante
  (`SECRETS_ENCRYPTION_KEY_VERSION`), on déchiffre avec toute version connue, et `rotate()`
  re-chiffre avec la clé courante ;
- empreinte HMAC tronquée (`fingerprint`) pour vérifier une valeur sans la déchiffrer.

## Garde-fous automatiques

| Test                                               | Vérifie                                                                                       |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `tests/unit/security/no-hardcoded-secrets.test.ts` | Aucun fichier du dépôt ne contient de clé (Supabase, Anthropic, OpenAI, JWT, AWS, clé privée) |
| `tests/unit/security/env-example.test.ts`          | `.env.example` documente exactement les variables du catalogue, sans valeur pour les secrets  |
| `tests/unit/security/environment.test.ts`          | Présence, formats, exigences de production, absence de fuite dans les messages                |
| `tests/unit/security/encryption.test.ts`           | Chiffrement, altération, mauvaise clé, rotation                                               |

## Ajouter une variable

1. La déclarer dans `packages/security/secrets/catalog.ts` (format, visibilité, services).
2. L'ajouter à `.env.example` (sans valeur si elle est secrète).
3. La lire via `loadEnvironment(...)`, jamais directement dans `process.env`.

## CI (GitHub Actions)

Les tests de bout en bout lisent l'URL et la clé publiable Supabase dans les **variables du
dépôt** (Settings → Secrets and variables → Actions → Variables) :
`NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Les secrets éventuels
iront dans l'onglet **Secrets**, jamais dans le fichier de workflow.
