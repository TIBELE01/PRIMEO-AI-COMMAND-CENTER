# packages/

Bibliothèques internes partagées par `apps/web`, `apps/api` et `apps/workers`, publiées dans
l'espace de travail pnpm sous le préfixe `@primeo/*` et consommées en TypeScript source.

| Paquet          | Rôle                                                                     |
| --------------- | ------------------------------------------------------------------------ |
| `shared`        | Types, constantes, schémas de validation, utilitaires                    |
| `security`      | Permissions, niveaux d'autorisation 1/2/3, règles de validation, secrets |
| `ai-engine`     | Fournisseurs d'IA (OpenAI, Anthropic, ElevenLabs), routage, mémoire      |
| `agent-system`  | Définition, enregistrement, capacités et collaboration des agents        |
| `orchestration` | Répartition des tâches, événements, workflows n8n                        |
| `integrations`  | Zoho, Supabase, MCP, e-mail, API tierces                                 |
| `ui`            | Design system Primeo, composants et graphiques (React)                   |

## Sens des dépendances

```
shared         ← aucune dépendance
security       ← shared
ai-engine      ← shared, security
orchestration  ← shared, security
integrations   ← shared, security
agent-system   ← shared, security, ai-engine, orchestration, integrations
ui             ← shared
```

Une dépendance dans l'autre sens (par exemple `shared` qui importe `security`) est une erreur
d'architecture. `ui` est le seul paquet destiné au navigateur ; aucun autre paquet ne doit y être importé.
