"use client";

import { Alert, Button, TextField } from "@primeo/ui";
import { useActionState } from "react";
import { requestPasswordResetAction } from "@/services/auth/actions";
import { initialFormState } from "@/services/auth/form-state";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, initialFormState);

  if (state.status === "success") {
    return <Alert tone="success">{state.message}</Alert>;
  }

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {state.message ? <Alert tone="danger">{state.message}</Alert> : null}
      <TextField
        label="Adresse e-mail"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
      />
      <Button type="submit" loading={pending}>
        Envoyer le lien
      </Button>
    </form>
  );
}
