import { z } from "zod";

/** Longueur minimale imposée par l'application (plus stricte que le minimum Supabase). */
export const PASSWORD_MIN_LENGTH = 12;

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Adresse e-mail invalide." }));

const password = z
  .string()
  .min(PASSWORD_MIN_LENGTH, {
    error: `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`,
  })
  .max(128, { error: "Le mot de passe est trop long." })
  .regex(/[a-z]/, { error: "Le mot de passe doit contenir une minuscule." })
  .regex(/[A-Z]/, { error: "Le mot de passe doit contenir une majuscule." })
  .regex(/[0-9]/, { error: "Le mot de passe doit contenir un chiffre." });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, { error: "Saisissez votre mot de passe." }),
});

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, { error: "Indiquez votre nom complet." })
      .max(120, { error: "Le nom est trop long." }),
    email,
    password,
    passwordConfirmation: z.string(),
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    path: ["passwordConfirmation"],
    error: "Les mots de passe ne correspondent pas.",
  });

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({ password, passwordConfirmation: z.string() })
  .refine((values) => values.password === values.passwordConfirmation, {
    path: ["passwordConfirmation"],
    error: "Les mots de passe ne correspondent pas.",
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
