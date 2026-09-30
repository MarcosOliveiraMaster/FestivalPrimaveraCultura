import { getEvents, getHome, getSettings } from "@/lib/data";
import { PageRenderer } from "@/shared/render/PageRenderer";
import { defaultHomeContent } from "@/shared/blocks";
import { Tracker } from "@/components/Tracker";
import { currentTime } from "@/shared/format";

export default async function Home() {
  const [home, settings, events] = await Promise.all([getHome(), getSettings(), getEvents()]);
  const content = home?.content.sections.length ? home.content : defaultHomeContent();
  return (
    <>
      <PageRenderer content={content} ctx={{ mode: "public", pageId: home?.id, settings, events, now: currentTime() }} />
      <Tracker pageId={home?.id} />
    </>
  );
}
