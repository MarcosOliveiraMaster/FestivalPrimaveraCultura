import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { clientIp, str, UUID } from "@/lib/request";

const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60 * 1000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 5;
}

export async function POST(req: NextRequest) {
  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  if (b.website) return NextResponse.json({ ok: true }); // armadilha anti-robô
  if (limited(clientIp(req.headers))) return NextResponse.json({ error: "Muitos envios. Tente novamente em alguns minutos." }, { status: 429 });

  const name = str(b.name, 200);
  const email = str(b.email, 320)?.toLowerCase() ?? null;
  if (!name) return NextResponse.json({ error: "Informe seu nome." }, { status: 400 });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
  if (b.consent !== true) return NextResponse.json({ error: "É preciso aceitar o uso dos dados (LGPD)." }, { status: 400 });

  const utmIn = (b.utm ?? {}) as Record<string, unknown>;
  const utm = Object.fromEntries(["source", "medium", "campaign"].map((k) => [k, str(utmIn[k], 100)]).filter(([, v]) => v));
  const interests = Array.isArray(b.interests) ? b.interests.map((i) => str(i, 120)).filter(Boolean).slice(0, 30) : [];

  const { error } = await supabase()
    .from("form_submissions")
    .insert({
      page_id: typeof b.page_id === "string" && UUID.test(b.page_id) ? b.page_id : null,
      name,
      email,
      phone: str(b.phone, 40),
      city: str(b.city, 120),
      interests,
      heard_from: str(b.heard_from, 200),
      message: str(b.message, 5000),
      consent: true,
      newsletter: b.newsletter === true,
      utm,
      referrer: str(b.referrer, 1000),
    });
  if (error) {
    console.error("form_submissions insert", error);
    return NextResponse.json({ error: "Não foi possível enviar agora. Tente novamente." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
