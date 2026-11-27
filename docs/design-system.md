# Design system — Primeo AI Command Center

L'interface applique la **charte graphique de Primeo** (reprise de la plateforme Primeo : logo,
couleurs officielles, typographie Inter) avec une tonalité « centre de commandement » : sobre,
dense en information, sérieuse. Référence vivante : page **`/design-system`** (espace privé).

## Couleurs

### Marque (charte Primeo)

| Nom            | Valeur                                           | Usage                                                                              |
| -------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Bleu Primeo    | `#0055FF`                                        | Couleur officielle du logo                                                         |
| Bleu interface | `#1056E0` (échelle `primary-50` → `primary-950`) | Actions principales, liens, focus — même bleu que les interfaces Primeo existantes |
| Orange Primeo  | `#FF6600`                                        | Second trait du logo ; **accent rare** (surtitres de marque, priorité)             |
| Bleu nuit      | `#0B1B3A` (échelle `night-*`)                    | Barre de commandement, panneau de marque, base du mode sombre                      |
| Vert / Rouge   | `#00CC66` / `#FF3333`                            | Couleurs complémentaires de la charte, déclinées pour les statuts                  |

### Rôles sémantiques

Les composants n'utilisent **que** des rôles, jamais une couleur brute. Chaque rôle a une valeur
claire et une valeur sombre (`packages/ui/design-system/theme.css`).

| Rôle                                               | Utilitaires Tailwind          | Usage                                   |
| -------------------------------------------------- | ----------------------------- | --------------------------------------- |
| `canvas`, `surface`, `surface-muted`               | `bg-canvas`, `bg-surface`…    | Fond de page, cartes, zones secondaires |
| `line`, `line-strong`                              | `border-line`…                | Séparateurs, contours                   |
| `ink`, `muted`, `subtle`                           | `text-ink`…                   | Texte principal, secondaire, discret    |
| `brand` (+ `-hover`, `-soft`, `-ink`, `on-brand`)  | `bg-brand`, `text-brand-ink`… | Actions, liens, sélection               |
| `accent` (+ `-soft`, `-ink`)                       | `bg-accent`…                  | Orange Primeo, avec parcimonie          |
| `success`, `warning`, `danger` (+ `-soft`, `-ink`) | `bg-success-soft`…            | Statuts, alertes                        |

Contrastes : le texte courant et les libellés de statut (`*-ink` sur `*-soft`) respectent le
niveau AA du WCAG ; l'orange vif n'est jamais utilisé pour du texte de petite taille sur fond clair.

### Mode sombre

Construit sur le **bleu nuit Primeo**. Il suit le réglage du système (`prefers-color-scheme`) et
peut être forcé avec `data-theme="dark"` ou `data-theme="light"` sur `<html>`.

## Typographie

- **Inter** (variable, auto-hébergée via `@fontsource-variable/inter` : aucun appel à un service
  externe), repli sur la police système.
- Échelle : 12 (surtitre, majuscules espacées) · 14 (texte secondaire, tableaux) · 16 (texte
  courant) · 24 (titre de section) · 30–36 (titre de page).
- Titres en graisse 600 avec un léger resserrement (`tracking-tight`).
- **Chiffres tabulaires** (`.tabular`) pour les montants, pourcentages et tableaux.

## Espacements, formes, profondeur

- Grille de **4 px** (échelle Tailwind) : 12–16 px dans les composants, 24–32 px entre blocs.
- Rayons généreux, comme sur la plateforme Primeo : 8 px (petits éléments), 12 px (boutons,
  champs), 16 px (cartes), 20 px (modales).
- Ombres multicouches discrètes ; ombre bleutée réservée au bouton principal.
- Mouvement : transitions de 200 ms avec une courbe douce ; désactivées si l'utilisateur
  préfère réduire les animations.

## Composants (`@primeo/ui`)

| Composant                                                                                      | Variantes / points clés                                                                                                       |
| ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `Button`, `buttonClasses()`                                                                    | `primary`, `secondary`, `ghost`, `danger` ; tailles `sm`, `md`, `lg` ; état `loading` ; `buttonClasses()` pour styler un lien |
| `TextField`                                                                                    | Libellé, aide et erreur reliés au champ (`aria-describedby`, `aria-invalid`)                                                  |
| `Card`, `CardHeader`, `CardBody`, `CardFooter`                                                 | Surtitre, titre, description, actions                                                                                         |
| `Modal`                                                                                        | Élément natif `<dialog>` : focus piégé, Échap, clic extérieur, titre et description annoncés                                  |
| `Badge`, `StatusDot`                                                                           | Tonalités `neutral`, `brand`, `accent`, `success`, `warning`, `danger` ; pastille optionnelle                                 |
| `Table` (+ `TableHead`, `TableBody`, `TableRow`, `TableHeaderCell`, `TableCell`, `TableEmpty`) | Défilement horizontal sur mobile, alignement à droite des nombres, état vide                                                  |
| `Alert`                                                                                        | `info`, `success`, `warning`, `danger` ; rôle `alert` pour les erreurs                                                        |
| `Spinner`                                                                                      | Indicateur de chargement                                                                                                      |

Règles : aucun composant ne contient de logique métier ni d'appel réseau ; tous sont utilisables
au clavier et lisibles par les lecteurs d'écran.

## Identité dans l'application

- **Logo officiel** Primeo (`apps/web/public/brand/logo-primeo.png`) avec la mention
  « AI Command Center » (`BrandMark`).
- **Barre de commandement** bleu nuit en tête de l'espace privé.
- **Pages d'authentification** : panneau de marque bleu nuit (halo bleu Primeo, touche d'orange,
  trame discrète) à côté du formulaire ; sur mobile, le formulaire seul avec le logo.

## Fichiers

| Fichier                                                    | Contenu                                                               |
| ---------------------------------------------------------- | --------------------------------------------------------------------- |
| `packages/ui/design-system/theme.css`                      | Jetons (échelles de marque, rôles clair/sombre, rayons, ombres, base) |
| `packages/ui/design-system/tokens.ts`                      | Liste des rôles, couleurs de marque, tonalités (TypeScript)           |
| `packages/ui/components/`                                  | Composants                                                            |
| `apps/web/src/styles/globals.css`                          | Importe Tailwind et le thème                                          |
| `apps/web/src/app/(command-center)/design-system/page.tsx` | Page de référence                                                     |
