# apps/

Applications déployables du Command Center.

| Application | Rôle                                                                 | Déploiement         |
| ----------- | -------------------------------------------------------------------- | ------------------- |
| `web/`      | **Frontend** : interface du PDG (Next.js)                            | Hébergement web     |
| `backend/`  | **Backend — API** : point d'entrée unique des opérations (Fastify)   | Service web         |
| `worker/`   | **Backend — exécution** : agents, planification, surveillance (24/7) | Processus permanent |

```
web  ──HTTP──▶  backend  ──tâches──▶  worker
                   │                    │
                   └──── Supabase ◀─────┘
```

- `web` ne parle qu'à `backend` (et à Supabase Auth pour la connexion). Il n'accède jamais
  directement à la base de données ni aux secrets.
- `backend` valide, applique la gouvernance, enregistre et crée les tâches.
- `worker` exécute les tâches longues (missions des agents, rapports, surveillance).

Aucune de ces applications ne communique avec la base de données de la plateforme immobilière Primeo.
