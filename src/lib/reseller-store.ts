import { prisma } from "./prisma";
import { parseSettings } from "./tenant-settings";

/** Resolve a loja pelo endereço público, só se ela estiver de fato no ar. */
export async function storeByHandle(handle: string) {
  const h = handle.trim().toLowerCase();
  if (!h) return null;

  const t = await prisma.tenant.findUnique({
    where: { handle: h },
    select: { id: true, name: true, settings: true, suspended: true },
  });
  if (!t || t.suspended) return null;

  const settings = parseSettings(t.settings);
  return { id: t.id, name: settings.brand.storeName || t.name, published: settings.store.published };
}
