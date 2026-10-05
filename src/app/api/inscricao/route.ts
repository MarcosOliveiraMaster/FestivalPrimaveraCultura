import { NextRequest, NextResponse } from "next/server";
import { getViewer } from "@/lib/supabase-server";
import { UUID } from "@/lib/request";

export const dynamic = "force-dynamic";

async function pageIdFrom(req: NextRequest) {
  if (req.method === "GET") return req.nextUrl.searchParams.get("page");
  try {
    const b = await req.json();
    return typeof b.page_id === "string" ? b.page_id : null;
  } catch {
    return null;
  }
}

/** Situação da inscrição do visitante no evento: vagas, se está logado e se já se inscreveu. */
export async function GET(req: NextRequest) {
  const pageId = await pageIdFrom(req);
  if (!pageId || !UUID.test(pageId)) return NextResponse.json({ error: "Evento inválido." }, { status: 400 });
  const { supabase, user } = await getViewer();
  const [{ data: st }, mine] = await Promise.all([
    supabase.rpc("registration_status", { p_page: pageId }).maybeSingle<{ registered: number; capacity: number | null; open: boolean }>(),
    user
      ? supabase.from("registrations").select("attended, certificate_code").eq("page_id", pageId).eq("user_id", user.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  return NextResponse.json({
    loggedIn: !!user,
    open: st?.open ?? false,
    registered: st?.registered ?? 0,
    capacity: st?.capacity ?? null,
    mine: mine.data ?? null,
  });
}

/** Inscreve o participante logado. Nome, e-mail e vagas são conferidos no banco (gatilho). */
export async function POST(req: NextRequest) {
  const pageId = await pageIdFrom(req);
  if (!pageId || !UUID.test(pageId)) return NextResponse.json({ error: "Evento inválido." }, { status: 400 });
  const { supabase, user } = await getViewer();
  if (!user) return NextResponse.json({ error: "Faça login para se inscrever." }, { status: 401 });

  const { data, error } = await supabase
    .from("registrations")
    .insert({ page_id: pageId, user_id: user.id, full_name: user.name, email: user.email })
    .select("id")
    .single();
  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Você já está inscrito(a) neste evento." }, { status: 409 });
    if (error.code === "P0001" || error.code === "P0002") return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("registrations insert", error);
    return NextResponse.json({ error: "Não foi possível concluir a inscrição agora." }, { status: 500 });
  }

  // E-mail de confirmação (Edge Function "confirmar-inscricao"). Falha no envio não desfaz a inscrição.
  const sent = await supabase.functions.invoke("confirmar-inscricao", { body: { registration_id: data.id } });
  if (sent.error) console.error("confirmar-inscricao", sent.error);
  return NextResponse.json({ ok: true, emailSent: !sent.error });
}

/** Cancela a própria inscrição (antes da presença ser confirmada). */
export async function DELETE(req: NextRequest) {
  const pageId = await pageIdFrom(req);
  if (!pageId || !UUID.test(pageId)) return NextResponse.json({ error: "Evento inválido." }, { status: 400 });
  const { supabase, user } = await getViewer();
  if (!user) return NextResponse.json({ error: "Faça login." }, { status: 401 });
  const { error } = await supabase.from("registrations").delete().eq("page_id", pageId).eq("user_id", user.id).eq("attended", false);
  if (error) return NextResponse.json({ error: "Não foi possível cancelar agora." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
