# @primeo/integrations

Clients techniques des services externes. Ce sont les **seuls** modules qui détiennent les
secrets d'API (via `@primeo/config`) ; les agents n'y accèdent qu'à travers les outils de
`@primeo/tools`.

| Dossier       | Service                                                    |
| ------------- | ---------------------------------------------------------- |
| `zoho/`       | Zoho (CRM, Books, People… selon les modules activés)       |
| `n8n/`        | Déclenchement de workflows et réception de webhooks signés |
| `elevenlabs/` | Synthèse vocale et agents téléphoniques (phase ultérieure) |
| `mcp/`        | Clients vers des serveurs MCP externes                     |

Aucune intégration n'est déclarée opérationnelle tant qu'elle n'est pas testée contre le vrai service.
