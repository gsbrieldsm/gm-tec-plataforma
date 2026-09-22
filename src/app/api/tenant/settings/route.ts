import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleSchema, parseSettings, settingsSchema } from "@/lib/tenant-settings";

async function currentTenantId() {
  const session = await getServerSession(authOptions);
  return session?.user?.tenantId ?? null;
}

function payload(t: { name: string; handle: string | null; settings: unknown }) {
  return { name: t.name, handle: t.handle, settings: parseSettings(t.settings) };
}

export async function GET() {
  const tenantId = await currentTenantId();
  if (!tenantId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { name: true, handle: true, settings: true },
  });
  if (!tenant) return NextResponse.json({ error: "Loja não encontrada." }, { status: 404 });

  return NextResponse.json(payload(tenant));
}

const bodySchema = z.object({
  handle: z.union([z.literal(""), handleSchema]).nullable(),
  settings: settingsSchema,
});

export async function PUT(req: NextRequest) {
  const tenantId = await currentTenantId();
  if (!tenantId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  const handle = parsed.data.handle || null;
  const settings = parsed.data.settings;

  if (settings.store.published && !handle) {
    return NextResponse.json({ error: "Defina o endereço da loja antes de publicar." }, { status: 400 });
  }

  try {
    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: { handle, settings: settings as Prisma.InputJsonValue },
      select: { name: true, handle: true, settings: true },
    });
    return NextResponse.json(payload(tenant));
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "Esse endereço já está em uso por outra loja." }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro ao salvar." }, { status: 500 });
  }
}
