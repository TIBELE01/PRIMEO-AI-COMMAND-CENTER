# @primeo/governance

**Garde-fou central du système.** Toute action d'un agent passe ici _avant_ d'être exécutée.
La décision est prise par du code déterministe, jamais par le modèle d'IA.

| Dossier        | Rôle                                                                                  |
| -------------- | ------------------------------------------------------------------------------------- |
| `policies/`    | Évaluation d'une action proposée → `autoriser` / `soumettre à validation` / `refuser` |
| `permissions/` | Droits de chaque agent sur chaque outil (moindre privilège), y compris en délégation  |
| `approvals/`   | Création des demandes de niveau 2 et reprise de l'action après décision du PDG        |
| `audit/`       | Écriture dans le journal d'activité, en ajout seul                                    |

Niveaux : **1** autonome · **2** validation préalable du PDG · **3** intervention humaine obligatoire.
Ce paquet doit atteindre la couverture de tests la plus élevée du dépôt.
