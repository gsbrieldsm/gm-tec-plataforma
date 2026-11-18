import { createHmac, timingSafeEqual, randomUUID } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

/**
 * Sessão do lojista na loja pública.
 *
 * É separada do NextAuth de propósito: quem entra aqui é cliente de atacado de
 * UMA loja, não operador do painel. Misturar os dois daria a um lojista um
 * caminho para dentro do admin.
 *
 * O status é relido do banco a cada requisição — então desativar um lojista
 * faz efeito na hora, sem esperar o cookie expirar.
 */

const COOKIE = "lojista";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 dias

function secret() {
  const s = process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("NEXTAUTH_SECRET ausente.");
  return s;
}

function sign(data: string) {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

type Payload = { rid: string; tid: string; exp: number };

export function makeToken(resellerId: string, tenantId: string) {
  const body: Payload = { rid: resellerId, tid: tenantId, exp: Date.now() + MAX_AGE * 1000 };
  const data = Buffer.from(JSON.stringify(body)).toString("base64url");
  return `${data}.${sign(data)}`;
}

function readToken(token: string): Payload | null {
  const [data, mac] = token.split(".");
  if (!data || !mac) return null;
  if (!safeEqual(mac, sign(data))) return null;
  try {
    const p = JSON.parse(Buffer.from(data, "base64url").toString()) as Payload;
    if (!p.rid || !p.tid || typeof p.exp !== "number" || p.exp < Date.now()) return null;
    return p;
  } catch {
    return null;
  }
}

export type ResellerSession = {
  id: string;
  name: string;
  email: string;
  company: string;
  status: string;
  /** Só vale desconto quando o status é "ativo". */
  discountPct: number;
};

/**
 * Lojista da sessão, já conferido contra a loja em que ele está navegando.
 * Passa o tenantId da loja: um cookie de outra loja não vale aqui.
 */
export async function currentReseller(tenantId: string): Promise<ResellerSession | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;

  const payload = readToken(token);
  if (!payload || payload.tid !== tenantId) return null;

  const r = await prisma.reseller.findFirst({
    where: { id: payload.rid, tenantId },
    select: { id: true, name: true, email: true, company: true, status: true, discountPct: true },
  });
  if (!r) return null;

  return { ...r, discountPct: r.status === "ativo" ? r.discountPct : 0 };
}

export async function setResellerCookie(resellerId: string, tenantId: string) {
  (await cookies()).set(COOKIE, makeToken(resellerId, tenantId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearResellerCookie() {
  (await cookies()).delete(COOKIE);
}

/** Preço já com o desconto do lojista aplicado. */
export function withDiscount(priceCents: number, discountPct: number) {
  if (discountPct <= 0) return priceCents;
  return Math.round((priceCents * (100 - discountPct)) / 100);
}

export { randomUUID };
