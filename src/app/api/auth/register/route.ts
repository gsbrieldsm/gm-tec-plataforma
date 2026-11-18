import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { handleSchema, suggestHandle } from "@/lib/tenant-settings";

const schema = z.object({
  name: z.string().trim().min(2, "Nome muito curto"),
  // Nome da loja é separado do nome da pessoa: é ele que aparece na vitrine.
  storeName: z.string().trim().max(60).default(""),
  email: z.string().trim().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

/** Primeiro endereço livre a partir do nome da loja. Vazio se nada servir. */
async function freeHandle(storeName: string) {
  const base = suggestHandle(storeName);
  if (!handleSchema.safeParse(base).success) return null;

  for (let i = 0; i < 20; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`.slice(0, 40);
    if (!handleSchema.safeParse(candidate).success) continue;
    const taken = await prisma.tenant.findUnique({ where: { handle: candidate }, select: { id: true } });
    if (!taken) return candidate;
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.parse(body);
    const name = parsed.name.trim();
    const email = parsed.email.trim().toLowerCase();
    // Sem nome de loja, cai no nome da pessoa — mas a tela pede os dois.
    const storeName = parsed.storeName || name;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Este email já está cadastrado." },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(parsed.password, 12);
    const handle = await freeHandle(storeName);

    await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: storeName,
          // O slug identifica a conta; o email serve só como valor inicial único.
          slug: email,
          handle,
          settings: { brand: { storeName } },
        },
      });
      await tx.user.create({
        data: {
          name,
          email,
          password: hashed,
          role: "ADMIN",
          tenantId: tenant.id,
        },
      });
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
