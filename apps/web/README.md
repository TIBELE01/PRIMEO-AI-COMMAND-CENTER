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
│   └── api/webhooks/           Points d'entrée signés (n8n, services externes)
├── features/<module>/          Composants, actions serveur et requêtes propres à chaque module
├── components/ui/              Composants d'interface génériques (design system Primeo)
├── components/layout/          Coquille de l'application : navigation, en-tête, responsive
├── lib/supabase/               Clients Supabase côté serveur / navigateur
├── lib/auth/                   Garde d'authentification et de session
└── styles/                     Styles globaux et jetons de design
e2e/                            Tests Playwright (ordinateur + smartphone)
```

## Règles

- L'interface **n'exécute jamais un agent** directement : elle crée des missions ou des messages,
  que `apps/worker` traite.
- Aucun secret serveur dans un composant client. Seules les variables `NEXT_PUBLIC_*` sont exposées.
- Un écran n'est livré que branché sur de vraies données (pas de données fictives présentées comme réelles).

## Commandes

```bash
pnpm --filter @primeo/web dev
```
