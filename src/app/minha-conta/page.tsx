import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/supabase-server";
import { formatRange, googleCalendarUrl } from "@/shared/format";
import { SignOut } from "@/components/SignOut";

export const metadata: Metadata = { title: "Minha conta", robots: { index: false } };

interface Row {
  id: string;
  attended: boolean;
  certificate_code: string;
  created_at: string;
  pages: { title: string; slug: string; starts_at: string | null; ends_at: string | null; location: string | null; certificate_hours: number | null } | null;
}

export default async function MinhaConta() {
  const { supabase, user } = await getViewer();
  if (!user) redirect("/entrar?next=/minha-conta");
  const { data } = await supabase
    .from("registrations")
    .select("id, attended, certificate_code, created_at, pages(title, slug, starts_at, ends_at, location, certificate_hours)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as unknown as Row[];
  const certs = rows.filter((r) => r.attended && r.pages);

  return (
    <div className="fp-page min-h-[80vh] px-5 pb-20 pt-28">
      <div className="mx-auto flex max-w-4xl flex-col gap-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="fp-label">Área do participante</span>
            <h1 className="fp-heading fp-h2 mt-1">Olá, {user.name.split(" ")[0]}</h1>
            <p className="opacity-70">{user.email}</p>
          </div>
          <SignOut />
        </div>

        <section className="flex flex-col gap-4">
          <h2 className="fp-heading fp-h3">Minhas inscrições</h2>
          {rows.length === 0 ? (
            <div className="fp-card flex flex-col items-start gap-3">
              <p>Você ainda não se inscreveu em nenhum evento.</p>
              <a href="/eventos" className="fp-btn fp-btn-primary">Ver programação</a>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {rows.map((r) => {
                const p = r.pages;
                if (!p) return null;
                const cal = googleCalendarUrl(p.title, p.starts_at, p.ends_at, p.location);
                return (
                  <li key={r.id} className="fp-card flex flex-wrap items-center justify-between gap-4 !p-5">
                    <div className="flex flex-col gap-1">
                      <a href={`/eventos/${p.slug}`} className="fp-heading text-xl hover:underline">{p.title}</a>
                      <span className="text-sm opacity-75">{[formatRange(p.starts_at, p.ends_at) ?? "Data em breve", p.location].filter(Boolean).join(" · ")}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {r.attended ? (
                        <a href={`/certificado/${r.certificate_code}`} className="fp-btn fp-btn-primary">Certificado</a>
                      ) : (
                        <>
                          {cal && <a href={cal} target="_blank" rel="noopener noreferrer" className="fp-btn fp-btn-outline">Google Agenda</a>}
                          <span className="fp-reg-ok !text-sm">Inscrito(a)</span>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="fp-heading fp-h3">Certificados</h2>
          {certs.length === 0 ? (
            <p className="opacity-75">Os certificados aparecem aqui depois que a organização confirmar sua presença no evento.</p>
          ) : (
            <ul className="grid gap-3 @container sm:grid-cols-2">
              {certs.map((r) => (
                <li key={r.id}>
                  <a href={`/certificado/${r.certificate_code}`} className="fp-link-card">
                    <span className="font-semibold">{r.pages!.title}</span>
                    <span className="text-sm opacity-75">{r.pages!.certificate_hours ? `${Number(r.pages!.certificate_hours)}h · ` : ""}Código {r.certificate_code}</span>
                    <span aria-hidden className="fp-link-arrow">→</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
