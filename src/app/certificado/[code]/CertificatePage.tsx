"use client";
import { useEffect, useRef, useState } from "react";
import type { Theme } from "@/shared/types";
import { certFileName, type CertTemplate } from "@/shared/certificate";
import { CertificateView } from "@/shared/render/CertificateView";
import { certificatePdf, downloadBlob, qrDataUrl } from "@/shared/certificatePdf";

export function CertificatePage({ template, values, theme, code, name }: { template: CertTemplate; values: Record<string, string>; theme: Theme; code: string; name: string }) {
  const [qr, setQr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const node = useRef<HTMLDivElement>(null);
  const portrait = template.orientation === "portrait";

  useEffect(() => {
    if (template.qr.enabled) qrDataUrl(`${window.location.origin}/certificado/${code}`).then(setQr, () => setQr(null));
  }, [code, template.qr.enabled]);

  async function download() {
    if (!node.current) return;
    setBusy(true);
    setError(null);
    try {
      downloadBlob(await certificatePdf(node.current, template.orientation), certFileName(name));
    } catch {
      setError("Não foi possível gerar o PDF. Use “Imprimir” e escolha “Salvar como PDF”.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fp-cert-wrap fp-page px-4 pb-16 pt-24">
      <style>{`@media print { @page { size: A4 ${portrait ? "portrait" : "landscape"}; margin: 0; } .fp-certv-print { width: ${portrait ? "210mm" : "297mm"} !important; max-width: none !important; box-shadow: none !important; } }`}</style>
      <div className="fp-no-print mx-auto mb-6 flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <span className="fp-reg-ok">✓ Certificado válido · código {code.toUpperCase()}</span>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="fp-btn fp-btn-primary" disabled={busy} onClick={download}>{busy ? "Gerando PDF…" : "Baixar PDF"}</button>
          <button type="button" className="fp-btn fp-btn-outline" onClick={() => window.print()}>Imprimir</button>
        </div>
      </div>
      {error && <p className="fp-no-print mx-auto mb-4 max-w-5xl text-sm font-semibold text-red-700">{error}</p>}
      <div className="fp-certv-print mx-auto shadow-2xl" style={{ maxWidth: portrait ? "210mm" : "297mm" }}>
        <CertificateView rootRef={node} template={template} values={values} qr={qr} theme={theme} />
      </div>
    </div>
  );
}
