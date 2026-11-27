# @primeo/web — interface du PDG (frontend)

Application **Next.js** (App Router) : le bureau central depuis lequel le PDG pilote Primeo.
Accès privé, réservé au PDG authentifié. Toutes les opérations passent par `apps/api`.

## Organisation de `src/`

| Dossier       | Rôle                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------ |
| `app/`        | Routage Next.js : une route par module (dashboard, directeurs, missions, validations…)     |
| `pages/`      | Écrans complets de chaque module, assemblés à partir des composants (voir l'avertissement) |
| `layouts/`    | Gabarits de page : coquille authentifiée, navigation, version smartphone                   |
| `components/` | Composants propres à l'application (les composants génériques sont dans `@primeo/ui`)      |
| `hooks/`      | Hooks React réutilisables (données, temps réel, responsive…)                               |
| `services/`   | Appels à l'API `apps/api` et à Supabase Auth ; seul endroit qui fait des requêtes réseau   |
| `stores/`     | État global côté client (préférences, filtres, état d'interface)                           |
| `contexts/`   | Contextes React : session du PDG, thème                                                    |
| `styles/`     | Styles globaux                                                                             |
| `utils/`      | Fonctions utilitaires propres au frontend                                                  |

> **Avertissement — `src/pages/`** : Next.js interprète ce dossier comme le _Pages Router_.
> Tout fichier `.tsx` qui y est placé devient une URL publique, en parallèle de `app/`.
> Tant que ce nom est conservé, il ne doit contenir que des sous-dossiers de composants d'écran
> **sans** fichier de route à la racine, ou être renommé (`views/`, `screens/`).

## Authentification

- `src/proxy.ts` : rafraîchit la session Supabase et protège les routes privées.
- `src/app/(auth)/` : connexion, inscription (sur invitation), mot de passe oublié, réinitialisation.
- `src/app/auth/` : retour des liens e-mail (`callback`) et fermeture d'une session non autorisée (`denied`).
- `src/app/(command-center)/` : espace privé, revérifié côté serveur par son layout.
- `src/services/supabase/` : clients Supabase navigateur, serveur et proxy.
- `src/services/auth/` : actions serveur, utilisateur courant, messages d'erreur.

Détails : [`docs/architecture/authentication.md`](../../docs/architecture/authentication.md).

## Règles

- Frontend pur : aucun accès direct à la base de données, aucun secret, aucun agent exécuté ici.
- Seules les variables `NEXT_PUBLIC_*` sont exposées au navigateur.
- Un écran n'est livré que branché sur de vraies données.
