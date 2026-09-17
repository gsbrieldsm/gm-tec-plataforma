import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.parse(body);
    const name = parsed.name.trim();
    const email = parsed.email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Este email já está cadastrado." },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(parsed.password, 12);

    await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: { name, slug: email },
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
