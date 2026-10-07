import { cache } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_KEY, SUPABASE_URL } from "./supabase";

/** Cliente com a sessão do participante (cookies). Use só onde a página precisa saber quem está logado. */
export async function createSessionClient() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // chamado a partir de um Server Component: o proxy renova a sessão
        }
      },
    },
  });
}

/** Participante logado (ou null). */
export const getViewer = cache(async () => {
  const supabase = await createSessionClient();
  const { data } = await supabase.auth.getUser();
  const u = data.user;
  if (!u) return { supabase, user: null };
  const meta = u.user_metadata ?? {};
  return { supabase, user: { id: u.id, email: u.email ?? "", name: (meta.full_name as string) || (meta.name as string) || u.email || "" } };
});
