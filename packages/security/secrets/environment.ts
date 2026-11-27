import {
  ENVIRONMENT_CATALOG,
  type ServiceName,
  type VariableName,
  type VariableValue,
  variablesForService,
} from "./catalog";

export interface EnvironmentIssue {
  variable: VariableName;
  problem: "missing" | "invalid";
  message: string;
}

/** Configuration invalide : liste chaque problème, sans jamais afficher une valeur reçue. */
export class EnvironmentValidationError extends Error {
  readonly issues: EnvironmentIssue[];

  constructor(service: ServiceName, issues: EnvironmentIssue[]) {
    const lines = issues.map((issue) => `  - ${issue.variable} : ${issue.message}`).join("\n");
    super(
      `Configuration invalide pour le service « ${service} » (${issues.length} problème(s)) :\n${lines}\n` +
        "Voir .env.example pour la liste et le format des variables attendues.",
    );
    this.name = "EnvironmentValidationError";
    this.issues = issues;
  }
}

export type LoadedEnvironment = { readonly [K in VariableName]?: VariableValue<K> };

/**
 * Valide les variables d'un service au démarrage :
 *  - présence des variables obligatoires (dont celles exigées en production) ;
 *  - format de toute variable fournie (une clé mal copiée est détectée immédiatement) ;
 *  - valeurs par défaut documentées pour les variables non sensibles.
 * Seules les variables déclarées pour ce service sont renvoyées.
 */
export function loadEnvironment(
  service: ServiceName,
  source: Record<string, string | undefined> = process.env,
): LoadedEnvironment {
  const nodeEnv = source.NODE_ENV ?? "development";
  const isProduction = nodeEnv === "production";
  const issues: EnvironmentIssue[] = [];
  const values: Record<string, unknown> = {};

  for (const name of variablesForService(service)) {
    const definition = ENVIRONMENT_CATALOG[name];
    const requirement = definition.usedBy[service];
    const provided = source[name]?.trim();
    const raw = provided ? provided : "default" in definition ? definition.default : undefined;

    if (raw === undefined) {
      if (requirement === "required" || (requirement === "production" && isProduction)) {
        issues.push({
          variable: name,
          problem: "missing",
          message: `manquante. ${definition.description}`,
        });
      }
      continue;
    }

    const parsed = definition.schema.safeParse(raw);
    if (!parsed.success) {
      issues.push({
        variable: name,
        problem: "invalid",
        message: parsed.error.issues[0]?.message ?? "format invalide.",
      });
      continue;
    }
    values[name] = parsed.data;
  }

  if (issues.length > 0) {
    throw new EnvironmentValidationError(service, issues);
  }
  return Object.freeze(values) as LoadedEnvironment;
}

/**
 * Résumé affichable de la configuration : indique quelles variables sont définies,
 * sans jamais révéler la valeur d'un secret.
 */
export function describeEnvironment(environment: LoadedEnvironment): Record<string, string> {
  const summary: Record<string, string> = {};
  for (const [name, value] of Object.entries(environment)) {
    const definition = ENVIRONMENT_CATALOG[name as VariableName];
    summary[name] = definition.visibility === "secret" ? "défini (masqué)" : String(value);
  }
  return summary;
}
