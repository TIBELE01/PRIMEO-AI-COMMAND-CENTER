/** Traduit les erreurs de Supabase Auth en messages clairs, sans révéler de détail technique. */
export function authErrorMessage(error: {
  code?: string | undefined;
  message: string;
  status?: number | undefined;
}): string {
  switch (error.code) {
    case "invalid_credentials":
      return "Adresse e-mail ou mot de passe incorrect.";
    case "email_not_confirmed":
      return "Votre adresse e-mail n'est pas encore confirmée. Ouvrez le lien reçu par e-mail.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Trop de tentatives. Patientez quelques minutes avant de réessayer.";
    case "weak_password":
      return "Ce mot de passe est trop faible.";
    case "same_password":
      return "Le nouveau mot de passe doit être différent de l'actuel.";
    case "session_not_found":
    case "session_expired":
      return "Votre session a expiré. Recommencez la procédure.";
    default:
      break;
  }
  // Refus du déclencheur d'invitation (migration 1200) : Supabase renvoie une erreur générique.
  if (error.message.includes("Database error saving new user")) {
    return "Cette adresse n'a pas reçu d'invitation. L'accès au Command Center est réservé aux personnes invitées.";
  }
  return "Une erreur est survenue. Réessayez dans un instant.";
}

/** Messages affichés sur la page de connexion selon le paramètre `error`. */
export const LOGIN_NOTICES: Record<string, string> = {
  account_inactive: "Votre compte n'est pas autorisé à accéder au Command Center.",
  link_invalid: "Ce lien n'est plus valide. Il a peut-être déjà été utilisé ou a expiré.",
};
