import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MOCK_PRODUCTS } from "@/lib/catalog";
import { parseSettings } from "@/lib/tenant-settings";
import { StorefrontView } from "@/components/storefront/storefront-view";

type Params = { params: Promise<{ handle: string }> };

const loadStore = cache(async (handle: string) => {
  const tenant = await prisma.tenant.findUnique({
    where: { handle: handle.toLowerCase() },
    select: { id: true, name: true, settings: true },
  });
  if (!tenant) return null;
  return { ...tenant, settings: parseSettings(tenant.settings) };
});

/** Loja publicada é pública; rascunho só aparece para o próprio dono logado. */
async function resolveStore(handle: string) {
  const store = await loadStore(handle);
  if (!store) return null;
  if (store.settings.store.published) return { store, draft: false };

  const session = await getServerSession(authOptions);
  if (session?.user?.tenantId === store.id) return { store, draft: true };
  return null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { handle } = await params;
  const resolved = await resolveStore(handle);
  if (!resolved) return { title: "Loja não encontrada" };
  const { brand } = resolved.store.settings;
  const name = brand.storeName || resolved.store.name;
  return {
    title: name,
    description: brand.tagline || `Conheça a coleção da ${name}.`,
    robots: resolved.draft ? { index: false, follow: false } : undefined,
  };
}

export default async function LojaPage({ params }: Params) {
  const { handle } = await params;
  const resolved = await resolveStore(handle);
  if (!resolved) notFound();

  const { store, draft } = resolved;
  return (
    <StorefrontView
      brand={store.settings.brand}
      store={store.settings.store}
      fallbackName={store.name}
      products={MOCK_PRODUCTS}
      draft={draft}
    />
  );
}
