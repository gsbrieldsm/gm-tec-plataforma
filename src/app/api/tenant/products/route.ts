import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { currentTenantId, unauthorized, badRequest } from "@/lib/tenant-scope";

export type ApiVariant = {
  id: string; size: string; color: string; sku: string; stock: number; position: number;
};
export type ApiProduct = {
  id: string; name: string; category: string; sku: string; description: string;
  priceCents: number; hue: string; imageUrl: string | null; active: boolean; position: number;
  variants: ApiVariant[];
};

const variantSchema = z.object({
  id: z.string().optional(),
  size:  z.string().trim().max(20).default(""),
  color: z.string().trim().max(30).default(""),
  sku:   z.string().trim().max(40).default(""),
  stock: z.number().int().min(0).max(100_000).default(0),
});

const productSchema = z.object({
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

  const { variants, ...data } = parsed.data;
  const product = await prisma.product.create({
    data: {
      ...data,
      tenantId,
      variants: { create: variants.map((v, i) => ({ ...v, id: undefined, position: i })) },
    },
    select: SELECT,
  });

  return NextResponse.json({ product }, { status: 201 });
}
