/** Nom officiel de l'application, affiché dans l'interface et les journaux. */
export const APP_NAME = "Primeo AI Command Center";

/** Identifiants des services déployables. */
export const SERVICES = {
  web: "primeo-web",
  api: "primeo-api",
  workers: "primeo-workers",
} as const;

export type ServiceName = (typeof SERVICES)[keyof typeof SERVICES];
