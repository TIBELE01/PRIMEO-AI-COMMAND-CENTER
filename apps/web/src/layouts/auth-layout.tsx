import type { ReactNode } from "react";
import { BrandMark } from "@/components/brand-mark";

/**
 * Gabarit des pages d'authentification : panneau de marque bleu nuit (grand écran) et
 * formulaire sur fond clair. Sur mobile, seul le formulaire s'affiche, logo en tête.
 */
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
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <aside className="relative hidden overflow-hidden bg-night-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(60% 50% at 15% 10%, rgb(16 86 224 / 0.45), transparent 70%), radial-gradient(40% 35% at 90% 95%, rgb(255 102 0 / 0.22), transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgb(255 255 255) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <BrandMark tone="inverse" className="relative" />
        <div className="relative flex max-w-md flex-col gap-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
            Centre de commandement
          </p>
          <p className="text-3xl font-semibold leading-tight tracking-tight text-white">
            Dirigez Primeo avec une équipe de directeurs IA, sous votre contrôle.
          </p>
          <p className="text-sm leading-relaxed text-primary-200">
            Missions, validations, rapports et performance réunis dans un espace sécurisé et
            traçable.
          </p>
        </div>
        <p className="relative text-xs text-primary-300">
          Accès privé · Réservé aux personnes autorisées
        </p>
      </aside>

      <main className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="flex w-full max-w-sm flex-col gap-8">
          <BrandMark className="lg:hidden" />
          <header className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
            {description ? (
              <p className="text-sm leading-relaxed text-muted">{description}</p>
            ) : null}
          </header>
          {children}
          {footer ? (
            <div className="border-t border-line pt-6 text-sm text-muted">{footer}</div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
