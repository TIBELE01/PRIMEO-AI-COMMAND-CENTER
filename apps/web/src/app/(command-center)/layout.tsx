import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { CommandCenterLayout } from "@/layouts/command-center-layout";
import { getCurrentUser } from "@/services/auth/current-user";

// L'espace authentifié n'est jamais mis en cache ni pré-rendu.
export const dynamic = "force-dynamic";

/**
 * Deuxième barrière (après src/proxy.ts) : l'utilisateur est revérifié côté serveur
 * avant tout rendu de l'espace privé.
 */
export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const current = await getCurrentUser();
  if (!current) {
    redirect("/login");
  }
  if (current.status === "unauthorized") {
    redirect("/auth/denied");
  }

  return (
    <CommandCenterLayout user={{ fullName: current.profile.full_name, role: current.profile.role }}>
      {children}
    </CommandCenterLayout>
  );
}
