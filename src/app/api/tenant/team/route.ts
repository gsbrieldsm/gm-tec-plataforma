import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unauthorized, notFound, badRequest } from "@/lib/tenant-scope";

const SELECT = { id: true, name: true, email: true, role: true, createdAt: true } as const;

const createSchema = z.object({
  name:     z.string().trim().min(2, "Diga o nome da pessoa.").max(80),
  email:    z.string().trim().email("Email inválido.").max(120),
  password: z.string().min(6, "A senha precisa de no mínimo 6 caracteres.").max(72),
  role:     z.enum(["ADMIN", "STAFF"]).default("STAFF"),
});

/** Quem está pedindo, e de qual loja. STAFF não administra equipe. */
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const u = session?.user;
  if (!u?.tenantId) return null;
  if (u.role !== "ADMIN" && u.role !== "SUPERADMIN") return null;
  return { tenantId: u.tenantId, userId: u.id };
}

export async function GET() {
  const me = await requireAdmin();
  if (!me) return unauthorized();

  const members = await prisma.user.findMany({
    where: { tenantId: me.tenantId },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: SELECT,
  });

  return NextResponse.json({ members, meId: me.userId });
}

export async function POST(req: NextRequest) {
  const me = await requireAdmin();
  if (!me) return unauthorized();

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Dados inválidos.");

  const email = parsed.data.email.toLowerCase();
  // Email é único no sistema inteiro: já usado em outra loja também barra aqui.
  const taken = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (taken) return badRequest("Este email já está cadastrado no sistema.");

  const member = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      password: await bcrypt.hash(parsed.data.password, 12),
      role: parsed.data.role,
      tenantId: me.tenantId,
    },
    select: SELECT,
  });

  return NextResponse.json({ member }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const me = await requireAdmin();
  if (!me) return unauthorized();

  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (id === me.userId) return badRequest("Você não pode remover a sua própria conta.");

  const target = await prisma.user.findFirst({
    where: { id, tenantId: me.tenantId }, select: { id: true, role: true },
  });
  if (!target) return notFound();

  // Loja sem nenhum admin fica sem quem configure nada.
  if (target.role === "ADMIN") {
    const admins = await prisma.user.count({ where: { tenantId: me.tenantId, role: "ADMIN" } });
    if (admins <= 1) return badRequest("Esta é a única pessoa admin da loja. Promova outra antes.");
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
