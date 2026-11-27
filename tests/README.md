# tests/

Tous les tests automatisés du dépôt, classés par type.

| Dossier        | Contenu                                                                                                     | Outil      | Commande                |
| -------------- | ----------------------------------------------------------------------------------------------------------- | ---------- | ----------------------- |
| `unit/`        | Logique isolée : règles d'autorisation, schémas, utilitaires, routage des modèles                           | Vitest     | `pnpm test:unit`        |
| `integration/` | API + base de données réelle (locale), intégrations contre leurs environnements de test                     | Vitest     | `pnpm test:integration` |
| `e2e/`         | Parcours complets dans le navigateur, sur ordinateur et smartphone                                          | Playwright | `pnpm test:e2e`         |
| `agents/`      | Comportement des agents : respect des permissions, résistance à l'injection de prompt, qualité des réponses | Vitest     | `pnpm test:agents`      |

Organisation interne : reproduire l'arborescence du code testé (ex. `unit/security/authorization/`).
Nommage : `*.test.ts` (Vitest), `*.spec.ts` (Playwright).

Une fonctionnalité n'est considérée comme terminée que lorsque ses tests passent.
