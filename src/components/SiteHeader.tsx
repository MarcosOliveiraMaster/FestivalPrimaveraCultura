"use client";
import { useEffect, useState } from "react";
import type { NavItem } from "@/shared/types";
import { BrandIcon } from "@/shared/render/BrandIcon";
import { FramedImage } from "@/shared/render/FramedImage";

export function SiteHeader({ name, logo, logoLight, icon, nav, menus, account }: { name: string; logo?: string; logoLight?: string; icon?: string; nav: NavItem[]; menus: Record<string, { slug: string; title: string; href: string }[]>; account?: string | null }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [drop, setDrop] = useState<string | null>(null);
  const [transparent, setTransparent] = useState(false);
  useEffect(() => {
    // Transparente só quando a página começa com uma seção de fundo escuro
    const on = () => {
      const first = document.querySelector("main > .fp-page > section");
      setTransparent(!!first?.classList.contains("fp-on-dark"));
      setScrolled(window.scrollY > 40);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const solid = !transparent || scrolled || open;
  // Áreas automáticas sem nenhuma página publicada não aparecem no menu.
  const items = nav.filter((n) => n.visible && (!n.auto || n.auto === "eventos" || (menus[n.auto]?.length ?? 0) > 0));
  const logoSrc = solid ? logo : logoLight || logo;

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${solid ? "bg-[var(--fp-bg)]/95 text-[var(--fp-text)] shadow-sm backdrop-blur" : "bg-transparent text-white"}`}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
        <a href="/" className="flex items-center gap-2" aria-label={name}>
          {logoSrc ? (
            <span className="inline-flex h-10 overflow-hidden">
              <FramedImage url={logoSrc} alt={name} loading="eager" className="h-full w-auto max-w-none object-contain" />
            </span>
          ) : (
            <span className="fp-heading flex items-center gap-2 text-xl">
              <BrandIcon url={icon} className="h-8" /> {name}
            </span>
          )}
        </a>
        <nav className="hidden items-center gap-1 md:flex">
          {items.map((n) =>
            n.auto ? (
              <div key={n.label} className="relative" onMouseEnter={() => setDrop(n.auto!)} onMouseLeave={() => setDrop(null)}>
                <a href={n.href} className="flex items-center gap-1 rounded-full px-4 py-2 font-medium hover:bg-black/5" onFocus={() => setDrop(n.auto!)}>
                  {n.label} <span aria-hidden className="text-xs">▾</span>
                </a>
                {drop === n.auto && (menus[n.auto]?.length ?? 0) > 0 && (
                  <div className="absolute right-0 top-full w-64 pt-2">
                    <div className="overflow-hidden rounded-2xl bg-white py-2 text-[var(--fp-text)] shadow-xl ring-1 ring-black/5">
                      {menus[n.auto].map((e) => (
                        <a key={e.href} href={e.href} data-track={`menu-${n.auto}:${e.slug}`} className="block px-4 py-2 hover:bg-black/5">
                          {e.title}
                        </a>
                      ))}
                      <a href={n.href} className="mt-1 block border-t border-black/5 px-4 py-2 text-sm font-semibold text-[var(--fp-primary)]">Ver todos →</a>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <a key={n.label} href={n.href} className="rounded-full px-4 py-2 font-medium hover:bg-black/5">
                {n.label}
              </a>
            ),
          )}
          <a href={account ? "/minha-conta" : "/entrar"} data-track="menu:conta" className={`ml-2 rounded-full px-4 py-2 font-semibold ${solid ? "bg-[var(--fp-primary)] text-white" : "bg-white/15 ring-1 ring-white/40"}`}>
            {account ? `Olá, ${account}` : "Entrar"}
          </a>
        </nav>
        <button type="button" className="md:hidden" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>
      {open && (
        <nav className="border-t border-black/5 bg-[var(--fp-bg)] px-5 pb-6 md:hidden">
          {items.map((n) => (
            <div key={n.label}>
              <a href={n.href} onClick={() => setOpen(false)} className="block py-3 text-lg font-medium">{n.label}</a>
              {n.auto &&
                (menus[n.auto] ?? []).map((e) => (
                  <a key={e.href} href={e.href} onClick={() => setOpen(false)} className="block py-2 pl-4 opacity-80">
                    {e.title}
                  </a>
                ))}
            </div>
          ))}
          <a href={account ? "/minha-conta" : "/entrar"} onClick={() => setOpen(false)} className="mt-2 block py-3 text-lg font-semibold text-[var(--fp-primary)]">
            {account ? "Minha conta" : "Entrar / criar conta"}
          </a>
        </nav>
      )}
    </header>
  );
}
