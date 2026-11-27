import { APP_NAME } from "@primeo/shared";
import { Button } from "@primeo/ui";
import type { ReactNode } from "react";
import { signOutAction } from "@/services/auth/actions";

const ROLE_LABELS: Record<string, string> = {
  executive: "Président-directeur général",
  administrator: "Administrateur",
  observer: "Observateur",
};

/** Coquille de l'espace authentifié : en-tête avec l'utilisateur connecté et la déconnexion. */
export function CommandCenterLayout({
  user,
  children,
}: {
  user: { fullName: string; role: string };
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-baseline gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Primeo
            </span>
            <span className="hidden truncate text-sm text-muted sm:inline">{APP_NAME}</span>
          </div>
          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden min-w-0 flex-col items-end sm:flex">
              <span className="truncate text-sm font-medium text-ink">{user.fullName}</span>
              <span className="truncate text-xs text-muted">
                {ROLE_LABELS[user.role] ?? user.role}
              </span>
            </div>
            <form action={signOutAction}>
              <Button type="submit" variant="secondary" className="h-9">
                Se déconnecter
              </Button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">{children}</div>
    </div>
  );
}
