"use client";
import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase-browser";

export default function NovaSenha() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("password") ?? "");
    if (password.length < 6) return setMsg({ ok: false, text: "A senha precisa ter pelo menos 6 caracteres." });
    setBusy(true);
    const { error } = await createBrowserSupabase().auth.updateUser({ password });
    setBusy(false);
    if (error) return setMsg({ ok: false, text: "Link expirado. Peça um novo em “Esqueci minha senha”." });
    setMsg({ ok: true, text: "Senha alterada!" });
    setTimeout(() => window.location.replace(`${window.location.origin}/minha-conta`), 1000);
  }
  return (
    <div className="fp-page min-h-[80vh] px-5 pb-20 pt-28">
      <form onSubmit={submit} className="fp-card fp-form mx-auto flex max-w-md flex-col gap-4">
        <h1 className="fp-heading fp-h3">Criar nova senha</h1>
        <label>Nova senha<input name="password" type="password" minLength={6} autoComplete="new-password" required /></label>
        {msg && <p className={`text-sm font-semibold ${msg.ok ? "" : "text-red-700"}`}>{msg.text}</p>}
        <button type="submit" disabled={busy} className="fp-btn fp-btn-primary">{busy ? "Salvando…" : "Salvar"}</button>
      </form>
    </div>
  );
}
