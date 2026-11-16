import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

/**
 * Operador da plataforma: enxerga e administra todas as lojas.
 * É um papel do usuário, não do tenant — o superadmin também tem a loja dele.
 */
export async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "SUPERADMIN") return null;
  return session;
}
