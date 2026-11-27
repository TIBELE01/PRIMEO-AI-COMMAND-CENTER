import { safeRedirectPath } from "@primeo/shared";
import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { AuthLayout } from "@/layouts/auth-layout";
import { LOGIN_NOTICES } from "@/services/auth/messages";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = safeRedirectPath(params.next);
  const notice = typeof params.error === "string" ? LOGIN_NOTICES[params.error] : undefined;

  return (
    <AuthLayout
      title="Connexion"
      description="Accédez au centre de commandement de Primeo."
      footer={
        <>
          Vous avez reçu une invitation ?{" "}
          <Link href="/signup" className="font-medium text-brand-ink hover:underline">
            Créer votre compte
          </Link>
        </>
      }
    >
      <LoginForm next={next} notice={notice} />
    </AuthLayout>
  );
}
