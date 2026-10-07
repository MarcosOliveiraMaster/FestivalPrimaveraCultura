import { getEvents, getSettings } from "@/lib/data";
import { AREAS } from "@/shared/areas";
import type { AreaKind } from "@/shared/types";
import { EventCard } from "@/shared/render/BlockView";
import { Tracker } from "@/components/Tracker";
import { BrandIcon } from "@/shared/render/BrandIcon";

/** Listagem de uma área (Eventos, Cortejos, Capacitações), com filtro por categoria. */
export async function AreaListing({ kind, categoria }: { kind: AreaKind; categoria?: string | string[] }) {
  const area = AREAS[kind];
  const base = `/${area.path}`;
  const [events, s] = await Promise.all([getEvents(kind), getSettings()]);
  const cats = [...new Set(events.map((e) => e.category).filter(Boolean))] as string[];
  const active = typeof categoria === "string" ? categoria : null;
  const list = active ? events.filter((e) => e.category === active) : events;
  return (
    <div className="@container fp-page">
      <section className="fp-on-dark px-5 pb-10 pt-32 text-white md:px-8" style={{ background: "linear-gradient(135deg, var(--fp-primary), var(--fp-accent))" }}>
        <div className="mx-auto max-w-6xl">
          <span className="fp-label !text-white/80">{s.festival_name}</span>
          <h1 className="fp-heading fp-h1 mt-2">{area.label}</h1>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 py-12 md:px-8">
        {cats.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <a href={base} className={`rounded-full border px-4 py-1.5 text-sm ${!active ? "border-[var(--fp-primary)] bg-[var(--fp-primary)] text-white" : "border-black/15"}`}>Todos</a>
            {cats.map((c) => (
              <a key={c} href={`${base}?categoria=${encodeURIComponent(c)}`} className={`rounded-full border px-4 py-1.5 text-sm ${active === c ? "border-[var(--fp-primary)] bg-[var(--fp-primary)] text-white" : "border-black/15"}`}>
                {c}
              </a>
            ))}
          </div>
        )}
        {list.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center text-lg opacity-70">
            <BrandIcon url={s.brand.icon_url} className="h-14" />
            <p>{area.empty}</p>
          </div>
        ) : (
          <div className="grid gap-6 @xl:grid-cols-2 @4xl:grid-cols-3">
            {list.map((e) => (
              <EventCard key={e.id} e={e} fallback={s.brand.event_cover_url} icon={s.brand.icon_url} />
            ))}
          </div>
        )}
      </section>
      <Tracker />
    </div>
  );
}
