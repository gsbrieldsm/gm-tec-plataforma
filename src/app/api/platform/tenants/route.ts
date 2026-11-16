import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/authz";
import { parseSettings } from "@/lib/tenant-settings";

export type PlatformTenant = {
  id: string;
  name: string;
  slug: string;
  handle: string | null;
  suspended: boolean;
  published: boolean;
  products: number;
  integrationsReady: number;
  storeName: string;
  primary: string;
  createdAt: string;
  users: { name: string | null; email: string; role: string }[];
};

export async function GET() {
  if (!(await requireSuperAdmin())) {
    return NextResponse.json({ error: "Acesso restrito ao operador." }, { status: 403 });
  }

  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, slug: true, handle: true, suspended: true,
      settings: true, createdAt: true,
      users: { select: { name: true, email: true, role: true } },
    },
  });

  const rows: PlatformTenant[] = tenants.map(t => {
    const s = parseSettings(t.settings);
    return {
      id: t.id,
      name: t.name,
      slug: t.slug,
      handle: t.handle,
      suspended: t.suspended,
      published: s.store.published,
      products: s.products.length,
      integrationsReady: Object.values(s.integrations).filter(v => v === "pronto").length,
      storeName: s.brand.storeName || t.name,
      primary: s.brand.primary,
      createdAt: t.createdAt.toISOString(),
      users: t.users,
    };
  });

  return NextResponse.json({ tenants: rows });
}

const patchSchema = z.object({
  id: z.string().min(1),
  suspended: z.boolean(),
});

export async function PATCH(req: NextRequest) {
  const session = await requireSuperAdmin();
  if (!session) {
    return NextResponse.json({ error: "Acesso restrito ao operador." }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  // Suspender a própria conta tiraria o operador do ar sem quem o reative.
  if (parsed.data.id === session.user.tenantId) {
    return NextResponse.json({ error: "Você não pode suspender a sua própria loja." }, { status: 400 });
  }

  const t = await prisma.tenant.update({
    where: { id: parsed.data.id },
    data: { suspended: parsed.data.suspended },
    select: { id: true, suspended: true },
  });

  return NextResponse.json(t);
}
