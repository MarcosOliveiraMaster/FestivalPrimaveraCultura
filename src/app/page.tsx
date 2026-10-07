import { getEvents, getHome, getSettings } from "@/lib/data";
import { PageRenderer } from "@/shared/render/PageRenderer";
import { defaultHomeContent } from "@/shared/blocks";
import { Tracker } from "@/components/Tracker";
import { currentTime } from "@/shared/format";
import { getViewer } from "@/lib/supabase-server";

export default async function Home() {
  const [home, settings, events, viewer] = await Promise.all([getHome(), getSettings(), getEvents(), getViewer()]);
  const content = home?.content.sections.length ? home.content : defaultHomeContent();
  return (
    <>
      <PageRenderer content={content} ctx={{ mode: "public", pageId: home?.id, settings, events, now: currentTime(), viewer: { loggedIn: !!viewer.user }, page: home ? { title: home.title, starts_at: null, ends_at: null, location: null, color: home.color } : undefined }} />
      <Tracker pageId={home?.id} />
    </>
  );
}
