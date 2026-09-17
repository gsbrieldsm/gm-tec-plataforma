import { AdminHeader } from "@/components/admin/header";
import { Clock } from "lucide-react";

export default function AmazonPage() {
  return (
    <>
      <AdminHeader title="Amazon" description="Integração com Amazon Seller Central" />
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-lg font-bold"
          style={{ background: "rgba(255,153,0,0.1)", border: "1px solid rgba(255,153,0,0.2)", color: "#FF9900" }}
        >AMZ</div>
        <div className="text-center">
          <div className="flex items-center gap-2 justify-center mb-2">
            <Clock className="h-4 w-4" style={{ color: "#FF9900" }} />
            <p className="text-sm font-semibold" style={{ color: "#FF9900" }}>Em breve</p>
          </div>
          <p className="text-xs max-w-xs" style={{ color: "var(--text-2)" }}>Integração com Amazon via Selling Partner API (SP-API). Em desenvolvimento.</p>
        </div>
      </div>
    </>
  );
}
