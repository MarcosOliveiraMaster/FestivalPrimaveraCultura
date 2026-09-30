import type { Metadata } from "next";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Privacidade" };

export default async function Privacy() {
  const s = await getSettings();
  return (
    <div className="mx-auto max-w-3xl px-5 pb-20 pt-16">
      <h1 className="fp-heading fp-h2">Política de privacidade</h1>
      <div className="fp-prose mt-6 whitespace-pre-line">
        {s.privacy_text ||
          `O ${s.festival_name} usa os dados enviados pelo formulário de interesse (nome, e-mail e demais campos preenchidos) apenas para entrar em contato sobre o festival. Os dados não são vendidos nem compartilhados com terceiros. As estatísticas de visita são anônimas e não usam cookies. Para pedir a exclusão dos seus dados, fale com a organização pelos contatos do rodapé.`}
      </div>
    </div>
  );
}
