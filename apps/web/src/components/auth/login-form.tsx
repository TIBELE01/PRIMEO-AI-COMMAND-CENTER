"use client";

import { Alert, Button, TextField } from "@primeo/ui";
import Link from "next/link";
import { useActionState } from "react";
import { signInAction } from "@/services/auth/actions";
import { initialFormState } from "@/services/auth/form-state";

export function LoginForm({ next, notice }: { next: string; notice?: string | undefined }) {
  const [state, action, pending] = useActionState(signInAction, initialFormState);

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {notice && state.status === "idle" ? <Alert tone="danger">{notice}</Alert> : null}
      {state.message ? <Alert tone="danger">{state.message}</Alert> : null}
      <input type="hidden" name="next" value={next} />
      <TextField
        label="Adresse e-mail"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
      />
      <TextField
        label="Mot de passe"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        error={state.fieldErrors?.password}
      />
      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-sm text-brand-ink hover:underline">
          Mot de passe oublié ?
        </Link>
      </div>
      <Button type="submit" loading={pending}>
        Se connecter
      </Button>
    </form>
  );
}
