"use client";
import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase-browser";

const MSG: [RegExp, string][] = [
  [/invalid login credentials/i, "E-mail ou senha incorretos."],
  [/email not confirmed/i, "Confirme seu e-mail pelo link que enviamos antes de entrar."],
  [/already registered/i, "Este e-mail já tem cadastro. Use a aba Entrar."],
  [/password should be at least/i, "A senha precisa ter pelo menos 6 caracteres."],
  [/rate limit|too many/i, "Muitas tentativas. Aguarde alguns minutos."],
];
function traduz(e: { message?: string } | null) {
  const m = e?.message ?? "";
  return MSG.find(([re]) => re.test(m))?.[1] ?? (m || "Não foi possível concluir agora.");
}

export function LoginForm({ next, initialError }: { next: string; initialError?: string }) {
  const [mode, setMode] = useState<"entrar" | "criar">("entrar");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [info, setInfo] = useState<string | null>(null);
  const callback = (to: string) => `${window.location.origin}/auth/callback?next=${encodeURIComponent(to)}`;

  async function google() {
    setBusy(true);
    const { error } = await createBrowserSupabase().auth.signInWithOAuth({ provider: "google", options: { redirectTo: callback(next) } });
    if (error) {
      setError(traduz(error));
      setBusy(false);
    }
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const name = String(fd.get("name") ?? "").trim();
    setError(null);
    setInfo(null);
    if (mode === "criar" && name.split(/\s+/).length < 2) return setError("Informe nome e sobrenome — é o nome que vai no certificado.");
    setBusy(true);
    const supabase = createBrowserSupabase();
    if (mode === "entrar") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setBusy(false);
        return setError(traduz(error));
      }
      window.location.href = next;
      return;
    }
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: callback(next) } });
    setBusy(false);
    if (error) return setError(traduz(error));
    if (data.session) {
      window.location.href = next;
      return;
    }
    setInfo(`Conta criada! Enviamos um link de confirmação para ${email}. Clique nele para entrar.`);
  }

  async function forgot(form: HTMLFormElement | null) {
    const email = String(new FormData(form ?? undefined).get("email") ?? "").trim();
    if (!email) return setError("Digite seu e-mail acima para receber o link de nova senha.");
    setBusy(true);
    const { error } = await createBrowserSupabase().auth.resetPasswordForEmail(email, { redirectTo: callback("/entrar/nova-senha") });
    setBusy(false);
    if (error) return setError(traduz(error));
    setError(null);
    setInfo(`Se houver cadastro, enviamos um link para ${email}.`);
  }

  return (
    <div className="fp-card mx-auto flex w-full max-w-md flex-col gap-5">
      <button type="button" onClick={google} disabled={busy} className="fp-btn fp-login-google">
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" /><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.2-.1-2.3-.4-3.5z" /></svg>
        Continuar com Google
      </button>
      <div className="fp-login-or">ou com e-mail</div>
      <div className="fp-login-tabs" role="tablist">
        {(["entrar", "criar"] as const).map((m) => (
          <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => { setMode(m); setError(null); setInfo(null); }}>
            {m === "entrar" ? "Entrar" : "Criar conta"}
          </button>
        ))}
      </div>
      <form id="login" onSubmit={submit} className="fp-form flex flex-col gap-3" noValidate>
        {mode === "criar" && (
          <label>Nome completo <small className="opacity-70">(como vai aparecer no certificado)</small><input name="name" autoComplete="name" required /></label>
        )}
        <label>E-mail<input name="email" type="email" autoComplete="email" required /></label>
        <label>Senha<input name="password" type="password" minLength={6} autoComplete={mode === "criar" ? "new-password" : "current-password"} required /></label>
        {error && <p className="text-sm font-semibold text-red-700" role="alert">{error}</p>}
        {info && <p className="text-sm font-semibold" style={{ color: "var(--fp-primary)" }} role="status">{info}</p>}
        <button type="submit" disabled={busy} className="fp-btn fp-btn-primary">{busy ? "Aguarde…" : mode === "entrar" ? "Entrar" : "Criar conta"}</button>
        {mode === "entrar" && (
          <button type="button" className="self-center text-sm underline opacity-75" onClick={(e) => forgot(e.currentTarget.form)}>Esqueci minha senha</button>
        )}
      </form>
    </div>
  );
}
