import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseSettings } from "@/lib/tenant-settings";
import { currentReseller } from "@/lib/reseller-auth";
import { ResellerGate } from "@/components/storefront/reseller-gate";

type Params = { params: Promise<{ handle: string }> };

async function load(handle: string) {
  const t = await prisma.tenant.findUnique({
    where: { handle: handle.toLowerCase() },
    select: { id: true, name: true, settings: true, suspended: true },
  });
  if (!t || t.suspended) return null;
  const settings = parseSettings(t.settings);
  if (!settings.store.published) return null;
  return { id: t.id, fallbackName: t.name, settings };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { handle } = await params;
  const store = await load(handle);
  if (!store) return { title: "Loja não encontrada" };
  const name = store.settings.brand.storeName || store.fallbackName;
  return { title: `Área do lojista — ${name}`, robots: { index: false, follow: false } };
}

export default async function LojistaPage({ params }: Params) {
  const { handle } = await params;
  const store = await load(handle);
  if (!store) notFound();

  const reseller = await currentReseller(store.id);
  // Já aprovado não tem nada a fazer aqui: volta para a vitrine com preço de atacado.
  if (reseller?.status === "ativo") redirect(`/loja/${handle.toLowerCase()}`);

  return (
    <ResellerGate
      handle={handle.toLowerCase()}
      brand={store.settings.brand}
      storeName={store.settings.brand.storeName || store.fallbackName}
      pending={reseller?.status === "pendente" ? reseller.name : null}
    />
  );
}
