"use client";

export function PrintButton() {
  return (
    <button type="button" className="fp-btn fp-btn-primary" onClick={() => window.print()}>
      Imprimir / salvar em PDF
    </button>
  );
}
