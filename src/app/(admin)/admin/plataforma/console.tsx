"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Search, Loader2, ExternalLink, ShieldAlert, ShieldCheck,
  Store, Package, Plug, Users, Globe,
} from "lucide-react";
import { apiUrl } from "@/lib/base-path";
import type { PlatformTenant } from "@/app/api/platform/tenants/route";

const UI   = "var(--font-space), var(--font-geist-sans), sans-serif";
const MONO = "var(--font-space-mono), var(--font-geist-mono), monospace";

type Filter = "todas" | "publicadas" | "rascunho" | "suspensas";
const FILTERS: Filter[] = ["todas", "publicadas", "rascunho", "suspensas"];

export function PlatformConsole() {
  const { data: session }     = useSession();
  const [rows, setRows]       = useState<PlatformTenant[] | null>(null);
  const [error, setError]     = useState("");
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState<Filter>("todas");
  const [busyId, setBusyId]   = useState<string | null>(null);

  useEffect(() => {
    fetch(apiUrl("/api/platform/tenants"))
      .then(async r => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? "Erro ao carregar.");
        return r.json() as Promise<{ tenants: PlatformTenant[] }>;
      })
      .then(d => setRows(d.tenants))
      .catch(e => setError(e.message));
  }, []);

  const shown = useMemo(() => {
    if (!rows) return [];
    const q = search.trim().toLowerCase();
    return rows.filter(t => {
      const matchQ = !q
        || t.storeName.toLowerCase().includes(q)
        || t.slug.toLowerCase().includes(q)
        || (t.handle ?? "").includes(q);
      const matchF =
        filter === "todas"      ? true :
        filter === "suspensas"  ? t.suspended :
        filter === "publicadas" ? t.published && !t.suspended :
                                  !t.published && !t.suspended;
      return matchQ && matchF;
    });
  }, [rows, search, filter]);

  async function toggleSuspend(t: PlatformTenant) {
    setBusyId(t.id);
    setError("");
    try {
      const r = await fetch(apiUrl("/api/platform/tenants"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: t.id, suspended: !t.suspended }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Erro ao atualizar.");
      setRows(rs => rs?.map(x => x.id === t.id ? { ...x, suspended: data.suspended } : x) ?? null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  const total      = rows?.length ?? 0;
  const publicadas = rows?.filter(t => t.published && !t.suspended).length ?? 0;
  const suspensas  = rows?.filter(t => t.suspended).length ?? 0;
  const comProduto = rows?.filter(t => t.products > 0).length ?? 0;

  return (
    <>
      <style>{`
        .plat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 12px; }
        .plat-input:focus { border-color: var(--accent) !important; box-shadow: 0 0 0 3px var(--accent-bg); outline: none; }
      `}</style>

      {/* Hero */}
      <div className="admin-hero" style={{
        position: "relative", borderRadius: 20, overflow: "hidden",
        background: "linear-gradient(135deg,#0c0420 0%,#190a58 35%,#0b1e66 65%,#062244 100%)",
        padding: "28px 32px 24px", marginBottom: 20,
      }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{
            position: "absolute", width: 240, height: 240, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,63,237,0.4) 0%, transparent 70%)",
            top: -90, right: 70, animation: "drift-1 9s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", width: 180, height: 180, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%)",
            bottom: -70, left: 130, animation: "drift-2 11s ease-in-out infinite",
          }} />
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{
            fontFamily: UI, fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.16em", textTransform: "uppercase", margin: "0 0 6px",
          }}>Operador · todas as lojas</p>
          <h1 style={{ fontFamily: UI, fontSize: 24, fontWeight: 800, color: "#fff", margin: 0 }}>
            Plataforma
          </h1>
          <p style={{ fontFamily: UI, fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "6px 0 0" }}>
            Esta tela só existe para você. Nenhum lojista enxerga a loja de outro.
          </p>
        </div>

        <div className="admin-hero-stats" style={{
          position: "relative", zIndex: 1, display: "flex", gap: 28, flexWrap: "wrap",
          marginTop: 22, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16,
        }}>
          {[
            { label: "Lojas",          value: String(total) },
            { label: "Publicadas",     value: String(publicadas) },
            { label: "Com catálogo",   value: String(comProduto) },
            { label: "Suspensas",      value: String(suspensas) },
          ].map(s => (
            <div key={s.label}>
              <p style={{ fontFamily: MONO, fontSize: 20, fontWeight: 700, color: "#fff", margin: 0 }}>{s.value}</p>
              <p style={{ fontFamily: UI, fontSize: 10, color: "rgba(255,255,255,0.4)", margin: "2px 0 0" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Busca e filtros */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search size={14} color="var(--text-3)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input
            className="plat-input" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por loja, email ou endereço..."
            style={{
              width: "100%", boxSizing: "border-box",
              fontFamily: UI, fontSize: 13, color: "var(--text-1)",
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 10, padding: "10px 12px 10px 34px", outline: "none",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              fontFamily: UI, fontSize: 12, fontWeight: 600, cursor: "pointer",
              padding: "9px 14px", borderRadius: 8, textTransform: "capitalize",
              background: filter === f ? "var(--accent-bg)" : "var(--surface)",
              border: `1px solid ${filter === f ? "var(--accent)" : "var(--border)"}`,
              color: filter === f ? "var(--accent)" : "var(--text-2)",
            }}>{f}</button>
          ))}
        </div>
      </div>

      {error && (
        <p style={{
          fontFamily: UI, fontSize: 13, color: "var(--red)",
          background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.2)",
          borderRadius: 10, padding: "11px 14px", marginBottom: 14,
        }}>{error}</p>
      )}

      {!rows && !error && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: UI, fontSize: 13, color: "var(--text-2)", padding: 24 }}>
          <Loader2 size={16} className="cfg-spin" /> Carregando lojas…
        </div>
      )}

      {rows && (
        <div className="plat-grid">
          {shown.map(t => {
            const owner = t.users[0];
            const isSelf = t.id === session?.user?.tenantId;
            return (
              <div key={t.id} style={{
                background: "var(--surface)",
                border: `1px solid ${t.suspended ? "rgba(220,38,38,0.35)" : "var(--border)"}`,
                borderRadius: 14, padding: 16,
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                opacity: t.suspended ? 0.75 : 1,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 12 }}>
                  <span aria-hidden style={{
                    width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                    background: `${t.primary}1f`, border: `1px solid ${t.primary}55`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: UI, fontSize: 15, fontWeight: 800, color: t.primary,
                  }}>{t.storeName.charAt(0).toUpperCase()}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontFamily: UI, fontSize: 13.5, fontWeight: 700, color: "var(--text-1)", margin: 0,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>{t.storeName}</p>
                    <p style={{
                      fontFamily: MONO, fontSize: 10.5, color: "var(--text-2)", margin: "2px 0 0",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>{t.slug}</p>
                  </div>
                  <StatusPill suspended={t.suspended} published={t.published} />
                </div>

                <div style={{
                  display: "flex", gap: 14, flexWrap: "wrap",
                  borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)",
                  padding: "10px 0", marginBottom: 12,
                }}>
                  <Metric icon={Package} value={t.products} label="produtos" />
                  <Metric icon={Plug}    value={t.integrationsReady} label="integrações" />
                  <Metric icon={Users}   value={t.users.length} label="usuários" />
                </div>

                <p style={{
                  fontFamily: UI, fontSize: 11, color: "var(--text-3)", margin: "0 0 10px",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <Globe size={11} />
                  {t.handle ? `/loja/${t.handle}` : "sem endereço definido"}
                  {owner?.name && <span style={{ marginLeft: "auto" }}>{owner.name}</span>}
                </p>

                <div style={{ display: "flex", gap: 7 }}>
                  {t.handle ? (
                    <a href={apiUrl(`/loja/${t.handle}`)} target="_blank" rel="noreferrer" style={{
                      flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                      fontFamily: UI, fontSize: 12, fontWeight: 600, textDecoration: "none",
                      color: "var(--text-1)", background: "var(--surface-2)",
                      border: "1px solid var(--border)", borderRadius: 9, padding: "9px 12px", minHeight: 38,
                    }}>
                      <Store size={13} /> Ver loja <ExternalLink size={11} />
                    </a>
                  ) : (
                    <span style={{
                      flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center",
                      fontFamily: UI, fontSize: 12, color: "var(--text-3)",
                      background: "var(--surface-2)", border: "1px solid var(--border)",
                      borderRadius: 9, padding: "9px 12px", minHeight: 38,
                    }}>Sem loja no ar</span>
                  )}

                  <button
                    onClick={() => toggleSuspend(t)}
                    disabled={busyId === t.id || isSelf}
                    title={isSelf ? "Esta é a sua conta de operador" : undefined}
                    style={{
                      opacity: isSelf ? 0.4 : 1,
                      cursor: isSelf ? "not-allowed" : "pointer",
                      display: "inline-flex", alignItems: "center", gap: 6,
                      fontFamily: UI, fontSize: 12, fontWeight: 600,
                      color: t.suspended ? "#059669" : "var(--red)",
                      background: t.suspended ? "rgba(5,150,105,0.08)" : "rgba(220,38,38,0.06)",
                      border: `1px solid ${t.suspended ? "rgba(5,150,105,0.3)" : "rgba(220,38,38,0.25)"}`,
                      borderRadius: 9, padding: "9px 12px", minHeight: 38, whiteSpace: "nowrap",
                    }}>
                    {busyId === t.id
                      ? <Loader2 size={13} className="cfg-spin" />
                      : t.suspended ? <ShieldCheck size={13} /> : <ShieldAlert size={13} />}
                    {t.suspended ? "Reativar" : "Suspender"}
                  </button>
                </div>
              </div>
            );
          })}

          {shown.length === 0 && (
            <p style={{
              gridColumn: "1/-1", textAlign: "center", padding: "40px 20px",
              fontFamily: UI, fontSize: 13, color: "var(--text-2)",
            }}>Nenhuma loja encontrada.</p>
          )}
        </div>
      )}
    </>
  );
}

function StatusPill({ suspended, published }: { suspended: boolean; published: boolean }) {
  const [label, color] = suspended
    ? ["Suspensa", "#dc2626"]
    : published ? ["No ar", "#059669"] : ["Rascunho", "#d97706"];
  return (
    <span style={{
      fontFamily: UI, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap",
      color, background: `${color}14`, border: `1px solid ${color}33`,
      borderRadius: 6, padding: "3px 8px",
    }}>{label}</span>
  );
}

function Metric({ icon: Icon, value, label }: { icon: React.ElementType; value: number; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 11.5, color: "var(--text-2)" }}>
      <Icon size={12} color="var(--text-3)" />
      <strong style={{ fontFamily: MONO, fontSize: 12.5, color: "var(--text-1)" }}>{value}</strong> {label}
    </span>
  );
}
