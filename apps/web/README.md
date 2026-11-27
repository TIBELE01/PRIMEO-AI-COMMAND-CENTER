# @primeo/web — interface du PDG

Application **Next.js (App Router)** : c'est le bureau central depuis lequel le PDG pilote Primeo.
Accès privé, réservé au PDG authentifié (double authentification prévue).

## Organisation

```
src/
├── app/                        Routage Next.js
│   ├── (auth)/login/           Connexion
│   ├── (command-center)/       Espace authentifié
│   │   ├── dashboard/          A. Executive Dashboard
│   │   ├── directors/          B. AI Directors
│   │   ├── communications/     C. Communication Center
│   │   ├── missions/           D. Mission Control
│   │   ├── approvals/          E. Approval Center
│   │   ├── performance/        F. Performance Center
│   │   ├── reports/            G. Reports Center
│   │   ├── activity/           H. Activity Logs
│   │   └── settings/           Paramètres (organisation, agents, intégrations)
├── features/<module>/          Composants et appels à l'API propres à chaque module
├── components/ui/              Composants d'interface génériques (design system Primeo)
├── components/layout/          Coquille de l'application : navigation, en-tête, responsive
├── lib/api/                    Client typé vers l'API backend (`apps/backend`)
├── lib/supabase/               Client Supabase limité à l'authentification
├── lib/auth/                   Garde d'authentification et de session
└── styles/                     Styles globaux et jetons de design
e2e/                            Tests Playwright (ordinateur + smartphone)
```

## Règles

- L'interface est un **frontend pur** : toutes les opérations passent par l'API `apps/backend`.
  Elle n'accède jamais directement à la base de données et n'exécute jamais un agent.
- Aucun secret serveur dans un composant client. Seules les variables `NEXT_PUBLIC_*` sont exposées.
- Un écran n'est livré que branché sur de vraies données (pas de données fictives présentées comme réelles).

## Commandes

```bash
pnpm --filter @primeo/web dev
```
