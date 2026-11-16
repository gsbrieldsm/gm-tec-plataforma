import { prisma } from "./prisma";
import type { ShopItem } from "@/components/storefront/storefront-view";

/** Produtos da loja, já no formato da vitrine. */
export async function loadShopItems(tenantId: string): Promise<ShopItem[]> {
  const products = await prisma.product.findMany({
    where: { tenantId, active: true },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    select: {
      id: true, name: true, category: true, priceCents: true, hue: true,
      imageUrl: true, active: true,
      variants: { select: { size: true, stock: true }, orderBy: { position: "asc" } },
    },
  });

  return products.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    priceCents: p.priceCents,
    hue: p.hue,
    imageUrl: p.imageUrl,
    active: p.active,
    sizes: p.variants.map(v => ({ label: v.size, stock: v.stock })),
    stock: p.variants.reduce((a, v) => a + v.stock, 0),
  }));
}
