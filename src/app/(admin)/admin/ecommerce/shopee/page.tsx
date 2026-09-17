"use client";

import { useState } from "react";
import { AdminHeader } from "@/components/admin/header";
import {
  CheckCircle2, XCircle, Link2, RefreshCw, Package, ShoppingCart,
  TrendingUp, ExternalLink, Copy, Info,
} from "lucide-react";

const mockStats = {
  products: 0,
  orders: 0,
  revenue: 0,
  connected: false,
};

const steps = [
  { n: 1, title: "Crie uma conta de vendedor", desc: "Acesse shopee.com.br e crie sua loja, caso ainda não tenha.", done: true },
  { n: 2, title: "Registre um app no Open Platform", desc: "Acesse open.shopee.com → Meu Apps → Criar App. Selecione o tipo 'Loja' e copie o Partner ID e Partner Key.", done: false },
  { n: 3, title: "Adicione as credenciais", desc: "No painel do servidor (Vercel), adicione SHOPEE_PARTNER_ID e SHOPEE_PARTNER_KEY como variáveis de ambiente.", done: false },
  { n: 4, title: "Conecte sua loja", desc: "Clique no botão abaixo — você será redirecionado para autorizar o acesso à sua loja Shopee.", done: false },
];

export default function ShopeePage() {
  const [copied, setCopied] = useState("");

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  }

  return (
    <>
      <AdminHeader
        title="Shopee"
        description="Gerencie sua loja Shopee diretamente daqui"
      />

      {/* Status banner */}
      <div className="flex items-center gap-4 p-4 rounded-xl mb-8"
        style={{
          background: mockStats.connected ? "rgba(52,211,153,0.07)" : "var(--accent-bg)",
          border: `1px solid ${mockStats.connected ? "rgba(52,211,153,0.2)" : "var(--border-hi)"}`,
        }}
      >
        {mockStats.connected
          ? <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: "#34d399" }} />
          : <XCircle     className="h-5 w-5 shrink-0" style={{ color: "#6366f1" }} />
        }
        <div className="flex-1">
          <p className="text-sm font-semibold" style={{ color: mockStats.connected ? "#059669" : "var(--accent)" }}>
            {mockStats.connected ? "Loja Shopee conectada" : "Ainda não conectado"}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-2)" }}>
            {mockStats.connected
              ? "Sincronizando pedidos e produtos automaticamente."
              : "Siga os passos abaixo para conectar sua loja Shopee."}
          </p>
        </div>
        {mockStats.connected && (
          <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
            style={{ background: "rgba(52,211,153,0.12)", color: "#34d399" }}
          >
            <RefreshCw className="h-3.5 w-3.5" /> Sincronizar agora
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Setup steps */}
        <div className="lg:col-span-2 space-y-3">
          <p className="text-sm font-semibold mb-4" style={{ color: "var(--text-1)" }}>Como conectar</p>

          {steps.map((step) => (
            <div key={step.n} className="flex gap-4 p-4 rounded-xl"
              style={{
                background: "var(--surface)",
                border: step.done
                  ? "1px solid rgba(52,211,153,0.25)"
                  : "1px solid var(--border)",
              }}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                style={{
                  background: step.done ? "rgba(52,211,153,0.10)" : "var(--accent-bg)",
                  color: step.done ? "#059669" : "var(--accent)",
                  border: `1px solid ${step.done ? "rgba(52,211,153,0.3)" : "var(--border-hi)"}`,
                }}
              >
                {step.done ? <CheckCircle2 className="h-4 w-4" /> : step.n}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: "var(--text-1)" }}>{step.title}</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-2)" }}>{step.desc}</p>

                {step.n === 2 && (
                  <a href="https://open.shopee.com" target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs mt-2"
                    style={{ color: "#EE4D2D" }}
                  >
                    Abrir Shopee Open Platform <ExternalLink className="h-3 w-3" />
                  </a>
                )}

                {step.n === 3 && (
                  <div className="mt-3 space-y-2">
                    {[
                      { key: "SHOPEE_PARTNER_ID",  val: "seu_partner_id_aqui" },
                      { key: "SHOPEE_PARTNER_KEY", val: "sua_partner_key_aqui" },
                    ].map(({ key, val }) => (
                      <div key={key} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                        style={{ background: "var(--surface-3)", border: "1px solid var(--border)" }}
                      >
                        <code className="flex-1 text-[11px]" style={{ color: "var(--cyan)" }}>{key}</code>
                        <code className="text-[11px]" style={{ color: "var(--text-2)" }}>{val}</code>
                        <button onClick={() => copy(key, key)}
                          className="transition-colors"
                          style={{ color: "var(--text-3)" }}
                        >
                          {copied === key
                            ? <CheckCircle2 className="h-3 w-3 text-green-400" />
                            : <Copy className="h-3 w-3" />
                          }
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Connect button */}
          <div className="p-4 rounded-xl text-center"
            style={{ background: "var(--surface)", border: "1px solid rgba(238,77,45,0.2)" }}
          >
            <p className="text-xs mb-3" style={{ color: "var(--text-2)" }}>
              Após configurar as variáveis de ambiente no Vercel, clique abaixo:
            </p>
            <button
              onClick={() => { window.location.href = "/api/shopee/connect"; }}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
              style={{
                background: "linear-gradient(135deg,#EE4D2D,#d63f20)",
                boxShadow: "0 4px 20px rgba(238,77,45,0.3)",
              }}
            >
              <Link2 className="h-4 w-4" />
              Conectar loja Shopee
            </button>
          </div>
        </div>

        {/* Stats + info */}
        <div className="space-y-4">
          <p className="text-sm font-semibold mb-0" style={{ color: "var(--text-1)" }}>Visão geral</p>

          {[
            { label: "Produtos publicados", value: mockStats.products, icon: Package,     color: "#EE4D2D" },
            { label: "Pedidos recebidos",   value: mockStats.orders,   icon: ShoppingCart, color: "#d97706" },
            { label: "Receita (R$)",        value: `R$ ${mockStats.revenue.toFixed(2)}`, icon: TrendingUp, color: "#059669" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="p-4 rounded-xl"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${color}15` }}
                >
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <div>
                  <p className="text-lg font-bold" style={{ color: "var(--text-1)" }}>{value}</p>
                  <p className="text-xs" style={{ color: "var(--text-2)" }}>{label}</p>
                </div>
              </div>
            </div>
          ))}

          <div className="p-4 rounded-xl"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "var(--accent)" }} />
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: "var(--text-1)" }}>O que será sincronizado</p>
                <ul className="text-xs space-y-1" style={{ color: "var(--text-2)" }}>
                  <li>→ Publicar produtos desta plataforma na Shopee</li>
                  <li>→ Puxar pedidos da Shopee automaticamente</li>
                  <li>→ Atualizar estoque em tempo real</li>
                  <li>→ Sincronizar preços e descrições</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
