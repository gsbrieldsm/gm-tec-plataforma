import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentTenantId, unauthorized, notFound, badRequest } from "@/lib/tenant-scope";
import { deleteImage } from "@/lib/storage";
import { productSchema, PRODUCT_SELECT as SELECT } from "@/lib/product-schema";

type Params = { params: Promise<{ id: string }> };

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

  const parsed = productSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Dados inválidos.");

  const { variants, images, ...data } = parsed.data;
  const keepVariants = variants.filter(v => v.id).map(v => v.id!);
  const keepImages = images.filter(i => i.id).map(i => i.id!);

  const { product, orphans } = await prisma.$transaction(async tx => {
    // Guarda o caminho das fotos que saíram, para apagar do bucket depois.
    const removed = await tx.productImage.findMany({
      where: { productId: id, ...(keepImages.length ? { id: { notIn: keepImages } } : {}) },
      select: { path: true },
    });

    // Grades removidas na tela saem do banco; as que ficaram são atualizadas.
    await tx.productVariant.deleteMany({
      where: { productId: id, ...(keepVariants.length ? { id: { notIn: keepVariants } } : {}) },
    });
    for (const [i, v] of variants.entries()) {
      const payload = { size: v.size, color: v.color, sku: v.sku, stock: v.stock, position: i };
      if (v.id) await tx.productVariant.update({ where: { id: v.id }, data: payload });
      else await tx.productVariant.create({ data: { ...payload, productId: id } });
    }

    await tx.productImage.deleteMany({
      where: { productId: id, ...(keepImages.length ? { id: { notIn: keepImages } } : {}) },
    });
    for (const [i, im] of images.entries()) {
      if (im.id) await tx.productImage.update({ where: { id: im.id }, data: { position: i } });
      else await tx.productImage.create({ data: { productId: id, url: im.url, path: im.path, position: i } });
    }

    const updated = await tx.product.update({
      where: { id },
      data: { ...data, imageUrl: images[0]?.url ?? null },
      select: SELECT,
    });

    return { product: updated, orphans: removed.map(r => r.path).filter(Boolean) };
  });

  // Fora da transação: arquivo órfão no bucket não deve derrubar o salvamento.
  await Promise.all(orphans.map(deleteImage));

  return NextResponse.json({ product });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const tenantId = await currentTenantId();
  if (!tenantId) return unauthorized();

  const { id } = await params;
  if (!(await ownedBy(tenantId, id))) return notFound();

  const images = await prisma.productImage.findMany({
    where: { productId: id }, select: { path: true },
  });

  await prisma.product.delete({ where: { id } });
  await Promise.all(images.map(i => i.path).filter(Boolean).map(deleteImage));

  return NextResponse.json({ ok: true });
}
