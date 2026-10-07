import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getSettings } from "@/lib/data";
import { formatDate } from "@/shared/format";
import { BrandIcon } from "@/shared/render/BrandIcon";
import { PrintButton } from "@/components/PrintButton";

export const metadata: Metadata = { title: "Certificado", robots: { index: false } };

interface Cert { full_name: string; event_title: string; starts_at: string | null; ends_at: string | null; location: string | null; hours: number | null }

/** Certificado imprimível. A própria página serve de validação pública pelo código. */
export default async function Certificado({ params }: PageProps<"/certificado/[code]">) {
  const { code } = await params;
  if (!/^[A-Z0-9]{6,20}$/i.test(code)) notFound();
  const [{ data }, s] = await Promise.all([
    supabase().rpc("verify_certificate", { p_code: code }).maybeSingle<Cert>(),
    getSettings(),
  ]);
  if (!data) notFound();
  const hours = data.hours ? Number(data.hours) : null;
  return (
    <div className="fp-cert-wrap fp-page px-4 pb-16 pt-24">
      <div className="fp-no-print mx-auto mb-6 flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <span className="fp-reg-ok">✓ Certificado válido · código {code.toUpperCase()}</span>
        <PrintButton />
      </div>
      <article className="fp-cert">
        <div className="fp-cert-wave fp-cert-wave-top" aria-hidden />
        <div className="fp-cert-wave" aria-hidden />
        <BrandIcon url={s.brand.icon_url} className="h-10" />
        <div className="fp-label">{s.festival_name}</div>
        <h1 className="fp-heading fp-cert-title">Certificado</h1>
        <p className="text-lg">Certificamos que</p>
        <p className="fp-heading fp-cert-name">{data.full_name}</p>
        <p className="fp-cert-text">
          participou de <strong>{data.event_title}</strong>
          {data.starts_at ? <>, realizado em {formatDate(data.starts_at)}</> : null}
          {data.location ? <>, {data.location}</> : null}
          {hours ? <>, com carga horária de <strong>{hours} hora{hours > 1 ? "s" : ""}</strong></> : null}.
        </p>
        <div className="fp-cert-foot">
          <span>Validação: {s.festival_name} · código <strong>{code.toUpperCase()}</strong></span>
          <span className="fp-cert-sign">Coordenação do {s.festival_name}</span>
        </div>
      </article>
    </div>
  );
}
