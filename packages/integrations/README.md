# @primeo/integrations

Clients techniques des services externes. Les agents n'y accèdent jamais directement :
uniquement à travers les capacités de `@primeo/agent-system`, après contrôle de `@primeo/security`.

| Dossier          | Service                                                                     |
| ---------------- | --------------------------------------------------------------------------- |
| `zoho/`          | Zoho (CRM, Books, People… selon les modules activés)                        |
| `supabase/`      | Clients Supabase (utilisateur, service) et types générés depuis `database/` |
| `mcp/`           | Clients vers des serveurs MCP externes                                      |
| `email/`         | Envoi et réception d'e-mails (fournisseur à choisir)                        |
| `external-apis/` | Autres API tierces                                                          |

Aucune intégration n'est déclarée opérationnelle tant qu'elle n'est pas testée contre le vrai service.
