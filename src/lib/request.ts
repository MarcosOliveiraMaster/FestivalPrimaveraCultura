import { createHash } from "crypto";

export function clientIp(h: Headers) {
  return (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "0.0.0.0").trim();
}

/** Identificador anônimo que muda todo dia (não permite rastrear pessoas). */
export function sessionHash(h: Headers) {
  const day = new Date().toISOString().slice(0, 10);
  const salt = process.env.TRACK_SALT || "festival-da-primavera";
  return createHash("sha256").update(`${clientIp(h)}|${h.get("user-agent") ?? ""}|${day}|${salt}`).digest("hex").slice(0, 32);
}

export function deviceFrom(ua: string | null, width?: number): "mobile" | "tablet" | "desktop" {
  const u = (ua ?? "").toLowerCase();
  if (/ipad|tablet/.test(u) || (width && width >= 700 && width < 1024 && /mobile|android/.test(u))) return "tablet";
  if (/mobi|iphone|android/.test(u)) return "mobile";
  return "desktop";
}

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function str(v: unknown, max: number) {
  if (typeof v !== "string") return null;
  const s = v.trim().slice(0, max);
  return s || null;
}
