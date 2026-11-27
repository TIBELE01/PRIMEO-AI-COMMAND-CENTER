import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthLayout } from "@/layouts/auth-layout";

export const metadata: Metadata = { title: "Nouveau mot de passe" };

// Accessible uniquement avec la session ouverte par le lien de réinitialisation (voir src/proxy.ts).
export default function ResetPasswordPage() {
  return (
    <AuthLayout title="Nouveau mot de passe" description="Choisissez votre nouveau mot de passe.">
      <ResetPasswordForm />
    </AuthLayout>
  );
}
