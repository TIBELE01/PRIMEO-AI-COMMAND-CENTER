import type { ReactNode } from "react";
import { BrandMark } from "@/components/brand-mark";
import { signOutAction } from "@/services/auth/actions";

const ROLE_LABELS: Record<string, string> = {
  executive: "Président-directeur général",
  administrator: "Administrateur",
  observer: "Observateur",
};

function initials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Coquille de l'espace authentifié : barre de commandement bleu nuit, contenu sur fond clair. */
export function CommandCenterLayout({
  user,
  children,
}: {
  user: { fullName: string; role: string };
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-night-800 bg-night-900">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <BrandMark tone="inverse" />
          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden min-w-0 flex-col items-end sm:flex">
              <span className="truncate text-sm font-medium text-white">{user.fullName}</span>
              <span className="truncate text-xs text-primary-200">
                {ROLE_LABELS[user.role] ?? user.role}
              </span>
            </div>
            <span
              aria-hidden
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-semibold text-white ring-2 ring-night-700"
            >
              {initials(user.fullName)}
            </span>
            <form action={signOutAction}>
              <button
                type="submit"
                className="h-9 rounded-md border border-night-700 px-3 text-sm font-medium text-primary-100 transition hover:bg-night-800 hover:text-white"
              >
                Se déconnecter
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</div>
    </div>
  );
}
