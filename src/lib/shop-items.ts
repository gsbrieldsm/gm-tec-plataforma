import { prisma } from "./prisma";
import type { ShopItem } from "@/components/storefront/storefront-view";

/** Produtos da loja, já no formato da vitrine. */
export async function loadShopItems(tenantId: string): Promise<ShopItem[]> {
  const products = await prisma.product.findMany({
    where: { tenantId, active: true },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    select: {
      id: true, name: true, category: true, description: true,
      priceCents: true, hue: true, imageUrl: true, active: true,
      images:   { select: { url: true }, orderBy: { position: "asc" } },
      variants: { select: { size: true, stock: true }, orderBy: { position: "asc" } },
    },
  });

  return products.map(p => {
    // A galeria manda; imageUrl fica como reserva para produto antigo.
    const photos = p.images.map(i => i.url);
    if (!photos.length && p.imageUrl) photos.push(p.imageUrl);

    return {
      id: p.id,
      name: p.name,
      category: p.category,
      description: p.description,
      priceCents: p.priceCents,
      hue: p.hue,
      imageUrl: photos[0] ?? null,
      photos,
      active: p.active,
      sizes: p.variants.map(v => ({ label: v.size, stock: v.stock })),
      stock: p.variants.reduce((a, v) => a + v.stock, 0),
    };
  });
}
