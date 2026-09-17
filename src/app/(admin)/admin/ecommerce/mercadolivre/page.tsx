import { AdminHeader } from "@/components/admin/header";
import { Clock, ExternalLink } from "lucide-react";

export default function MercadoLivrePage() {
  return (
    <>
      <AdminHeader title="Mercado Livre" description="Integração com o maior marketplace da América Latina" />
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
          style={{ background: "rgba(255,230,0,0.1)", border: "1px solid rgba(255,230,0,0.2)", color: "#FFE600" }}
        >ML</div>
        <div className="text-center">
          <div className="flex items-center gap-2 justify-center mb-2">
            <Clock className="h-4 w-4" style={{ color: "#FFE600" }} />
            <p className="text-sm font-semibold" style={{ color: "#FFE600" }}>Em desenvolvimento</p>
          </div>
          <p className="text-xs max-w-xs" style={{ color: "var(--text-2)" }}>
            A integração com Mercado Livre está em desenvolvimento e será a próxima a ser lançada após Shopee.
          </p>
        </div>
        <a href="https://developers.mercadolivre.com.br" target="_blank" rel="noreferrer"
          className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg"
          style={{ background: "rgba(255,230,0,0.08)", color: "#FFE600", border: "1px solid rgba(255,230,0,0.15)" }}
        >
          Ver documentação <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </>
  );
}
