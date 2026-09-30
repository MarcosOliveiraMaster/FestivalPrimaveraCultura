"use client";
import { useEffect, useState } from "react";
import type { NavItem } from "@/shared/types";

export function SiteHeader({ name, logo, logoLight, nav, events }: { name: string; logo?: string; logoLight?: string; nav: NavItem[]; events: { slug: string; title: string }[] }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [drop, setDrop] = useState(false);
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
  const items = nav.filter((n) => n.visible);
  const logoSrc = solid ? logo : logoLight || logo;

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${solid ? "bg-[var(--fp-bg)]/95 text-[var(--fp-text)] shadow-sm backdrop-blur" : "bg-transparent text-white"}`}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
        <a href="/" className="flex items-center gap-2" aria-label={name}>
          {logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoSrc} alt={name} className="h-10 w-auto" />
          ) : (
            <span className="fp-heading text-xl">✿ {name}</span>
          )}
        </a>
        <nav className="hidden items-center gap-1 md:flex">
          {items.map((n) =>
            n.auto === "eventos" ? (
              <div key={n.label} className="relative" onMouseEnter={() => setDrop(true)} onMouseLeave={() => setDrop(false)}>
                <a href={n.href} className="flex items-center gap-1 rounded-full px-4 py-2 font-medium hover:bg-black/5" onFocus={() => setDrop(true)}>
                  {n.label} <span aria-hidden className="text-xs">▾</span>
                </a>
                {drop && events.length > 0 && (
                  <div className="absolute right-0 top-full w-64 pt-2">
                    <div className="overflow-hidden rounded-2xl bg-white py-2 text-[var(--fp-text)] shadow-xl ring-1 ring-black/5">
                      {events.map((e) => (
                        <a key={e.slug} href={`/eventos/${e.slug}`} data-track={`menu-evento:${e.slug}`} className="block px-4 py-2 hover:bg-black/5">
                          {e.title}
                        </a>
                      ))}
                      <a href="/eventos" className="mt-1 block border-t border-black/5 px-4 py-2 text-sm font-semibold text-[var(--fp-primary)]">Ver todos →</a>
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
              {n.auto === "eventos" &&
                events.map((e) => (
                  <a key={e.slug} href={`/eventos/${e.slug}`} onClick={() => setOpen(false)} className="block py-2 pl-4 opacity-80">
                    {e.title}
                  </a>
                ))}
            </div>
          ))}
        </nav>
      )}
    </header>
  );
}
