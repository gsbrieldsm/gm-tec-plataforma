import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { badRequest } from "@/lib/tenant-scope";
import { storeByHandle } from "@/lib/reseller-store";

const schema = z.object({
  handle:   z.string().trim().min(1),
  name:     z.string().trim().min(2, "Diga seu nome completo.").max(80),
  email:    z.string().trim().email("Email inválido.").max(120),
  phone:    z.string().trim().min(8, "Informe um telefone com DDD.").max(20),
  company:  z.string().trim().max(80).default(""),
  document: z.string().trim().max(20).default(""),
  city:     z.string().trim().max(80).default(""),
  password: z.string().min(6, "A senha precisa de no mínimo 6 caracteres.").max(72),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Dados inválidos.");

  const { handle, password, ...data } = parsed.data;
  const store = await storeByHandle(handle);
  if (!store) return badRequest("Loja não encontrada.");

  const email = data.email.toLowerCase();
  const existing = await prisma.reseller.findFirst({
    where: { tenantId: store.id, email: { equals: email, mode: "insensitive" } },
    select: { id: true },
  });
  if (existing) return badRequest("Este email já tem cadastro nesta loja.");

  // Entra como pendente: quem libera o preço de atacado é a loja, não o cadastro.
  await prisma.reseller.create({
    data: {
      ...data,
      email,
      tenantId: store.id,
      password: await bcrypt.hash(password, 12),
      status: "pendente",
    },
  });

  return NextResponse.json({ ok: true, status: "pendente" }, { status: 201 });
}
