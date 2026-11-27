# packages/

Bibliothèques internes partagées entre les applications de `apps/`. Elles sont publiées sous le
préfixe `@primeo/*` dans l'espace de travail pnpm et consommées directement en TypeScript source.

## Dépendances autorisées

```
domain          ← aucune dépendance (cœur métier pur)
config          ← aucune dépendance
observability   ← aucune dépendance
db              ← config, domain
llm             ← config
integrations    ← config
governance      ← domain, db
tools           ← domain, governance, integrations
agent-runtime   ← domain, db, governance, llm, tools, observability
```

Une flèche dans l'autre sens (ex. `domain` qui importe `db`) est une erreur d'architecture.

| Paquet                      | Rôle en une ligne                                        |
| --------------------------- | -------------------------------------------------------- |
| `domain`                    | Modèle métier et règles                                  |
| `governance`                | Permissions, niveaux d'autorisation, approbations, audit |
| `agent-runtime`             | Exécution des agents                                     |
| `llm`                       | Abstraction des fournisseurs d'IA                        |
| `tools`                     | Outils utilisables par les agents                        |
| `integrations`              | Connecteurs externes (Zoho, n8n, ElevenLabs, MCP)        |
| `db`                        | Accès Supabase                                           |
| `config`                    | Variables d'environnement validées                       |
| `observability`             | Logs et traces techniques                                |
| `tsconfig`, `eslint-config` | Outillage partagé                                        |
