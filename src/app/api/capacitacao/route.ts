import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { clientIp, str, UUID } from "@/lib/request";
import { isValidCpf } from "@/shared/certificate";
import { AUTO_FORM_ID, formStdFields, pageForms, type Address } from "@/shared/forms";
import { BLOCK_DEFAULTS } from "@/shared/blocks";
import type { PageContent, TrainingFormProps } from "@/shared/types";

const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60 * 1000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 5;
}
const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

/**
 * Inscrição sem login (eventos, cortejos e capacitações). Sempre aberta.
 * Os campos são conferidos com o formulário configurado no editor (o servidor busca o bloco
 * na página publicada): só entram respostas das perguntas existentes.
 */
export async function POST(req: NextRequest) {
  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return bad("Dados inválidos.");
  }
  if (b.website) return NextResponse.json({ ok: true }); // armadilha anti-robô
  if (limited(clientIp(req.headers))) return bad("Muitos envios. Tente novamente em alguns minutos.", 429);

  const pageId = typeof b.page_id === "string" && UUID.test(b.page_id) ? b.page_id : null;
  if (!pageId) return bad("Página inválida.");
  const db = supabase();
  const { data: page } = await db.from("pages").select("id, kind, content").eq("id", pageId).in("kind", ["evento", "cortejo", "capacitacao"]).maybeSingle();
  if (!page) return bad("Página não encontrada.");

  // Formulário usado: o bloco da página com esse id (ou o automático das capacitações).
  const formId = typeof b.form_id === "string" ? b.form_id.slice(0, 64) : "";
  const forms = pageForms(page.content as PageContent);
  const form = forms.find((f) => f.id === formId) ?? (formId === AUTO_FORM_ID || !forms.length ? { id: AUTO_FORM_ID, props: BLOCK_DEFAULTS.training() as TrainingFormProps } : forms[0]);
  const std = formStdFields(form.props);

  const name = str(b.name, 200);
  const email = str(b.email, 320)?.toLowerCase() ?? null;
  if (!name || name.length < 2) return bad("Informe seu nome completo.");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad("Informe um e-mail válido.");

  const phone = std.phone.on ? str(b.phone, 40) : null;
  if (std.phone.on && std.phone.required && (!phone || phone.replace(/\D/g, "").length < 10)) return bad("Informe um telefone com DDD.");
  const cpf = std.cpf.on && typeof b.cpf === "string" ? b.cpf.replace(/\D/g, "") : "";
  if (std.cpf.on && std.cpf.required && !cpf) return bad("Informe o CPF.");
  if (cpf && !isValidCpf(cpf)) return bad("CPF inválido.");

  let address: Address | null = null;
  if (std.address.on && b.address && typeof b.address === "object") {
    const a = b.address as Record<string, unknown>;
    address = {
      cep: str(a.cep, 9)?.replace(/[^\d-]/g, "") ?? "",
      rua: str(a.rua, 200) ?? "",
      numero: str(a.numero, 20) ?? "",
      complemento: str(a.complemento, 120) ?? "",
      bairro: str(a.bairro, 120) ?? "",
      cidade: str(a.cidade, 120) ?? "",
      uf: (str(a.uf, 2) ?? "").toUpperCase(),
    };
    if (!Object.values(address).some(Boolean)) address = null;
  }
  if (std.address.on && std.address.required && (!address?.rua || !address.cidade || !address.uf)) return bad("Informe o endereço (rua, cidade e UF).");

  // Campos extras: só as perguntas do formulário, com o tipo e as opções esperadas.
  const raw = (b.answers && typeof b.answers === "object" ? b.answers : {}) as Record<string, unknown>;
  const answers: Record<string, string | string[]> = {};
  for (const c of form.props.custom ?? []) {
    const v = raw[c.key];
    if (c.type === "checkbox") {
      const list = (Array.isArray(v) ? v : []).filter((x): x is string => typeof x === "string" && (c.options ?? []).includes(x));
      if (list.length) answers[c.key] = list;
    } else if (c.type === "select") {
      if (typeof v === "string" && (c.options ?? []).includes(v)) answers[c.key] = v;
    } else {
      const s = str(v, c.type === "textarea" ? 2000 : 300);
      if (s && c.type === "number" && Number.isNaN(Number(s.replace(",", ".")))) return bad(`“${c.label}” precisa ser um número.`);
      if (s && c.type === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(s)) return bad(`“${c.label}” precisa ser uma data.`);
      if (s) answers[c.key] = s;
    }
    if (c.required && !answers[c.key]) return bad(`Preencha “${c.label}”.`);
  }
  if (b.consent !== true) return bad("É preciso aceitar o uso dos dados (LGPD).");

  const { data: id, error } = await db.rpc("register_training", {
    p_page: pageId, p_name: name, p_email: email, p_phone: phone, p_cpf: cpf || null,
    p_form: form.id, p_answers: answers, p_address: address,
  });
  if (error) {
    if (error.code === "P0001" || error.code === "P0002") return bad(error.message);
    console.error("register_training", error);
    return bad("Não foi possível concluir a inscrição agora.", 500);
  }
  // Confirmação por e-mail (a função só envia uma vez por inscrição).
  const sent = await db.functions.invoke("confirmar-capacitacao", { body: { registration_id: id } });
  if (sent.error) console.error("confirmar-capacitacao", sent.error);
  return NextResponse.json({ ok: true, emailSent: !sent.error });
}
