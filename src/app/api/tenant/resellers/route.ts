import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { currentTenantId, unauthorized, notFound, badRequest } from "@/lib/tenant-scope";

const SELECT = {
  id: true, name: true, email: true, phone: true, company: true, document: true,
  city: true, status: true, discountPct: true, notes: true, createdAt: true,
} as const;

const patchSchema = z.object({
  id:          z.string().min(1),
  status:      z.enum(["pendente", "ativo", "inativo"]).optional(),
  discountPct: z.number().int().min(0).max(90).optional(),
  notes:       z.string().trim().max(400).optional(),
});

export async function GET() {
  const tenantId = await currentTenantId();
  if (!tenantId) return unauthorized();

  const resellers = await prisma.reseller.findMany({
    where: { tenantId },
    // Pendentes primeiro: é o que exige ação de quem abriu a tela.
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    select: SELECT,
  });

  return NextResponse.json({ resellers });
}

export async function PATCH(req: NextRequest) {
  const tenantId = await currentTenantId();
  if (!tenantId) return unauthorized();

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Dados inválidos.");

  const { id, ...data } = parsed.data;
  // Confere a dona antes de escrever: id vindo do corpo nunca basta.
  const own = await prisma.reseller.findFirst({ where: { id, tenantId }, select: { id: true } });
  if (!own) return notFound();

  const reseller = await prisma.reseller.update({ where: { id }, data, select: SELECT });
  return NextResponse.json({ reseller });
}

export async function DELETE(req: NextRequest) {
  const tenantId = await currentTenantId();
  if (!tenantId) return unauthorized();

  const id = new URL(req.url).searchParams.get("id") ?? "";
  const own = await prisma.reseller.findFirst({ where: { id, tenantId }, select: { id: true } });
  if (!own) return notFound();

  await prisma.reseller.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
