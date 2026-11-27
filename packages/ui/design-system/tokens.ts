/**
 * Contrat du design system : rôles de couleur exposés comme utilitaires Tailwind
 * (bg-surface, text-muted, border-line…). Valeurs définies dans `theme.css`, en clair et en sombre.
 */
export const colorTokens = [
  "canvas",
  "surface",
  "surface-muted",
  "line",
  "line-strong",
  "ink",
  "muted",
  "subtle",
  "brand",
  "brand-hover",
  "brand-soft",
  "brand-ink",
  "on-brand",
  "accent",
  "accent-soft",
  "accent-ink",
  "success",
  "success-soft",
  "success-ink",
  "warning",
  "warning-soft",
  "warning-ink",
  "danger",
  "danger-soft",
  "danger-ink",
  "focus",
] as const;

export type ColorToken = (typeof colorTokens)[number];

/** Couleurs officielles de la charte Primeo. */
export const brandColors = {
  blue: "#0055FF",
  blueInterface: "#1056E0",
  orange: "#FF6600",
  night: "#0B1B3A",
  green: "#00CC66",
  red: "#FF3333",
} as const;

/** Tonalités partagées par les badges, alertes et indicateurs. */
export type Tone = "neutral" | "brand" | "accent" | "success" | "warning" | "danger";
