"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { cx } from "../utilities";

/**
 * Fenêtre modale fondée sur l'élément natif <dialog> : piégeage du focus, fermeture par
 * Échap et inertie du reste de la page gérés par le navigateur.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={onClose}
      onClick={(event) => {
        // Clic sur le fond (hors du contenu) : fermeture.
        if (event.target === dialogRef.current) onClose();
      }}
      className={cx(
        "m-auto w-[calc(100%-2rem)] rounded-xl border border-line bg-surface p-0 text-ink shadow-lg",
        "backdrop:bg-night-950/55 backdrop:backdrop-blur-[2px]",
        size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-2xl" : "max-w-lg",
      )}
    >
      <div className="flex flex-col">
        <header className="flex items-start justify-between gap-4 px-6 pt-6">
          <div className="flex flex-col gap-1.5">
            <h2 id={titleId} className="text-lg font-semibold tracking-tight">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="text-sm leading-relaxed text-muted">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="-mr-2 -mt-1 rounded-md p-2 text-subtle transition hover:bg-surface-muted hover:text-ink"
          >
            <svg
              aria-hidden
              viewBox="0 0 20 20"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            </svg>
          </button>
        </header>
        {children ? (
          <div className="px-6 py-5 text-sm leading-relaxed">{children}</div>
        ) : (
          <div className="h-5" />
        )}
        {footer ? (
          <footer className="flex flex-wrap justify-end gap-2 rounded-b-xl border-t border-line bg-surface-muted px-6 py-4">
            {footer}
          </footer>
        ) : null}
      </div>
    </dialog>
  );
}
