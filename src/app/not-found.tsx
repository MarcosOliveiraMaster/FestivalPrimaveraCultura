import { getSettings } from "@/lib/data";
import { BrandIcon } from "@/shared/render/BrandIcon";

export default async function NotFound() {
  const s = await getSettings();
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-4 px-5 text-center">
      <BrandIcon url={s.brand.icon_url} className="h-16" />
      <h1 className="fp-heading fp-h2">Página não encontrada</h1>
      <p className="opacity-70">Essa página ainda não floresceu — ou saiu do ar.</p>
      <a href="/" className="fp-btn fp-btn-primary">Voltar ao início</a>
    </div>
  );
}
