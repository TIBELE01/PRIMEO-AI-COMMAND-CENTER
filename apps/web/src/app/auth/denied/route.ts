import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/services/supabase/server";

/** Ferme la session d'un utilisateur authentifié mais non autorisé, puis revient à la connexion. */
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "";
  loginUrl.searchParams.set("error", "account_inactive");
  return NextResponse.redirect(loginUrl);
}
