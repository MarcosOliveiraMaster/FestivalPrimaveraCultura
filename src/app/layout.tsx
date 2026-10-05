import type { Metadata } from "next";
import "./globals.css";
import { getNavEvents, getSettings } from "@/lib/data";
import { googleFontsHref, themeCss } from "@/shared/theme";
import { cleanSrc } from "@/shared/image";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getViewer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const favicon = cleanSrc(s.brand.favicon_url || s.brand.icon_url);
  return {
    title: { default: s.festival_name, template: `%s · ${s.festival_name}` },
    description: s.tagline ?? "Música, arte e cultura para celebrar a primavera.",
    icons: favicon ? { icon: favicon, apple: favicon } : undefined,
    openGraph: { siteName: s.festival_name, images: s.brand.og_image_url ? [cleanSrc(s.brand.og_image_url)] : undefined, locale: "pt_BR", type: "website" },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [s, navEvents, viewer] = await Promise.all([getSettings(), getNavEvents(), getViewer()]);
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
        <SiteHeader name={s.festival_name} logo={s.brand.logo_url} logoLight={s.brand.logo_light_url} icon={s.brand.icon_url} nav={s.nav} events={navEvents} account={viewer.user ? viewer.user.name.split(" ")[0] : null} />
        <main>{children}</main>
        <SiteFooter s={s} />
      </body>
    </html>
  );
}
