import { cache } from "react";
import { supabase } from "./supabase";
import { mergeSettings } from "@/shared/theme";
import { normalizeContent } from "@/shared/blocks";
import type { AreaKind, EventSummary, PageContent, PageKind, SiteSettings } from "@/shared/types";
import { AREA_KINDS, AREAS } from "@/shared/areas";

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const { data } = await supabase().from("site_settings").select("*").eq("id", 1).maybeSingle();
  return mergeSettings(data);
});

export const getEvents = cache(async (kind: AreaKind = "evento"): Promise<EventSummary[]> => {
  const { data } = await supabase()
    .from("pages")
    .select("id, kind, slug, title, category, starts_at, ends_at, location, cover_url, show_in_nav, sort_order")
    .eq("kind", kind)
    .order("sort_order", { ascending: true })
    .order("starts_at", { ascending: true, nullsFirst: false });
  return (data ?? []) as EventSummary[];
});

/** Itens dos submenus automáticos: { eventos: [...], cortejos: [...], capacitacoes: [...] }. */
export const getNavPages = cache(async () => {
  const { data } = await supabase()
    .from("pages")
    .select("slug, title, kind")
    .in("kind", AREA_KINDS)
    .eq("show_in_nav", true)
    .order("sort_order", { ascending: true });
  const out: Record<string, { slug: string; title: string; href: string }[]> = {};
  for (const k of AREA_KINDS) out[AREAS[k].nav] = [];
  for (const p of (data ?? []) as { slug: string; title: string; kind: AreaKind }[]) {
    out[AREAS[p.kind].nav].push({ slug: p.slug, title: p.title, href: `/${AREAS[p.kind].path}/${p.slug}` });
  }
  return out;
});

export interface PublicPage {
  id: string;
  kind: PageKind;
  slug: string;
  title: string;
  category: string | null;
  starts_at: string | null;
  ends_at: string | null;
  location: string | null;
  cover_url: string | null;
  seo: { title?: string; description?: string; image?: string };
  /** Cor própria da página (substitui a cor principal do tema). */
  color: string | null;
  content: PageContent;
}

const FIELDS = "id, kind, slug, title, category, starts_at, ends_at, location, cover_url, seo, color, content";

export const getHome = cache(async (): Promise<PublicPage | null> => {
  const { data } = await supabase().from("pages").select(FIELDS).eq("kind", "home").maybeSingle();
  return data ? { ...data, content: normalizeContent(data.content) } : null;
});

export const getPageBySlug = cache(async (slug: string, kinds: PageKind[] = ["evento", "institucional"]): Promise<PublicPage | null> => {
  const { data } = await supabase().from("pages").select(FIELDS).eq("slug", slug).in("kind", kinds).maybeSingle();
  return data ? { ...data, content: normalizeContent(data.content) } : null;
});
