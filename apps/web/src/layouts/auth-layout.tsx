import { APP_NAME } from "@primeo/shared";
import type { ReactNode } from "react";

/** Gabarit des pages d'authentification : carte centrée, sobre, adaptée au mobile. */
export function AuthLayout({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Primeo</p>
          <p className="text-sm text-muted">{APP_NAME}</p>
        </div>
        <section className="flex flex-col gap-6 rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8">
          <header className="flex flex-col gap-1.5">
            <h1 className="text-xl font-semibold tracking-tight text-ink">{title}</h1>
            {description ? (
              <p className="text-sm leading-relaxed text-muted">{description}</p>
            ) : null}
          </header>
          {children}
        </section>
        {footer ? <div className="text-center text-sm text-muted">{footer}</div> : null}
      </div>
    </main>
  );
}
