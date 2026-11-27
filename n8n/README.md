# n8n/

Workflows d'**intégration** et d'automatisation exécutés par n8n, exportés en JSON pour être versionnés.

- `workflows/` : un fichier JSON par workflow, nommé `<domaine>.<action>.json`.

## Répartition des rôles

- **n8n** : connecter des services externes, transformer et acheminer des données, tâches mécaniques.
- **Code du Command Center** : orchestration des agents, permissions, approbations, audit.

n8n n'appelle le Command Center que via des webhooks **signés** (`apps/backend/src/webhooks/n8n`)
et n'a jamais d'accès direct à la base de données avec la clé de service.
Les identifiants de n8n restent dans n8n, jamais dans ces fichiers JSON.
