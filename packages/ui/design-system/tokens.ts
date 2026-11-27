/**
 * Contrat du design system : noms des jetons de couleur exposés comme utilitaires Tailwind
 * (bg-surface, text-muted…). Leurs valeurs sont définies dans le thème de l'application
 * (apps/web/src/styles/globals.css), en clair et en sombre.
 */
export const colorTokens = [
  "canvas",
  "surface",
  "line",
  "ink",
  "muted",
  "accent",
  "accent-ink",
  "success",
  "danger",
] as const;

export type ColorToken = (typeof colorTokens)[number];
