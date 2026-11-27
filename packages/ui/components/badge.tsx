import type { ReactNode } from "react";
import type { Tone } from "../design-system/tokens";
import { cx } from "../utilities";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-muted text-muted ring-line-strong",
  brand: "bg-brand-soft text-brand-ink ring-brand/25",
  accent: "bg-accent-soft text-accent-ink ring-accent/30",
  success: "bg-success-soft text-success-ink ring-success/30",
  warning: "bg-warning-soft text-warning-ink ring-warning/30",
  danger: "bg-danger-soft text-danger-ink ring-danger/30",
};

const dots: Record<Tone, string> = {
  neutral: "bg-subtle",
  brand: "bg-brand",
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

/** Étiquette de statut (mission, validation, priorité…). */
export function Badge({
  tone = "neutral",
  dot = false,
  children,
}: {
  tone?: Tone;
  dot?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset",
        tones[tone],
      )}
    >
      {dot ? <span aria-hidden className={cx("h-1.5 w-1.5 rounded-full", dots[tone])} /> : null}
      {children}
    </span>
  );
}

/** Pastille d'état seule, avec libellé accessible. */
export function StatusDot({ tone, label }: { tone: Tone; label: string }) {
  return (
    <span className="inline-flex items-center">
      <span aria-hidden className={cx("h-2.5 w-2.5 rounded-full", dots[tone])} />
      <span className="sr-only">{label}</span>
    </span>
  );
}
