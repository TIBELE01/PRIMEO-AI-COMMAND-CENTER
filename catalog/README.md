# catalog/ — organisation déclarative de Primeo

Définitions **versionnées** de l'organisation IA, au format déclaratif (YAML), relues en revue
de code comme n'importe quel changement. Un script de synchronisation les charge dans Supabase.

| Dossier       | Contenu                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------ |
| `directions/` | Les directions (Générale, RH, Finance, Commercial, Marketing, Opérations, Technique)             |
| `agents/`     | Un fichier par agent : identité, fonction, personnalité, instructions, objectifs, outils, modèle |
| `policies/`   | Niveau d'autorisation (1, 2 ou 3) de chaque outil et action, par agent ou par direction          |

## Pourquoi ce dossier ?

Ajouter un directeur ou un sous-agent = **ajouter un fichier**, sans toucher au code.
L'historique Git conserve la trace de chaque changement de permissions ou d'instructions.

Les politiques sont relues par `@primeo/governance` ; un agent ne peut jamais modifier son
propre fichier ni ses propres permissions.
