import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { AuthLayout } from "@/layouts/auth-layout";

export const metadata: Metadata = { title: "Créer un compte" };

export default function SignupPage() {
  return (
    <AuthLayout
      title="Créer un compte"
      description="L'accès est réservé aux personnes invitées par la direction de Primeo."
      footer={
        <>
          Déjà un compte ?{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Se connecter
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthLayout>
  );
}
