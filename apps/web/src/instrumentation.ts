/**
 * Exécuté une fois au démarrage du serveur Next.js : la configuration de l'interface est
 * validée par le module central. En cas d'erreur, le serveur s'arrête avec un message clair.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }
  const { loadEnvironment } = await import("@primeo/security/secrets");
  loadEnvironment("web");
}
