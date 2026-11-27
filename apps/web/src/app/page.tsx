import { APP_NAME } from "@primeo/shared";
import { ApiStatus } from "@/components/api-status";
import { fetchApiHealth } from "@/services/api-client";

// L'état de l'API est lu à chaque requête, jamais mis en cache.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const health = await fetchApiHealth();

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-10 px-4 py-16 sm:px-6">
      <header className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Primeo</p>
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{APP_NAME}</h1>
        <p className="text-base leading-relaxed text-muted">
          Socle technique en place. Les modules du centre de commandement seront activés phase par
          phase.
        </p>
      </header>

      <section aria-label="État du système" className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted">État du système</h2>
        <ApiStatus health={health} />
      </section>
    </main>
  );
}
