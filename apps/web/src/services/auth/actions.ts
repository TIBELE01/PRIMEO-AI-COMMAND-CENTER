"use server";

import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  safeRedirectPath,
  signupSchema,
} from "@primeo/shared";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/services/supabase/server";
import { APP_URL } from "@/utils/env";
import { type FormState, toFieldErrors } from "./form-state";
import { authErrorMessage } from "./messages";

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/** Connexion par e-mail et mot de passe. */
export async function signInAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const values = { email: field(formData, "email") };
  const parsed = loginSchema.safeParse({
    email: values.email,
    password: field(formData, "password"),
  });
  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors(parsed.error.issues), values };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) {
    return { status: "error", message: authErrorMessage(error ?? { message: "" }), values };
  }

  // Le compte Auth existe, mais l'accès exige un profil applicatif actif.
  const { data: profile } = await supabase
    .from("users")
    .select("is_active")
    .eq("id", data.user.id)
    .maybeSingle();
  if (!profile?.is_active) {
    await supabase.auth.signOut();
    return {
      status: "error",
      message: "Votre compte n'est pas autorisé à accéder au Command Center.",
      values,
    };
  }

  redirect(safeRedirectPath(field(formData, "next")));
}

/** Création de compte (réservée aux adresses invitées, contrôle fait par la base). */
export async function signUpAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const values = { fullName: field(formData, "fullName"), email: field(formData, "email") };
  const parsed = signupSchema.safeParse({
    ...values,
    password: field(formData, "password"),
    passwordConfirmation: field(formData, "passwordConfirmation"),
  });
  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors(parsed.error.issues), values };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${APP_URL}/auth/callback?next=/`,
      data: { full_name: parsed.data.fullName },
    },
  });
  if (error) {
    return { status: "error", message: authErrorMessage(error), values };
  }

  return {
    status: "success",
    message:
      "Compte créé. Un e-mail de confirmation vient de vous être envoyé : ouvrez le lien qu'il contient pour activer votre accès.",
  };
}

/** Envoi d'un lien de réinitialisation du mot de passe. */
export async function requestPasswordResetAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = { email: field(formData, "email") };
  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors(parsed.error.issues), values };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${APP_URL}/auth/callback?next=/reset-password`,
  });
  if (error?.code === "over_email_send_rate_limit" || error?.code === "over_request_rate_limit") {
    return { status: "error", message: authErrorMessage(error), values };
  }

  // Réponse identique que l'adresse existe ou non : on ne révèle pas quels comptes existent.
  return {
    status: "success",
    message:
      "Si un compte correspond à cette adresse, un e-mail contenant un lien de réinitialisation vient d'être envoyé.",
  };
}

/** Définition d'un nouveau mot de passe (session de récupération ouverte par le lien reçu). */
export async function resetPasswordAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = resetPasswordSchema.safeParse({
    password: field(formData, "password"),
    passwordConfirmation: field(formData, "passwordConfirmation"),
  });
  if (!parsed.success) {
    return { status: "error", fieldErrors: toFieldErrors(parsed.error.issues) };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { status: "error", message: authErrorMessage(error) };
  }

  redirect("/");
}

/** Déconnexion. */
export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
