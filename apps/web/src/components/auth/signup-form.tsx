"use client";

import { PASSWORD_MIN_LENGTH } from "@primeo/shared";
import { Alert, Button, TextField } from "@primeo/ui";
import { useActionState } from "react";
import { signUpAction } from "@/services/auth/actions";
import { initialFormState } from "@/services/auth/form-state";

export function SignupForm() {
  const [state, action, pending] = useActionState(signUpAction, initialFormState);

  if (state.status === "success") {
    return <Alert tone="success">{state.message}</Alert>;
  }

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {state.message ? <Alert tone="danger">{state.message}</Alert> : null}
      <TextField
        label="Nom complet"
        name="fullName"
        autoComplete="name"
        required
        defaultValue={state.values?.fullName}
        error={state.fieldErrors?.fullName}
      />
      <TextField
        label="Adresse e-mail"
        name="email"
        type="email"
        autoComplete="email"
        required
        hint="L'adresse à laquelle vous avez été invité."
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
      />
      <TextField
        label="Mot de passe"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        hint={`Au moins ${PASSWORD_MIN_LENGTH} caractères, avec une majuscule, une minuscule et un chiffre.`}
        error={state.fieldErrors?.password}
      />
      <TextField
        label="Confirmation du mot de passe"
        name="passwordConfirmation"
        type="password"
        autoComplete="new-password"
        required
        error={state.fieldErrors?.passwordConfirmation}
      />
      <Button type="submit" loading={pending}>
        Créer mon compte
      </Button>
    </form>
  );
}
