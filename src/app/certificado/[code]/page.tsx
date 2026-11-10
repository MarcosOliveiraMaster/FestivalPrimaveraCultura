import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { certValues, normalizeTemplate, templateFonts, type CertTemplate } from "@/shared/certificate";
import { googleFontsHref, resolveTheme } from "@/shared/theme";
import type { Theme } from "@/shared/types";
import { CertificatePage } from "./CertificatePage";

export const metadata: Metadata = { title: "Certificado", robots: { index: false } };

interface CertData {
  template: CertTemplate | null;
  festival: string;
  theme: Theme | null;
  name: string;
  cpf: string | null;
  email: string | null;
  phone: string | null;
  code: string;
  title: string;
  starts_at: string | null;
  ends_at: string | null;
  location: string | null;
  hours: number | null;
}

/** Certificado (modelo editável do ADM) com validação pública pelo código e QR code. */
export default async function Certificado({ params }: PageProps<"/certificado/[code]">) {
  const { code } = await params;
  if (!/^[A-Z0-9]{6,20}$/i.test(code)) notFound();
  const { data } = await supabase().rpc("certificate_data", { p_code: code });
  const d = data as CertData | null;
  if (!d) notFound();
  const theme = d.theme ?? {};
  const template = normalizeTemplate(d.template, resolveTheme(theme).primary);
  const values = certValues(
    { name: d.name, cpf: d.cpf, email: d.email, phone: d.phone, code: d.code },
    { title: d.title, starts_at: d.starts_at, ends_at: d.ends_at, location: d.location, hours: d.hours },
    d.festival,
  );
  const fonts = googleFontsHref(theme, templateFonts(template));
  return (
    <>
      {fonts && <link rel="stylesheet" href={fonts} crossOrigin="anonymous" />}
      <CertificatePage template={template} values={values} theme={theme} code={d.code} name={d.name} />
    </>
  );
}
