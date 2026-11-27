# infra/

Fichiers d'infrastructure et de déploiement.

| Dossier   | Contenu prévu                                                                        |
| --------- | ------------------------------------------------------------------------------------ |
| `docker/` | Environnement local (n8n, éventuels services annexes) via Docker Compose             |
| `deploy/` | Configuration de déploiement de `apps/web` et `apps/worker` selon l'hébergeur retenu |

Le choix de l'hébergeur fera l'objet d'un ADR. Aucun secret n'est stocké dans ce dossier.
