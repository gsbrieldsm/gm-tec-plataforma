import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminProviders } from "@/components/admin/providers";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/demo");

  return (
    <AdminProviders>
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
        <AdminSidebar />
        <main style={{ flex: 1, marginLeft: 240, overflowY: "auto" }}>
          <div style={{ padding: "32px 40px" }}>
            {children}
          </div>
        </main>
      </div>
    </AdminProviders>
  );
}
