# @primeo/ui

Design system de Primeo (charte graphique Primeo), en React, utilisé par `apps/web`.
Documentation : [`docs/design-system.md`](../../docs/design-system.md).

| Dossier          | Contenu                                                                         |
| ---------------- | ------------------------------------------------------------------------------- |
| `design-system/` | `theme.css` (jetons, modes clair et sombre) et `tokens.ts` (contrat TypeScript) |
| `components/`    | Bouton, champ, carte, modale, badge, tableau, alerte, indicateur de chargement  |
| `charts/`        | Graphiques des tableaux de bord (à venir)                                       |

Les composants ne contiennent aucune logique métier ni appel réseau : ils reçoivent leurs données
en propriétés et n'utilisent que les rôles de couleur sémantiques.
