import { Badge } from "@primeo/ui";
import type { ApiHealth } from "@/services/api-client";

/** Affiche l'état réel de la connexion entre l'interface et l'API. */
export function ApiStatus({ health }: { health: ApiHealth }) {
  const online = health.reachable;
  return (
    <div
      data-testid="api-status"
      data-state={online ? "online" : "offline"}
      className="flex items-center justify-between gap-3 px-5 py-4"
    >
      <div className="flex flex-col">
        <span className="text-sm font-medium text-ink">API du Command Center</span>
        <span className="text-xs text-subtle">
          {online ? `Environnement : ${health.data.environment}` : "Aucune réponse de l'API"}
        </span>
      </div>
      <Badge tone={online ? "success" : "danger"} dot>
        {online ? "Opérationnelle" : "Injoignable"}
      </Badge>
    </div>
  );
}
