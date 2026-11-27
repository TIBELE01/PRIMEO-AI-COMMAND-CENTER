import { useId, type InputHTMLAttributes } from "react";
import { cx } from "../utilities";

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
}

/** Champ de formulaire accessible : libellé, aide et message d'erreur reliés au champ. */
export function TextField({ label, error, hint, id, className, ...props }: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const describedBy = [error ? `${inputId}-error` : null, hint ? `${inputId}-hint` : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        {...props}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={cx(
          "h-11 w-full rounded-md border bg-surface px-3.5 text-base text-ink shadow-xs sm:text-sm",
          "transition duration-200 ease-premium placeholder:text-subtle",
          "hover:border-line-strong focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15",
          error ? "border-danger focus:border-danger focus:ring-danger/15" : "border-line",
          className,
        )}
      />
      {hint && !error ? (
        <p id={`${inputId}-hint`} className="text-xs leading-relaxed text-subtle">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${inputId}-error`} className="text-xs font-medium text-danger-ink">
          {error}
        </p>
      ) : null}
    </div>
  );
}
