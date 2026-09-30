import type { Metadata } from "next";
import "./globals.css";
import { getNavEvents, getSettings } from "@/lib/data";
import { googleFontsHref, themeCss } from "@/shared/theme";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: { default: s.festival_name, template: `%s · ${s.festival_name}` },
    description: s.tagline ?? "Música, arte e cultura para celebrar a primavera.",
    icons: s.brand.favicon_url || s.brand.icon_url ? { icon: (s.brand.favicon_url || s.brand.icon_url)!, apple: (s.brand.favicon_url || s.brand.icon_url)! } : undefined,
    openGraph: { siteName: s.festival_name, images: s.brand.og_image_url ? [s.brand.og_image_url] : undefined, locale: "pt_BR", type: "website" },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [s, navEvents] = await Promise.all([getSettings(), getNavEvents()]);
  const fonts = googleFontsHref(s.theme);
  return (
    <html lang="pt-BR">
      <head>
        {fonts && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
            <link rel="stylesheet" href={fonts} />
          </>
        )}
        <style dangerouslySetInnerHTML={{ __html: themeCss(s.theme) }} />
      </head>
      <body className="min-h-screen antialiased">
        <SiteHeader name={s.festival_name} logo={s.brand.logo_url} logoLight={s.brand.logo_light_url} icon={s.brand.icon_url} nav={s.nav} events={navEvents} />
        <main>{children}</main>
        <SiteFooter s={s} />
      </body>
    </html>
  );
}
