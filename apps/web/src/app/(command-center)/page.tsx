import { Badge, Card, CardHeader } from "@primeo/ui";
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
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-ink">
          Centre de commandement
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Bonjour{firstName ? ` ${firstName}` : ""}.
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted">
          Le socle technique est en place. Les modules du centre de commandement seront activés
          phase par phase.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card aria-label="État du système">
          <CardHeader
            title="État du système"
            description="Vérifié à chaque affichage de cette page."
          />
          <div className="divide-y divide-line">
            <ApiStatus health={health} />
            <div
              data-testid="api-auth-status"
              data-state={apiUser ? "authenticated" : "unauthenticated"}
              className="flex items-center justify-between gap-3 px-5 py-4"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-ink">Session sécurisée</span>
                <span className="text-xs text-subtle">
                  Jeton vérifié par l’API, profil lu sous RLS
                </span>
              </div>
              <Badge tone={apiUser ? "success" : "danger"} dot>
                {apiUser ? "Reconnue" : "Non reconnue"}
              </Badge>
            </div>
            {apiUser ? (
              <div className="flex items-center justify-between gap-3 px-5 py-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-ink">Double authentification</span>
                  <span className="text-xs text-subtle">
                    Prévue pour votre compte, activation à venir
                  </span>
                </div>
                <Badge tone={apiUser.mfa.satisfied ? "success" : "warning"} dot>
                  {apiUser.mfa.satisfied ? "Active" : "À activer"}
                </Badge>
              </div>
            ) : null}
          </div>
        </Card>

        <Card aria-label="Modules">
          <CardHeader
            title="Modules du centre de commandement"
            description="Ils apparaîtront ici au fil de leur mise en service."
          />
          <ul className="divide-y divide-line">
            {[
              "Executive Dashboard",
              "AI Directors",
              "Communication Center",
              "Mission Control",
              "Approval Center",
              "Performance Center",
              "Reports Center",
              "Activity Logs",
            ].map((module) => (
              <li
                key={module}
                className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
              >
                <span className="text-ink">{module}</span>
                <Badge tone="neutral">À venir</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
