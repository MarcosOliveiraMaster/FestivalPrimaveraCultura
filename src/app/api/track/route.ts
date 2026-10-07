import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { deviceFrom, sessionHash, str, UUID } from "@/lib/request";

const BOT = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|preview|lighthouse|headless/i;

export async function POST(req: NextRequest) {
  const ua = req.headers.get("user-agent");
  if (!ua || BOT.test(ua)) return new NextResponse(null, { status: 204 });
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(await req.text());
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const pageId = typeof body.page_id === "string" && UUID.test(body.page_id) ? body.page_id : null;
  const path = str(body.path, 500) ?? "/";
  const session_hash = sessionHash(req.headers);
  const db = supabase();

  if (body.t === "view") {
    const utm = (body.utm ?? {}) as Record<string, unknown>;
    let referrer = str(body.referrer, 1000);
    try {
      if (referrer && new URL(referrer).host === req.nextUrl.host) referrer = null;
    } catch {
      referrer = null;
    }
    await db.from("page_views").insert({
      page_id: pageId,
      path,
      referrer,
      utm_source: str(utm.source, 100),
      utm_medium: str(utm.medium, 100),
      utm_campaign: str(utm.campaign, 100),
      device: deviceFrom(ua, typeof body.w === "number" ? body.w : undefined),
      session_hash,
    });
  } else if (body.t === "click") {
    const target = str(body.target, 500);
    if (target) await db.from("click_events").insert({ page_id: pageId, target, label: str(body.label, 200), path, session_hash });
  }
  return new NextResponse(null, { status: 204 });
}
