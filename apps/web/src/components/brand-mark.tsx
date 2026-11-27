import { APP_NAME } from "@primeo/shared";
import Image from "next/image";
import { cx } from "@primeo/ui";

/** Logo officiel Primeo accompagné du nom de l'application. */
export function BrandMark({
  tone = "default",
  showProduct = true,
  className,
}: {
  tone?: "default" | "inverse";
  showProduct?: boolean;
  className?: string;
}) {
  return (
    <span className={cx("inline-flex items-center gap-3", className)}>
      <Image
        src="/brand/logo-primeo.png"
        alt="Primeo"
        width={36}
        height={30}
        priority
        className="h-[30px] w-auto"
      />
      <span className="flex flex-col leading-tight">
        <span
          className={cx(
            "text-[15px] font-bold tracking-tight",
            tone === "inverse" ? "text-white" : "text-ink",
          )}
        >
          Primeo
        </span>
        {showProduct ? (
          <span
            className={cx(
              "text-[11px] font-medium uppercase tracking-[0.16em]",
              tone === "inverse" ? "text-primary-200" : "text-subtle",
            )}
          >
            {APP_NAME.replace("Primeo ", "")}
          </span>
        ) : null}
      </span>
    </span>
  );
}
