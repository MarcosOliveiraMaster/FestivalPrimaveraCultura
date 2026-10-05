import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEvents, getPageBySlug, getSettings } from "@/lib/data";
import { PageRenderer } from "@/shared/render/PageRenderer";
import { Tracker } from "@/components/Tracker";
import { currentTime, formatRange } from "@/shared/format";
import { cleanSrc } from "@/shared/image";
import { getViewer } from "@/lib/supabase-server";

export async function generateMetadata({ params }: PageProps<"/eventos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [page, s] = await Promise.all([getPageBySlug(slug), getSettings()]);
  if (!page) return {};
  const image = cleanSrc(page.seo?.image || page.cover_url || s.brand.og_image_url);
  return {
    title: page.seo?.title || page.title,
    description: page.seo?.description || [formatRange(page.starts_at, page.ends_at), page.location].filter(Boolean).join(" · ") || undefined,
    openGraph: { images: image ? [image] : undefined },
  };
}

export default async function EventPage({ params }: PageProps<"/eventos/[slug]">) {
  const { slug } = await params;
  const [page, settings, events, viewer] = await Promise.all([getPageBySlug(slug), getSettings(), getEvents(), getViewer()]);
  if (!page) notFound();
  return (
    <>
      {page.content.sections.length === 0 ? (
        <div className="mx-auto max-w-3xl px-5 pb-20 pt-16">
          <h1 className="fp-heading fp-h1">{page.title}</h1>
          <p className="mt-4 opacity-70">Conteúdo em breve.</p>
        </div>
      ) : (
        <PageRenderer
          content={page.content}
          ctx={{ mode: "public", pageId: page.id, settings, events, now: currentTime(), viewer: { loggedIn: !!viewer.user }, page: { title: page.title, starts_at: page.starts_at, ends_at: page.ends_at, location: page.location, color: page.color } }}
        />
      )}
      <Tracker pageId={page.id} />
    </>
  );
}
