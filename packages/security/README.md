# @primeo/security

**Garde-fou central du système.** Toute action proposée par un agent est évaluée ici _avant_
d'être exécutée. La décision est prise par du code déterministe, jamais par le modèle d'IA.

| Dossier           | Rôle                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------- |
| `permissions/`    | Droits de chaque agent sur chaque capacité (moindre privilège), y compris en cas de délégation    |
| `authorization/`  | Évaluation d'une action → `autoriser` (niv. 1) / `soumettre au PDG` (niv. 2) / `refuser` (niv. 3) |
| `approval-rules/` | Règles déclaratives : quelle action relève de quel niveau, pour quel agent ou quelle direction    |
| `secrets/`        | Lecture centralisée et validée des secrets ; aucun agent n'y accède directement                   |

Niveaux : **1** autonome · **2** validation préalable du PDG · **3** intervention humaine obligatoire.
Un agent ne peut jamais modifier ses propres permissions. Ce paquet doit avoir la couverture de
tests la plus élevée du dépôt (`tests/unit`, `tests/agents`).
