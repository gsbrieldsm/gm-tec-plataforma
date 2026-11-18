import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentTenantId, unauthorized, badRequest } from "@/lib/tenant-scope";
import { productSchema, PRODUCT_SELECT as SELECT } from "@/lib/product-schema";

export async function GET() {
  const tenantId = await currentTenantId();
  if (!tenantId) return unauthorized();

  const products = await prisma.product.findMany({
    where: { tenantId },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    select: SELECT,
  });

  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const tenantId = await currentTenantId();
  if (!tenantId) return unauthorized();

  const parsed = productSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Dados inválidos.");

  const { variants, images, ...data } = parsed.data;

  const product = await prisma.product.create({
    data: {
      ...data,
      tenantId,
      // A capa espelha a primeira foto: a listagem e a vitrine antiga leem daqui.
      imageUrl: images[0]?.url ?? null,
      variants: { create: variants.map((v, i) => ({ ...v, id: undefined, position: i })) },
      images: { create: images.map((im, i) => ({ url: im.url, path: im.path, position: i })) },
    },
    select: SELECT,
  });

  return NextResponse.json({ product }, { status: 201 });
}
