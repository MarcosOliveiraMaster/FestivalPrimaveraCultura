import type { SiteSettings } from "@/shared/types";
import { BrandIcon } from "@/shared/render/BrandIcon";

const SOCIAL: [keyof SiteSettings["social"], string][] = [
  ["instagram", "Instagram"],
  ["facebook", "Facebook"],
  ["youtube", "YouTube"],
  ["tiktok", "TikTok"],
  ["whatsapp", "WhatsApp"],
];

export function SiteFooter({ s }: { s: SiteSettings }) {
  const social = SOCIAL.filter(([k]) => s.social[k]);
  return (
    <footer className="bg-[var(--fp-primary)] text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-3 md:px-8">
        <div className="flex flex-col gap-3">
          {s.brand.logo_light_url || s.brand.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.brand.logo_light_url || s.brand.logo_url} alt={s.festival_name} className="h-12 w-auto self-start" />
          ) : (
            <span className="fp-heading flex items-center gap-2 text-2xl">
              <BrandIcon url={s.brand.icon_url} className="h-10" /> {s.festival_name}
            </span>
          )}
          {s.footer.text && <p className="opacity-85">{s.footer.text}</p>}
        </div>
        <div className="flex flex-col gap-1 opacity-90">
          <span className="fp-label !text-white/70">Contato</span>
          {s.footer.email && <a href={`mailto:${s.footer.email}`}>{s.footer.email}</a>}
          {s.footer.phone && <span>{s.footer.phone}</span>}
          {s.footer.address && <span>{s.footer.address}</span>}
          {!s.footer.email && !s.footer.phone && !s.footer.address && <span>Em breve</span>}
        </div>
        <div className="flex flex-col gap-1">
          <span className="fp-label !text-white/70">Redes</span>
          {social.length ? (
            social.map(([k, label]) => (
              <a key={k} href={s.social[k]} target="_blank" rel="noopener noreferrer" data-track={`social:${k}`} className="hover:underline">
                {label}
              </a>
            ))
          ) : (
            <span className="opacity-90">Em breve</span>
          )}
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-5 py-5 text-sm opacity-80 md:px-8">
          <span>© {new Date().getFullYear()} {s.festival_name}</span>
          <a href="/privacidade" className="hover:underline">Privacidade</a>
        </div>
      </div>
    </footer>
  );
}
