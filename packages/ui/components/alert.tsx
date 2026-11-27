import type { ReactNode } from "react";
import { cx } from "../utilities";

type AlertTone = "info" | "success" | "danger";

const tones: Record<AlertTone, string> = {
  info: "border-line bg-surface text-ink",
  success: "border-success/40 bg-success/10 text-ink",
  danger: "border-danger/40 bg-danger/10 text-ink",
};

/** Message d'état annoncé aux technologies d'assistance. */
export function Alert({ tone = "info", children }: { tone?: AlertTone; children: ReactNode }) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cx("rounded-lg border px-3 py-2.5 text-sm leading-relaxed", tones[tone])}
    >
      {children}
    </div>
  );
}
