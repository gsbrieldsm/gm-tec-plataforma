import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "./auth";

/**
 * Toda consulta de dados do lojista passa por aqui. O tenantId vem da sessão,
 * nunca do corpo da requisição — é o que impede uma loja de ler a de outra.
 */
export async function currentTenantId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.tenantId ?? null;
}

export function unauthorized() {
  return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
}

export function notFound() {
  return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}
