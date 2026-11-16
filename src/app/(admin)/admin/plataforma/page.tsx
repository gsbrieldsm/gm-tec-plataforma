import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/authz";
import { PlatformConsole } from "./console";

export const metadata = { title: "Plataforma · GM & Co Tec" };

export default async function PlataformaPage() {
  if (!(await requireSuperAdmin())) redirect("/admin");
  return <PlatformConsole />;
}
