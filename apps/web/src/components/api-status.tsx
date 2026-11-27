import type { ApiHealth } from "@/services/api-client";

/** Affiche l'état réel de la connexion entre l'interface et l'API. */
export function ApiStatus({ health }: { health: ApiHealth }) {
  const online = health.reachable;
  return (
    <div
      data-testid="api-status"
      data-state={online ? "online" : "offline"}
      className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm"
    >
      <span
        aria-hidden
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${online ? "bg-success" : "bg-danger"}`}
      />
      <span className="font-medium text-ink">API</span>
      <span className="text-muted">
        {online ? `Opérationnelle · ${health.data.environment}` : "Injoignable"}
      </span>
    </div>
  );
}
