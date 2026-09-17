import { AdminHeader } from "@/components/admin/header";
import { Clock } from "lucide-react";

export default function MagaluPage() {
  return (
    <>
      <AdminHeader title="Magalu" description="Integração com Magazine Luiza" />
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-lg font-bold"
          style={{ background: "rgba(0,134,255,0.1)", border: "1px solid rgba(0,134,255,0.2)", color: "#0086FF" }}
        >MG</div>
        <div className="text-center">
          <div className="flex items-center gap-2 justify-center mb-2">
            <Clock className="h-4 w-4" style={{ color: "#0086FF" }} />
            <p className="text-sm font-semibold" style={{ color: "#0086FF" }}>Em breve</p>
          </div>
          <p className="text-xs max-w-xs" style={{ color: "var(--text-2)" }}>Integração com Magazine Luiza Marketplace API. Em desenvolvimento.</p>
        </div>
      </div>
    </>
  );
}
