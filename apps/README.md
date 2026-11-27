# apps/

Applications déployables du Command Center.

| Application | Rôle                                                         | Déploiement         |
| ----------- | ------------------------------------------------------------ | ------------------- |
| `web/`      | Interface du PDG (Next.js)                                   | Hébergement web     |
| `worker/`   | Exécution de fond 24/7 : agents, planification, surveillance | Processus permanent |

Les deux applications partagent la même base Supabase et les paquets de `packages/`.
Elles ne communiquent **jamais** avec la base de données de la plateforme immobilière Primeo.
