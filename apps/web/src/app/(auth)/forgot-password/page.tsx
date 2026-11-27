import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { AuthLayout } from "@/layouts/auth-layout";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Mot de passe oublié"
      description="Indiquez votre adresse e-mail : vous recevrez un lien pour définir un nouveau mot de passe."
      footer={
        <Link href="/login" className="font-medium text-accent hover:underline">
          Retour à la connexion
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
