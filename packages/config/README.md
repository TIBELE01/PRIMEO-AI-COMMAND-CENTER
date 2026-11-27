# @primeo/config

Source unique de vérité pour la configuration d'exécution.

- `src/env/` : schémas de validation (zod) des variables d'environnement, séparés en
  **public** (exposable au navigateur) et **serveur** (secrets). L'application refuse de démarrer
  si une variable obligatoire est absente ou invalide.

Règle : aucun autre paquet ne lit `process.env` directement. Tout passe par ce paquet.
