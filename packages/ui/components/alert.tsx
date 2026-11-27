import type { ReactNode } from "react";
import type { Tone } from "../design-system/tokens";
import { cx } from "../utilities";

type AlertTone = Exclude<Tone, "neutral" | "accent"> | "info";

const tones: Record<AlertTone, string> = {
  info: "border-brand/25 bg-brand-soft text-ink",
  brand: "border-brand/25 bg-brand-soft text-ink",
  success: "border-success/30 bg-success-soft text-ink",
  warning: "border-warning/30 bg-warning-soft text-ink",
  danger: "border-danger/30 bg-danger-soft text-ink",
};

const bars: Record<AlertTone, string> = {
  info: "bg-brand",
  brand: "bg-brand",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

/** Message d'état annoncé aux technologies d'assistance. */
export function Alert({
  tone = "info",
  title,
  children,
}: {
  tone?: AlertTone;
  title?: string;
  children: ReactNode;
}) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cx(
        "flex gap-3 rounded-md border px-3.5 py-3 text-sm leading-relaxed",
        tones[tone],
      )}
    >
      <span
        aria-hidden
        className={cx("mt-0.5 w-1 shrink-0 self-stretch rounded-full", bars[tone])}
      />
      <div className="flex flex-col gap-0.5">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div>{children}</div>
      </div>
    </div>
  );
}
