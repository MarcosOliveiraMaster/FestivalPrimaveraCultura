"use client";
import { useEffect } from "react";

function send(payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);
  if (navigator.sendBeacon) navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
  else fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } });
}

/** Registra a visita da página e cliques em elementos com data-track. Sem cookies. */
export function Tracker({ pageId }: { pageId?: string }) {
  useEffect(() => {
    const url = new URL(window.location.href);
    const utm = {
      source: url.searchParams.get("utm_source") ?? undefined,
      medium: url.searchParams.get("utm_medium") ?? undefined,
      campaign: url.searchParams.get("utm_campaign") ?? undefined,
    };
    try {
      if (utm.source) sessionStorage.setItem("fp_utm", JSON.stringify(utm));
    } catch {}
    let stored: Partial<typeof utm> = {};
    try {
      stored = JSON.parse(sessionStorage.getItem("fp_utm") || "{}");
    } catch {}
    send({ t: "view", page_id: pageId ?? null, path: url.pathname, referrer: document.referrer || null, utm: utm.source ? utm : stored, w: window.innerWidth });

    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-track]");
      if (!el) return;
      const [kind, ...rest] = (el.dataset.track ?? "").split(":");
      send({ t: "click", page_id: pageId ?? null, path: url.pathname, target: el.dataset.track, label: rest.join(":") || kind });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [pageId]);
  return null;
}
