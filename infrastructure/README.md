# infrastructure/

Tout ce qui concerne l'exécution du système en dehors du code applicatif.

| Dossier       | Contenu prévu                                                                            |
| ------------- | ---------------------------------------------------------------------------------------- |
| `docker/`     | Images Docker de `api` et `workers`, environnement local (n8n…) via Docker Compose       |
| `deployment/` | Configuration de déploiement de `web`, `api` et `workers` selon l'hébergeur retenu       |
| `monitoring/` | Supervision technique : disponibilité, erreurs, alertes, tableaux de bord d'exploitation |
| `backups/`    | Politique et procédures de sauvegarde et de restauration de la base de données           |

Aucun secret n'est stocké dans ce dossier. Le choix de l'hébergeur fera l'objet d'une décision
d'architecture (`docs/architecture/decisions/`).
