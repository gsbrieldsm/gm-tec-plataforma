import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { currentTenantId, unauthorized, notFound, badRequest } from "@/lib/tenant-scope";

type Params = { params: Promise<{ id: string }> };

const variantSchema = z.object({
  id: z.string().optional(),
  size:  z.string().trim().max(20).default(""),
  color: z.string().trim().max(30).default(""),
  sku:   z.string().trim().max(40).default(""),
  stock: z.number().int().min(0).max(100_000).default(0),
});

const patchSchema = z.object({
  name:        z.string().trim().min(1, "Dê um nome ao produto").max(80),
  category:    z.string().trim().max(40).default(""),
  sku:         z.string().trim().max(40).default(""),
  description: z.string().trim().max(600).default(""),
  priceCents:  z.number().int().min(0).max(100_000_000),
  hue:         z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#7c3fed"),
  imageUrl:    z.string().max(600).nullable().default(null),
  active:      z.boolean().default(true),
  position:    z.number().int().min(0).max(10_000).default(0),
  variants:    z.array(variantSchema).min(1, "Cadastre ao menos uma grade").max(40),
});

const SELECT = {
  id: true, name: true, category: true, sku: true, description: true,
  priceCents: true, hue: true, imageUrl: true, active: true, position: true,
  variants: {
    select: { id: true, size: true, color: true, sku: true, stock: true, position: true },
    orderBy: { position: "asc" },
  },
} as const;

/** Confere que o produto é mesmo da loja de quem pediu. */
async function ownedBy(tenantId: string, id: string) {
  const p = await prisma.product.findFirst({ where: { id, tenantId }, select: { id: true } });
  return !!p;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const tenantId = await currentTenantId();
  if (!tenantId) return unauthorized();

  const { id } = await params;
  if (!(await ownedBy(tenantId, id))) return notFound();

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Dados inválidos.");

  const { variants, ...data } = parsed.data;
  const keep = variants.filter(v => v.id).map(v => v.id!);

  const product = await prisma.$transaction(async tx => {
    // Grades removidas na tela saem do banco; as que ficaram são atualizadas.
    await tx.productVariant.deleteMany({
      where: { productId: id, ...(keep.length ? { id: { notIn: keep } } : {}) },
    });

    for (const [i, v] of variants.entries()) {
      const payload = { size: v.size, color: v.color, sku: v.sku, stock: v.stock, position: i };
      if (v.id) {
        await tx.productVariant.update({ where: { id: v.id }, data: payload });
      } else {
        await tx.productVariant.create({ data: { ...payload, productId: id } });
      }
    }

    return tx.product.update({ where: { id }, data, select: SELECT });
  });

  return NextResponse.json({ product });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const tenantId = await currentTenantId();
  if (!tenantId) return unauthorized();

  const { id } = await params;
  if (!(await ownedBy(tenantId, id))) return notFound();

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
