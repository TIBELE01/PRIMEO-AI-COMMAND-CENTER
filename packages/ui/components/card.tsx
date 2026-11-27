import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utilities";

/** Surface de contenu : conteneur de base des tableaux de bord. */
export function Card({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      {...props}
      className={cx("flex flex-col rounded-lg border border-line bg-surface shadow-sm", className)}
    />
  );
}

export function CardHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  eyebrow?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
      <div className="flex min-w-0 flex-col gap-1">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-base font-semibold tracking-tight text-ink">{title}</h2>
        {description ? <p className="text-sm leading-relaxed text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cx("flex flex-col gap-4 px-5 py-5", className)} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cx(
        "flex flex-wrap items-center justify-end gap-2 rounded-b-lg border-t border-line bg-surface-muted px-5 py-3",
        className,
      )}
    />
  );
}
