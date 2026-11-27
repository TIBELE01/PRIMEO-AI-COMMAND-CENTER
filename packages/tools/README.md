# @primeo/tools

Catalogue des **outils** utilisables par les agents (lire un rapport, créer une mission,
consulter Zoho, déclencher un workflow n8n…). Les outils sont la seule façon pour un agent
d'agir sur le monde.

| Dossier        | Rôle                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------- |
| `registry/`    | Registre : déclaration, découverte et exécution _après_ validation par `@primeo/governance` |
| `definitions/` | Un fichier par outil : schéma d'entrée validé, niveau de risque, implémentation             |

Chaque outil déclare obligatoirement son niveau d'autorisation par défaut.
