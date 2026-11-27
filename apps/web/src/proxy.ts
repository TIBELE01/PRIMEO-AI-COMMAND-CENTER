import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/services/supabase/session";

/** Pages accessibles sans être connecté. */
const PUBLIC_PATHS = ["/login", "/signup", "/forgot-password", "/auth/"];
/** Pages réservées aux visiteurs non connectés (un utilisateur connecté est renvoyé à l'accueil). */
const GUEST_ONLY_PATHS = ["/login", "/signup", "/forgot-password"];

/** Redirige en conservant les cookies de session éventuellement rafraîchis. */
function redirectKeepingSession(url: URL, sessionResponse: NextResponse): NextResponse {
  const redirect = NextResponse.redirect(url);
  for (const cookie of sessionResponse.cookies.getAll()) {
    redirect.cookies.set(cookie);
  }
  return redirect;
}

function matches(pathname: string, paths: string[]): boolean {
  return paths.some((path) =>
    path.endsWith("/")
      ? pathname.startsWith(path)
      : pathname === path || pathname.startsWith(`${path}/`),
  );
}

/**
 * Exécuté avant chaque page : rafraîchit la session et protège les routes privées.
 * Ce n'est qu'une première barrière : chaque page privée revérifie l'utilisateur côté serveur.
 */
export async function proxy(request: NextRequest) {
  const { response, userId } = await updateSession(request);
  const { pathname, search } = request.nextUrl;

  if (!userId && !matches(pathname, PUBLIC_PATHS)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return redirectKeepingSession(loginUrl, response);
  }

  if (userId && matches(pathname, GUEST_ONLY_PATHS)) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    homeUrl.search = "";
    return redirectKeepingSession(homeUrl, response);
  }

  return response;
}

export const config = {
  // Toutes les routes sauf les ressources statiques.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
