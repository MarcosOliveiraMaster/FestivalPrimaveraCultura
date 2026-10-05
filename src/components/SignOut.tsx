"use client";
import { createBrowserSupabase } from "@/lib/supabase-browser";

export function SignOut() {
  return (
    <button
      type="button"
      className="fp-btn fp-btn-outline"
      onClick={async () => {
        await createBrowserSupabase().auth.signOut();
        window.location.replace(window.location.origin);
      }}
    >
      Sair
    </button>
  );
}
