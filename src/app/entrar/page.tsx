import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { getViewer } from "@/lib/supabase-server";
import { safeNext } from "@/lib/request";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

export default async function Entrar({ searchParams }: PageProps<"/entrar">) {
  const sp = await searchParams;
  const next = safeNext(typeof sp.next === "string" ? sp.next : null);
  const { user } = await getViewer();
  if (user) redirect(next);
  return (
    <div className="fp-page min-h-[80vh] px-5 pb-20 pt-28">
      <div className="mx-auto mb-8 max-w-md text-center">
        <span className="fp-label">Área do participante</span>
        <h1 className="fp-heading fp-h2 mt-2">Entre para se inscrever</h1>
        <p className="mt-2 opacity-75">Com a conta você faz inscrições, recebe confirmações por e-mail, vê conteúdos exclusivos e emite seus certificados.</p>
      </div>
      <LoginForm next={next} initialError={typeof sp.erro === "string" ? sp.erro : undefined} />
    </div>
  );
}
