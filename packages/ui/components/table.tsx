import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cx } from "../utilities";

/**
 * Tableau de données. Défile horizontalement sur petit écran sans élargir la page.
 * Chiffres alignés grâce aux chiffres tabulaires.
 */
export function Table({ caption, children }: { caption?: string; children: ReactNode }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm tabular">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return <thead className="border-b border-line bg-surface-muted">{children}</thead>;
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-line">{children}</tbody>;
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr {...props} className={cx("transition-colors hover:bg-surface-muted/70", className)} />;
}

export function TableHeaderCell({
  className,
  align,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      {...props}
      className={cx(
        "px-4 py-2.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap text-subtle",
        align === "right" ? "text-right" : "",
        className,
      )}
    />
  );
}

export function TableCell({ className, align, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      {...props}
      className={cx(
        "px-4 py-3 align-middle text-ink",
        align === "right" ? "text-right" : "",
        className,
      )}
    />
  );
}

/** Ligne affichée quand le tableau est vide. */
export function TableEmpty({ columns, children }: { columns: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={columns} className="px-4 py-10 text-center text-sm text-muted">
        {children}
      </td>
    </tr>
  );
}
