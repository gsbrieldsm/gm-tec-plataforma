import { AdminHeader } from "@/components/admin/header";
import { Clock } from "lucide-react";

export default function AmericanasPage() {
  return (
    <>
      <AdminHeader title="Americanas" description="Integração com Americanas Marketplace" />
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-lg font-bold"
          style={{ background: "rgba(239,44,51,0.1)", border: "1px solid rgba(239,44,51,0.2)", color: "#EF2C33" }}
        >AMR</div>
        <div className="text-center">
          <div className="flex items-center gap-2 justify-center mb-2">
            <Clock className="h-4 w-4" style={{ color: "#EF2C33" }} />
            <p className="text-sm font-semibold" style={{ color: "#EF2C33" }}>Em breve</p>
          </div>
          <p className="text-xs max-w-xs" style={{ color: "var(--text-2)" }}>Integração com Americanas Marketplace B2W. Em desenvolvimento.</p>
        </div>
      </div>
    </>
  );
}
