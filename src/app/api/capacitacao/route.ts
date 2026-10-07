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

/** Inscrição em capacitação sem login. Vagas e inscrições abertas são conferidas no banco. */
export async function POST(req: NextRequest) {
  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  if (b.website) return NextResponse.json({ ok: true }); // armadilha anti-robô
  if (limited(clientIp(req.headers))) return NextResponse.json({ error: "Muitos envios. Tente novamente em alguns minutos." }, { status: 429 });

  const pageId = typeof b.page_id === "string" && UUID.test(b.page_id) ? b.page_id : null;
  const name = str(b.name, 200);
  const email = str(b.email, 320)?.toLowerCase() ?? null;
  const phone = str(b.phone, 40);
  if (!pageId) return NextResponse.json({ error: "Capacitação inválida." }, { status: 400 });
  if (!name || name.length < 2) return NextResponse.json({ error: "Informe seu nome." }, { status: 400 });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
  if (!phone || phone.replace(/\D/g, "").length < 10) return NextResponse.json({ error: "Informe um telefone com DDD." }, { status: 400 });
  if (b.consent !== true) return NextResponse.json({ error: "É preciso aceitar o uso dos dados (LGPD)." }, { status: 400 });

  const db = supabase();
  const { data: id, error } = await db.rpc("register_training", { p_page: pageId, p_name: name, p_email: email, p_phone: phone });
  if (error) {
    if (error.code === "P0001" || error.code === "P0002") return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("register_training", error);
    return NextResponse.json({ error: "Não foi possível concluir a inscrição agora." }, { status: 500 });
  }
  const sent = await db.functions.invoke("confirmar-capacitacao", { body: { registration_id: id } });
  if (sent.error) console.error("confirmar-capacitacao", sent.error);
  return NextResponse.json({ ok: true, emailSent: !sent.error });
}
