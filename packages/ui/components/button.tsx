import type { ButtonHTMLAttributes } from "react";
import { cx } from "../utilities";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand text-on-brand shadow-brand hover:bg-brand-hover",
  secondary: "border border-line-strong bg-surface text-ink shadow-xs hover:bg-surface-muted",
  ghost: "text-muted hover:bg-surface-muted hover:text-ink",
  // Rouge constant (#D41313) : contraste suffisant avec le texte blanc, en clair comme en sombre.
  danger: "bg-[#d41313] text-white hover:bg-[#b11010]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

/** Classes d'un bouton, réutilisables sur un lien (`<Link className={buttonClasses()}>`). */
export function buttonClasses(
  options: { variant?: ButtonVariant; size?: ButtonSize; className?: string | undefined } = {},
) {
  return cx(
    "inline-flex items-center justify-center gap-2 rounded-md font-semibold whitespace-nowrap",
    "transition duration-200 ease-premium active:translate-y-px",
    "disabled:pointer-events-none disabled:opacity-55",
    variants[options.variant ?? "primary"],
    sizes[options.size ?? "md"],
    options.className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, className })}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}

/** Indicateur de chargement. */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cx(
        "h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent",
        className,
      )}
    />
  );
}
