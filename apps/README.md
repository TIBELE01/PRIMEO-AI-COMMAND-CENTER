# apps/

Applications déployables du Command Center.

| Application | Rôle                                                                        | Déploiement         |
| ----------- | --------------------------------------------------------------------------- | ------------------- |
| `web/`      | **Frontend** : interface du PDG (Next.js)                                   | Hébergement web     |
| `api/`      | **Backend — API** : point d'entrée unique des opérations (Fastify)          | Service web         |
| `workers/`  | **Backend — exécution** : agents, tâches planifiées, rapports, surveillance | Processus permanent |

```
web  ──HTTP──▶  api  ──tâches──▶  workers
                 │                   │
                 └──── Supabase ◀────┘
```

- `web` ne parle qu'à `api` (et à Supabase Auth pour la connexion).
- `api` authentifie, valide, applique la gouvernance, enregistre et crée les tâches.
- `workers` exécute les tâches longues.

Aucune de ces applications ne communique avec la base de données de la plateforme immobilière Primeo.
