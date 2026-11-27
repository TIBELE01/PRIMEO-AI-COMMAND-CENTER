# ADR-0002 — API backend dédiée (`apps/backend`)

- **Statut** : remplacé par ADR-0003
- **Date** : 2026-11-27

## Contexte

L'ADR-0001 prévoyait que les opérations soient exposées par le code serveur de Next.js.
Pour une organisation plus lisible et pour accueillir d'autres clients (application mobile,
plateforme Primeo, partenaires, n8n), une séparation nette frontend / backend est préférée.

## Décision

- Création de `apps/backend` : API HTTP **Fastify** en TypeScript, point d'entrée unique de toutes
  les opérations métier et des webhooks n8n.
- `apps/web` devient un frontend pur : il appelle l'API et n'utilise Supabase que pour l'authentification.
- `apps/worker` reste le backend d'exécution (tâches longues, agents, planification).
- L'API vérifie le jeton Supabase du PDG à chaque requête.

## Conséquences

- Un service supplémentaire à déployer et à surveiller.
- Toute la sécurité applicative (authentification, validation, gouvernance) est concentrée dans
  l'API, ce qui facilite les audits.
- Ajouter un nouveau client ne nécessite aucune modification du backend.
