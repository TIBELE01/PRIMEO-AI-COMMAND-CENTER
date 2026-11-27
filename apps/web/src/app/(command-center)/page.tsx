import { ApiStatus } from "@/components/api-status";
import { fetchApiHealth, fetchCurrentUserFromApi } from "@/services/api-client";
import { getCurrentUser } from "@/services/auth/current-user";
import { createSupabaseServerClient } from "@/services/supabase/server";

export default async function HomePage() {
  const current = await getCurrentUser();
  const firstName = current?.status === "authorized" ? current.profile.full_name.split(" ")[0] : "";

  // Le jeton de la session (déjà vérifiée par le layout) est transmis à l'API, qui le revérifie.
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getSession();
  const [health, apiUser] = await Promise.all([
    fetchApiHealth(),
    data.session ? fetchCurrentUserFromApi(data.session.access_token) : Promise.resolve(null),
  ]);

  return (
    <div className="flex max-w-2xl flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Bonjour{firstName ? ` ${firstName}` : ""}.
        </h1>
        <p className="text-base leading-relaxed text-muted">
          Socle technique en place. Les modules du centre de commandement seront activés phase par
          phase.
        </p>
      </header>

      <section aria-label="État du système" className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted">État du système</h2>
        <ApiStatus health={health} />
        <div
          data-testid="api-auth-status"
          data-state={apiUser ? "authenticated" : "unauthenticated"}
          className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm"
        >
          <span
            aria-hidden
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${apiUser ? "bg-success" : "bg-danger"}`}
          />
          <span className="font-medium text-ink">Session</span>
          <span className="text-muted">
            {apiUser ? "Reconnue par l'API" : "Non reconnue par l'API"}
          </span>
        </div>
      </section>
    </div>
  );
}
