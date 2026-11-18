import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { badRequest } from "@/lib/tenant-scope";
import { storeByHandle } from "@/lib/reseller-store";
import { setResellerCookie } from "@/lib/reseller-auth";

const schema = z.object({
  handle:   z.string().trim().min(1),
  email:    z.string().trim().email("Email inválido.").max(120),
  password: z.string().min(1, "Informe a senha.").max(72),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Dados inválidos.");

  const store = await storeByHandle(parsed.data.handle);
  if (!store) return badRequest("Loja não encontrada.");

  const r = await prisma.reseller.findFirst({
    where: { tenantId: store.id, email: { equals: parsed.data.email.toLowerCase(), mode: "insensitive" } },
    select: { id: true, password: true, status: true, name: true },
  });

  // Mesma mensagem para email inexistente e senha errada: não confirma cadastro.
  const ok = r ? await bcrypt.compare(parsed.data.password, r.password) : false;
  if (!r || !ok) return badRequest("Email ou senha não conferem.");

  if (r.status === "inativo") {
    return badRequest("Seu acesso de lojista está desativado. Fale com a loja.");
  }

  await setResellerCookie(r.id, store.id);
  return NextResponse.json({ ok: true, name: r.name, status: r.status });
}
