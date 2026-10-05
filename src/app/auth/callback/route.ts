import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSessionClient } from "@/lib/supabase-server";
import { safeNext } from "@/lib/request";

/** Volta do login com Google e dos links de e-mail (confirmação de conta, nova senha). */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeNext(searchParams.get("next"));
  const supabase = await createSessionClient();
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  let error: string | null = searchParams.get("error_description");
  if (code) {
    const r = await supabase.auth.exchangeCodeForSession(code);
    error = r.error?.message ?? null;
  } else if (tokenHash && type) {
    const r = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    error = r.error?.message ?? null;
  }
  if (error) return NextResponse.redirect(`${origin}/entrar?erro=${encodeURIComponent("Link inválido ou expirado. Tente novamente.")}`);
  return NextResponse.redirect(`${origin}${type === "recovery" ? "/entrar/nova-senha" : next}`);
}
