"use client";

import { useEffect, useState } from "react";
import {
  Search, Store, Check, Ban, Clock, Loader2, Percent, Phone, Mail,
  MapPin, Trash2, BadgeCheck,
} from "lucide-react";
import { apiUrl } from "@/lib/base-path";

const UI   = "var(--font-space), var(--font-geist-sans), sans-serif";
const MONO = "var(--font-space-mono), var(--font-geist-mono), monospace";

type Reseller = {
  id: string; name: string; email: string; phone: string; company: string;
  document: string; city: string; status: "pendente" | "ativo" | "inativo";
  discountPct: number; notes: string; createdAt: string;
};

const STATUS = {
  pendente: { label: "Aguardando", color: "#d97706", icon: Clock },
  ativo:    { label: "Ativo",      color: "#059669", icon: BadgeCheck },
  inativo:  { label: "Desativado", color: "#64748b", icon: Ban },
} as const;

const FILTERS = ["Aguardando", "Ativos", "Desativados", "Todos"] as const;
type Filter = (typeof FILTERS)[number];

export default function LojistasPage() {
  const [list, setList] = useState<Reseller[] | null>(null);
  const [filter, setFilter] = useState<Filter>("Aguardando");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      const r = await fetch(apiUrl("/api/tenant/resellers"));
      const d = await r.json();
      setList(d.resellers ?? []);
    } catch {
      setList([]);
      setError("Não consegui carregar os lojistas.");
    }
  }
  useEffect(() => { void load(); }, []);

  async function patch(id: string, data: Partial<Pick<Reseller, "status" | "discountPct" | "notes">>) {
    setBusy(id);
    setError("");
    try {
      const r = await fetch(apiUrl("/api/tenant/resellers"), {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Erro ao salvar.");
      setList(l => (l ?? []).map(x => (x.id === id ? d.reseller : x)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setBusy(null);
    }
  }

  async function remove(r: Reseller) {
    if (!confirm(`Apagar o cadastro de ${r.name}? Isso não volta.`)) return;
    setBusy(r.id);
    try {
      const res = await fetch(apiUrl(`/api/tenant/resellers?id=${encodeURIComponent(r.id)}`), { method: "DELETE" });
      if (!res.ok) throw new Error();
      setList(l => (l ?? []).filter(x => x.id !== r.id));
    } catch {
      setError("Não consegui apagar.");
    } finally {
      setBusy(null);
    }
  }

  const all = list ?? [];
  // Lista de lojista é pequena; contar direto é mais claro que memorizar.
  const counts = {
    pendente: all.filter(r => r.status === "pendente").length,
    ativo:    all.filter(r => r.status === "ativo").length,
    inativo:  all.filter(r => r.status === "inativo").length,
  };

  const shown = all.filter(r => {
    const byFilter =
      filter === "Todos" ? true :
      filter === "Aguardando" ? r.status === "pendente" :
      filter === "Ativos" ? r.status === "ativo" : r.status === "inativo";
    if (!byFilter) return false;
    const needle = q.trim().toLowerCase();
    if (!needle) return true;
    return [r.name, r.email, r.company, r.city, r.document]
      .some(v => v.toLowerCase().includes(needle));
  });

  return (
    <>
      <style>{`
        .lj-spin { animation: lj-spin 1s linear infinite; }
        @keyframes lj-spin { to { transform: rotate(360deg); } }
        .lj-list { display: flex; flex-direction: column; gap: 10px; }
        .lj-row { display: grid; grid-template-columns: 1fr auto; gap: 14px; align-items: start; }
        .lj-meta { display: flex; gap: 14px; flex-wrap: wrap; }
        .lj-actions { display: flex; gap: 7px; align-items: center; flex-wrap: wrap; justify-content: flex-end; }
        @media (max-width: 720px) {
          .lj-row { grid-template-columns: 1fr; }
          .lj-actions { justify-content: flex-start; }
        }
      `}</style>

      <div className="admin-hero" style={{
        position: "relative", borderRadius: 20, overflow: "hidden",
        background: "linear-gradient(135deg,#0c0420 0%,#190a58 35%,#0b1e66 65%,#062244 100%)",
        padding: "32px 32px 28px", marginBottom: 24,
      }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{
            position: "absolute", width: 260, height: 260, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(124,63,237,0.22) 0%,transparent 70%)",
            top: -80, right: 60, animation: "drift-1 8s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", width: 200, height: 200, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(16,185,129,0.16) 0%,transparent 70%)",
            bottom: -60, left: 120, animation: "drift-2 10s ease-in-out infinite",
          }} />
        </div>

        <div style={{ position: "relative" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 7, fontFamily: UI,
            fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase",
            color: "#a5b4fc", marginBottom: 12,
          }}>
            <Store size={13} /> Atacado
          </span>
          <h1 style={{
            fontFamily: UI, fontSize: 30, fontWeight: 700, color: "#fff",
            margin: "0 0 8px", letterSpacing: "-.025em", lineHeight: 1.15,
          }}>Lojistas</h1>
          <p style={{ fontSize: 14.5, color: "rgba(255,255,255,.72)", margin: 0, maxWidth: 520, lineHeight: 1.6 }}>
            Quem se cadastra na loja entra aqui aguardando. Você aprova e define o
            desconto que aquele lojista vê em todas as peças.
          </p>

          <div className="admin-hero-stats" style={{ display: "flex", gap: 26, marginTop: 24, flexWrap: "wrap" }}>
            {([["Aguardando", counts.pendente, "#fbbf24"],
               ["Ativos", counts.ativo, "#34d399"],
               ["Desativados", counts.inativo, "#94a3b8"]] as const).map(([k, v, c]) => (
              <div key={k}>
                <p style={{ fontFamily: MONO, fontSize: 26, fontWeight: 700, color: c, margin: 0,
                  fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{v}</p>
                <p style={{ fontFamily: UI, fontSize: 11, color: "rgba(255,255,255,.6)",
                  margin: "6px 0 0", letterSpacing: ".06em", textTransform: "uppercase" }}>{k}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
          <input value={q} onChange={e => setQ(e.target.value)}
            placeholder="Buscar por nome, email, loja ou cidade"
            style={{
              width: "100%", boxSizing: "border-box", fontFamily: UI, fontSize: 13.5,
              padding: "10px 12px 10px 34px", borderRadius: 10,
              background: "var(--surface)", color: "var(--text-1)",
              border: "1px solid var(--border)", outline: "none",
            }} />
        </div>
        <div style={{ display: "flex", gap: 4, padding: 4, background: "var(--surface-2)", borderRadius: 10 }}>
          {FILTERS.map(f => (
            <button key={f} type="button" onClick={() => setFilter(f)}
              style={{
                fontFamily: UI, fontSize: 12.5, fontWeight: 600, padding: "7px 12px",
                borderRadius: 7, cursor: "pointer", border: "none",
                background: filter === f ? "var(--surface)" : "transparent",
                color: filter === f ? "var(--text-1)" : "var(--text-3)",
              }}>{f}</button>
          ))}
        </div>
      </div>

      {error && (
        <p style={{ fontSize: 13, color: "var(--red)", margin: "0 0 14px" }}>{error}</p>
      )}

      {list === null ? (
        <p style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 14, color: "var(--text-3)" }}>
          <Loader2 size={16} className="lj-spin" /> Carregando lojistas…
        </p>
      ) : shown.length === 0 ? (
        <div style={{
          border: "1px dashed var(--border-hi)", borderRadius: 14, padding: "44px 24px",
          textAlign: "center", color: "var(--text-3)",
        }}>
          <Store size={26} strokeWidth={1.4} style={{ marginBottom: 12, opacity: .7 }} />
          <p style={{ fontFamily: UI, fontSize: 15, fontWeight: 600, color: "var(--text-2)", margin: "0 0 6px" }}>
            {all.length === 0 ? "Nenhum lojista cadastrado ainda" : "Nada neste filtro"}
          </p>
          <p style={{ fontSize: 13.5, margin: 0, lineHeight: 1.6 }}>
            {all.length === 0
              ? "O cadastro acontece na própria loja, no botão “Sou lojista”. O que chegar aparece aqui."
              : "Troque o filtro acima para ver os outros."}
          </p>
        </div>
      ) : (
        <div className="lj-list">
          {shown.map(r => {
            const s = STATUS[r.status];
            const Icon = s.icon;
            const working = busy === r.id;
            return (
              <div key={r.id} style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 14, padding: "16px 18px",
              }}>
                <div className="lj-row">
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                      <h3 style={{ fontFamily: UI, fontSize: 15.5, fontWeight: 600, margin: 0,
                        color: "var(--text-1)" }}>{r.name}</h3>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        fontFamily: UI, fontSize: 11, fontWeight: 700, padding: "3px 9px",
                        borderRadius: 999, background: `${s.color}1f`, color: s.color,
                      }}><Icon size={11} /> {s.label}</span>
                      {r.status === "ativo" && r.discountPct > 0 && (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          fontFamily: MONO, fontSize: 11.5, fontWeight: 700, padding: "3px 9px",
                          borderRadius: 999, background: "var(--accent-bg)", color: "var(--accent)",
                        }}><Percent size={10} /> {r.discountPct}% atacado</span>
                      )}
                    </div>

                    {r.company && (
                      <p style={{ fontSize: 13, color: "var(--text-2)", margin: "6px 0 0", fontWeight: 500 }}>
                        {r.company}{r.document ? ` · ${r.document}` : ""}
                      </p>
                    )}

                    <div className="lj-meta" style={{ marginTop: 9, fontSize: 12.5, color: "var(--text-3)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Mail size={12} /> {r.email}
                      </span>
                      {r.phone && (
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Phone size={12} /> {r.phone}
                        </span>
                      )}
                      {r.city && (
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <MapPin size={12} /> {r.city}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="lj-actions">
                    <label style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      fontFamily: UI, fontSize: 12, color: "var(--text-3)",
                      border: "1px solid var(--border)", borderRadius: 9, padding: "6px 10px",
                    }}>
                      <Percent size={12} />
                      <input type="number" min={0} max={90} defaultValue={r.discountPct}
                        disabled={working}
                        onBlur={e => {
                          const v = Math.max(0, Math.min(90, Math.round(Number(e.target.value) || 0)));
                          e.target.value = String(v);
                          if (v !== r.discountPct) void patch(r.id, { discountPct: v });
                        }}
                        style={{
                          width: 46, fontFamily: MONO, fontSize: 13, fontWeight: 600,
                          background: "transparent", color: "var(--text-1)",
                          border: "none", outline: "none", textAlign: "right",
                        }} />
                    </label>

                    {r.status !== "ativo" && (
                      <button type="button" disabled={working}
                        onClick={() => void patch(r.id, { status: "ativo" })}
                        style={action("#059669", working)}>
                        {working ? <Loader2 size={13} className="lj-spin" /> : <Check size={13} />}
                        Liberar atacado
                      </button>
                    )}
                    {r.status === "ativo" && (
                      <button type="button" disabled={working}
                        onClick={() => void patch(r.id, { status: "inativo" })}
                        style={action("#64748b", working)}>
                        {working ? <Loader2 size={13} className="lj-spin" /> : <Ban size={13} />}
                        Desativar
                      </button>
                    )}
                    <button type="button" disabled={working} onClick={() => void remove(r)}
                      aria-label={`Apagar ${r.name}`}
                      style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 32, height: 32, borderRadius: 9, cursor: "pointer",
                        background: "transparent", border: "1px solid var(--border)",
                      }}>
                      <Trash2 size={13} color="var(--red)" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

const action = (color: string, busy: boolean): React.CSSProperties => ({
  display: "inline-flex", alignItems: "center", gap: 6,
  fontFamily: UI, fontSize: 12.5, fontWeight: 600,
  padding: "7px 13px", borderRadius: 9,
  cursor: busy ? "default" : "pointer", opacity: busy ? .6 : 1,
  background: `${color}14`, color, border: `1px solid ${color}33`,
});
