import { cache } from "react";
import { supabase } from "./supabase";
import { mergeSettings } from "@/shared/theme";
import { normalizeContent } from "@/shared/blocks";
import type { EventSummary, PageContent, SiteSettings } from "@/shared/types";

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const { data } = await supabase().from("site_settings").select("*").eq("id", 1).maybeSingle();
  return mergeSettings(data);
});

export const getEvents = cache(async (): Promise<EventSummary[]> => {
  const { data } = await supabase()
    .from("pages")
    .select("id, slug, title, category, starts_at, ends_at, location, cover_url, show_in_nav, sort_order")
    .eq("kind", "evento")
    .order("sort_order", { ascending: true })
    .order("starts_at", { ascending: true, nullsFirst: false });
  return (data ?? []) as EventSummary[];
});

export const getNavEvents = cache(async () => {
  const { data } = await supabase()
    .from("pages")
    .select("slug, title")
    .eq("kind", "evento")
    .eq("show_in_nav", true)
    .order("sort_order", { ascending: true });
  return (data ?? []) as { slug: string; title: string }[];
});

export interface PublicPage {
  id: string;
  kind: "home" | "evento" | "institucional";
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

export const getPageBySlug = cache(async (slug: string): Promise<PublicPage | null> => {
  const { data } = await supabase().from("pages").select(FIELDS).eq("slug", slug).neq("kind", "home").maybeSingle();
  return data ? { ...data, content: normalizeContent(data.content) } : null;
});
