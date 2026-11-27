# @primeo/agent-runtime

Moteur d'exécution des agents. Il transforme une configuration d'agent (stockée en base)
et une mission en une exécution traçable.

| Dossier          | Rôle                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------- |
| `runner/`        | Boucle agent : contexte → appel modèle → proposition d'outil → gouvernance → résultat |
| `memory/`        | Mémoire courte (conversation), de travail (mission) et longue (recherche sémantique)  |
| `delegation/`    | Délégation directeur → sous-agent, avec propagation des permissions                   |
| `collaboration/` | Missions multi-directeurs et réunions entre directions                                |
| `prompts/`       | Assemblage des instructions système à partir de la configuration de l'agent           |

Garde-fous intégrés : budget par exécution, profondeur de délégation maximale, délais d'expiration.
