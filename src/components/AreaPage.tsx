import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEvents, getPageBySlug, getSettings } from "@/lib/data";
import { PageRenderer } from "@/shared/render/PageRenderer";
import { Tracker } from "@/components/Tracker";
import { currentTime, formatRange } from "@/shared/format";
import { cleanSrc } from "@/shared/image";
import { getViewer } from "@/lib/supabase-server";
import type { PageKind } from "@/shared/types";
import { withTrainingForm } from "@/shared/blocks";

/** Metadados (SEO) de uma página de área. */
export async function areaMetadata(slug: string, kinds: PageKind[]): Promise<Metadata> {
  const [page, s] = await Promise.all([getPageBySlug(slug, kinds), getSettings()]);
  if (!page) return {};
  const image = cleanSrc(page.seo?.image || page.cover_url || s.brand.og_image_url);
  return {
    title: page.seo?.title || page.title,
    description: page.seo?.description || [formatRange(page.starts_at, page.ends_at), page.location].filter(Boolean).join(" · ") || undefined,
    openGraph: { images: image ? [image] : undefined },
  };
}

/** Página de um evento, cortejo ou capacitação (mesma dinâmica para as três áreas). */
export async function AreaPage({ slug, kinds }: { slug: string; kinds: PageKind[] }) {
  const [page, settings, events, viewer] = await Promise.all([getPageBySlug(slug, kinds), getSettings(), getEvents(), getViewer()]);
  if (!page) notFound();
  const content = page.kind === "capacitacao" ? withTrainingForm(page.content) : page.content;
  const intro = page.content.sections.length === 0;
  return (
    <>
      {intro && (
        <div className="mx-auto max-w-3xl px-5 pt-16">
          <h1 className="fp-heading fp-h1">{page.title}</h1>
          {content.sections.length === 0 && <p className="mt-4 pb-20 opacity-70">Conteúdo em breve.</p>}
        </div>
      )}
      {content.sections.length > 0 && (
        <PageRenderer
          content={content}
          ctx={{ mode: "public", pageId: page.id, settings, events, now: currentTime(), viewer: { loggedIn: !!viewer.user }, page: { title: page.title, starts_at: page.starts_at, ends_at: page.ends_at, location: page.location, color: page.color } }}
        />
      )}
      <Tracker pageId={page.id} />
    </>
  );
}
