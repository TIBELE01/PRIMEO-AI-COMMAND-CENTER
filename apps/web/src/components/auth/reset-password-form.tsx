"use client";

import { PASSWORD_MIN_LENGTH } from "@primeo/shared";
import { Alert, Button, TextField } from "@primeo/ui";
import { useActionState } from "react";
import { resetPasswordAction } from "@/services/auth/actions";
import { initialFormState } from "@/services/auth/form-state";

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(resetPasswordAction, initialFormState);

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {state.message ? <Alert tone="danger">{state.message}</Alert> : null}
      <TextField
        label="Nouveau mot de passe"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        hint={`Au moins ${PASSWORD_MIN_LENGTH} caractères, avec une majuscule, une minuscule et un chiffre.`}
        error={state.fieldErrors?.password}
      />
      <TextField
        label="Confirmation"
        name="passwordConfirmation"
        type="password"
        autoComplete="new-password"
        required
        error={state.fieldErrors?.passwordConfirmation}
      />
      <Button type="submit" loading={pending}>
        Enregistrer le mot de passe
      </Button>
    </form>
  );
}
