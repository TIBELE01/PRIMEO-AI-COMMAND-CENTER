import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { APP_NAME } from "@primeo/shared";
import "@fontsource-variable/inter";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
  description: "Centre de commandement de Primeo.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-canvas text-ink antialiased">{children}</body>
    </html>
  );
}
