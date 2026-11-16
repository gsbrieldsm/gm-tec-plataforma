"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search, X, Plus, Shirt, Trash2, Loader2, Check, ExternalLink,
  AlertTriangle, Sparkles, PackageOpen, Copy,
} from "lucide-react";
import { apiUrl } from "@/lib/base-path";
import { DEMO_STORE_PRODUCTS } from "@/lib/catalog";
import {
  PRODUCT_HUES,
  type TenantSettings, type StoreProduct,
} from "@/lib/tenant-settings";

const UI   = "var(--font-space), var(--font-geist-sans), sans-serif";
const MONO = "var(--font-space-mono), var(--font-geist-mono), monospace";

const FILTERS = ["Todos", "À venda", "Esgotado", "Ocultos"] as const;
type Filter = (typeof FILTERS)[number];

type Loaded = { name: string; handle: string | null; settings: TenantSettings };

function fmtBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function newId() {
  return `p_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

function blank(i: number): StoreProduct {
  return {
    id: newId(), name: "", category: "", price: 0, stock: 1,
    sku: "", description: "", hue: PRODUCT_HUES[i % PRODUCT_HUES.length], active: true,
  };
}

function statusOf(p: StoreProduct) {
  if (!p.active)      return { label: "Oculto",   color: "#64748b", bg: "rgba(100,116,139,0.10)" };
  if (p.stock === 0)  return { label: "Esgotado", color: "#dc2626", bg: "rgba(220,38,38,0.10)" };
  if (p.stock < 5)    return { label: "Pouco estoque", color: "#d97706", bg: "rgba(217,119,6,0.10)" };
  return                     { label: "À venda",  color: "#059669", bg: "rgba(5,150,105,0.10)" };
}

export default function ProdutosPage() {
  const [loaded, setLoaded]   = useState<Loaded | null>(null);
  const [items, setItems]     = useState<StoreProduct[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving]   = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState<Filter>("Todos");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetch(apiUrl("/api/tenant/settings"))
      .then(async r => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? "Erro ao carregar.");
        return r.json() as Promise<Loaded>;
      })
      .then(d => { setLoaded(d); setItems(d.settings.products); })
      .catch(e => setLoadError(e.message));
  }, []);

  const dirty = useMemo(
    () => !!loaded && !!items && JSON.stringify(items) !== JSON.stringify(loaded.settings.products),
    [loaded, items],
  );

  const shown = useMemo(() => {
    if (!items) return [];
    const q = search.trim().toLowerCase();
    return items.filter(p => {
      const matchQ = !q || p.name.toLowerCase().includes(q)
        || p.category.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      const matchF =
        filter === "Todos"    ? true :
        filter === "Ocultos"  ? !p.active :
        filter === "Esgotado" ? p.active && p.stock === 0 :
                                p.active && p.stock > 0;
      return matchQ && matchF;
    });
  }, [items, search, filter]);

  if (loadError) return <p style={{ fontFamily: UI, color: "var(--red)", fontSize: 14 }}>{loadError}</p>;
  if (!loaded || !items) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: UI, color: "var(--text-2)", fontSize: 13, padding: 24 }}>
        <Loader2 size={16} className="cfg-spin" /> Carregando catálogo…
      </div>
    );
  }

  const patch = (id: string, p: Partial<StoreProduct>) =>
    setItems(xs => xs!.map(x => x.id === id ? { ...x, ...p } : x));
  const remove = (id: string) => {
    setItems(xs => xs!.filter(x => x.id !== id));
    setEditingId(null);
  };
  const duplicate = (p: StoreProduct) => {
    const copy = { ...p, id: newId(), name: `${p.name} (cópia)` };
    setItems(xs => [...xs!, copy]);
    setEditingId(copy.id);
  };
  const addNew = () => {
    const p = blank(items.length);
    setItems(xs => [...xs!, p]);
    setEditingId(p.id);
  };

  async function save() {
    if (!loaded || !items) return;
    setSaving(true);
    setSaveError("");
    try {
      const incomplete = items.find(p => !p.name.trim());
      if (incomplete) throw new Error("Há produto sem nome. Preencha ou remova antes de salvar.");

      const body = {
        handle: loaded.handle ?? "",
        settings: { ...loaded.settings, products: items },
      };
      const r = await fetch(apiUrl("/api/tenant/settings"), {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Erro ao salvar.");
      setLoaded(data);
      setItems(data.settings.products);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
    } catch (e) {
      setSaveError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const ativos  = items.filter(p => p.active).length;
  const pecas   = items.reduce((a, p) => a + p.stock, 0);
  const valor   = items.reduce((a, p) => a + p.stock * p.price, 0);
  const editing = items.find(p => p.id === editingId) ?? null;
  const storeName = loaded.settings.brand.storeName || loaded.name;

  return (
    <>
      <style>{`
        .prod-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 14px; }
        .prod-input:focus { border-color: var(--accent) !important; box-shadow: 0 0 0 3px var(--accent-bg); outline: none; }
        .cfg-spin { animation: cfg-spin 1s linear infinite; }
        @keyframes cfg-spin { to { transform: rotate(360deg); } }
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
            background: "radial-gradient(circle, rgba(124,63,237,0.35) 0%, transparent 70%)",
            top: -90, right: 70, animation: "drift-1 9s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", width: 180, height: 180, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(6,182,212,0.28) 0%, transparent 70%)",
            bottom: -70, left: 130, animation: "drift-2 11s ease-in-out infinite",
          }} />
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{
            fontFamily: UI, fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.16em", textTransform: "uppercase", margin: "0 0 6px",
          }}>Catálogo · {storeName}</p>
          <h1 style={{ fontFamily: UI, fontSize: 24, fontWeight: 800, color: "#fff", margin: 0 }}>Produtos</h1>
          <p style={{ fontFamily: UI, fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "6px 0 0" }}>
            O que você cadastra aqui é o que aparece na sua loja.
          </p>
        </div>

        <div className="admin-hero-stats" style={{
          position: "relative", zIndex: 1,
          display: "flex", alignItems: "flex-end", justifyContent: "space-between",
          gap: 24, marginTop: 22, flexWrap: "wrap",
          borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16,
        }}>
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
            {[
              { label: "Produtos",        value: String(items.length) },
              { label: "À venda",         value: String(ativos) },
              { label: "Peças",           value: String(pecas) },
              { label: "Valor em estoque", value: fmtBRL(valor) },
            ].map(s => (
              <div key={s.label}>
                <p style={{ fontFamily: MONO, fontSize: 20, fontWeight: 700, color: "#fff", margin: 0 }}>{s.value}</p>
                <p style={{ fontFamily: UI, fontSize: 10, color: "rgba(255,255,255,0.4)", margin: "2px 0 0" }}>{s.label}</p>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {loaded.handle && (
              <Link href={`/loja/${loaded.handle}`} target="_blank" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontFamily: UI, fontSize: 12, fontWeight: 700, textDecoration: "none",
                color: "rgba(255,255,255,0.85)", background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.18)", borderRadius: 10, padding: "9px 14px",
              }}>
                Ver loja <ExternalLink size={12} />
              </Link>
            )}
            <button onClick={addNew} style={{
              display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer",
              fontFamily: UI, fontSize: 12, fontWeight: 700,
              color: "#fff", background: "var(--accent)", border: "none",
              borderRadius: 10, padding: "9px 16px", minHeight: 38,
            }}>
              <Plus size={13} /> Novo produto
            </button>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          onAdd={addNew}
          onDemo={() => setItems(DEMO_STORE_PRODUCTS.map(p => ({ ...p, id: newId() })))}
        />
      ) : (
        <>
          <div style={{ display: "flex", gap: 10, marginBottom: 18, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
              <Search size={14} color="var(--text-3)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input
                className="prod-input" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nome, categoria ou código..."
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
                  padding: "9px 14px", borderRadius: 8,
                  background: filter === f ? "var(--accent-bg)" : "var(--surface)",
                  border: `1px solid ${filter === f ? "var(--accent)" : "var(--border)"}`,
                  color: filter === f ? "var(--accent)" : "var(--text-2)",
                }}>{f}</button>
              ))}
            </div>
          </div>

          <div className="prod-grid">
            {shown.map(p => {
              const st = statusOf(p);
              return (
                <button key={p.id} onClick={() => setEditingId(p.id)} style={{
                  display: "block", textAlign: "left", cursor: "pointer", padding: 0,
                  background: "var(--surface)", borderRadius: 14, overflow: "hidden",
                  border: `1px solid ${editingId === p.id ? "var(--accent)" : "var(--border)"}`,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}>
                  <div style={{
                    position: "relative", aspectRatio: "16 / 10",
                    background: `linear-gradient(135deg, ${p.hue}26 0%, ${p.hue}0a 60%, var(--surface-2) 100%)`,
                    borderBottom: "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Shirt size={30} color={`${p.hue}66`} strokeWidth={1.4} />
                    <span style={{
                      position: "absolute", top: 9, right: 9,
                      fontFamily: UI, fontSize: 9.5, fontWeight: 700, whiteSpace: "nowrap",
                      color: st.color, background: "var(--surface)",
                      border: `1px solid ${st.color}3a`, borderRadius: 6, padding: "3px 7px",
                    }}>{st.label}</span>
                  </div>
                  <div style={{ padding: "12px 14px 14px" }}>
                    <p style={{
                      fontFamily: UI, fontSize: 13, fontWeight: 700, color: "var(--text-1)", margin: 0,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>{p.name || "Sem nome"}</p>
                    <p style={{ fontFamily: UI, fontSize: 11, color: "var(--text-3)", margin: "2px 0 10px" }}>
                      {p.category || "sem categoria"}
                    </p>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: "var(--text-1)" }}>
                        {fmtBRL(p.price)}
                      </span>
                      <span style={{
                        fontFamily: UI, fontSize: 11, fontWeight: 600,
                        color: p.stock === 0 ? "#dc2626" : "var(--text-2)",
                        display: "inline-flex", alignItems: "center", gap: 4,
                      }}>
                        {p.stock > 0 && p.stock < 5 && <AlertTriangle size={10} color="#d97706" />}
                        {p.stock} un
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {shown.length === 0 && (
            <p style={{ textAlign: "center", padding: "40px 20px", fontFamily: UI, fontSize: 13, color: "var(--text-2)" }}>
              Nenhum produto encontrado.
            </p>
          )}
        </>
      )}

      {editing && (
        <ProductDrawer
          product={editing}
          onPatch={p => patch(editing.id, p)}
          onRemove={() => remove(editing.id)}
          onDuplicate={() => duplicate(editing)}
          onClose={() => setEditingId(null)}
        />
      )}

      {(dirty || saveError || justSaved) && (
        <div style={{
          position: "sticky", bottom: 16, zIndex: 20, marginTop: 20,
          display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
          background: "var(--text-1)", color: "var(--bg)",
          borderRadius: 14, padding: "12px 14px 12px 18px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.22)", fontFamily: UI,
        }}>
          <span style={{ flex: 1, minWidth: 160, fontSize: 13, fontWeight: 500 }}>
            {saveError
              ? <span style={{ color: "#fca5a5" }}>{saveError}</span>
              : justSaved && !dirty
                ? <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Check size={15} /> Catálogo salvo e publicado na loja</span>
                : "Alterações ainda não publicadas na loja"}
          </span>
          {dirty && (
            <>
              <button onClick={() => { setItems(loaded.settings.products); setSaveError(""); }} disabled={saving} style={{
                fontFamily: UI, fontSize: 13, fontWeight: 600, cursor: "pointer",
                background: "transparent", color: "inherit", opacity: 0.75,
                border: "1px solid rgba(255,255,255,0.25)", borderRadius: 10, padding: "10px 16px",
              }}>Descartar</button>
              <button onClick={save} disabled={saving} style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer",
                background: "var(--accent)", color: "#fff", border: "none",
                borderRadius: 10, padding: "10px 20px", minHeight: 40,
              }}>
                {saving && <Loader2 size={14} className="cfg-spin" />} Salvar
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}

function EmptyState({ onAdd, onDemo }: { onAdd: () => void; onDemo: () => void }) {
  return (
    <div style={{
      textAlign: "center", padding: "48px 24px", borderRadius: 16,
      border: "1px dashed var(--border-hi)", background: "var(--surface)",
    }}>
      <PackageOpen size={30} color="var(--accent)" />
      <h2 style={{ fontFamily: UI, fontSize: 16, fontWeight: 700, color: "var(--text-1)", margin: "12px 0 6px" }}>
        Seu catálogo está vazio
      </h2>
      <p style={{ fontFamily: UI, fontSize: 13, color: "var(--text-2)", margin: "0 auto 20px", maxWidth: 420, lineHeight: 1.55 }}>
        Cada produto cadastrado aqui aparece na sua loja. Comece por uma peça —
        dá para ajustar preço, estoque e foto depois.
      </p>
      <button onClick={onAdd} style={{
        display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer",
        fontFamily: UI, fontSize: 14, fontWeight: 700,
        color: "#fff", background: "var(--accent)", border: "none",
        borderRadius: 12, padding: "14px 26px", minHeight: 48,
        boxShadow: "0 4px 16px rgba(124,63,237,0.28)",
      }}>
        <Plus size={16} /> Cadastrar primeiro produto
      </button>
      <div style={{ marginTop: 14 }}>
        <button onClick={onDemo} style={{
          fontFamily: UI, fontSize: 12, fontWeight: 600, color: "var(--accent)",
          background: "none", border: "none", cursor: "pointer",
        }}>
          ou preencher com exemplos para testar
        </button>
      </div>
    </div>
  );
}

function ProductDrawer({ product: p, onPatch, onRemove, onDuplicate, onClose }: {
  product: StoreProduct;
  onPatch: (patch: Partial<StoreProduct>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const st = statusOf(p);

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.25)", backdropFilter: "blur(3px)" }} />
      <div role="dialog" aria-label={`Editar ${p.name || "produto"}`} style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "min(480px, 100vw)", zIndex: 50,
        background: "var(--bg)", borderLeft: "1px solid var(--border)",
        boxShadow: "-8px 0 48px rgba(0,0,0,0.14)", overflowY: "auto", fontFamily: UI,
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${p.hue}3a 0%, #190a58 60%, #0b1e66 100%)`,
          padding: "24px 24px 20px", position: "relative", overflow: "hidden",
        }}>
          <button onClick={onClose} aria-label="Fechar" style={{
            position: "absolute", top: 16, right: 16, width: 32, height: 32, borderRadius: 8,
            background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <X size={15} color="rgba(255,255,255,0.8)" />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 14, paddingRight: 40 }}>
            <span style={{
              width: 52, height: 52, borderRadius: 13, flexShrink: 0,
              background: `${p.hue}30`, border: `1.5px solid ${p.hue}70`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Shirt size={23} color="#fff" strokeWidth={1.5} />
            </span>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 16, fontWeight: 800, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {p.name || "Novo produto"}
              </p>
              <span style={{
                display: "inline-block", marginTop: 7,
                fontSize: 10, fontWeight: 700, color: st.color,
                background: "rgba(255,255,255,0.92)", borderRadius: 6, padding: "3px 9px",
              }}>{st.label}</span>
            </div>
          </div>
        </div>

        <div style={{ padding: "22px 24px 28px", display: "flex", flexDirection: "column", gap: 18 }}>
          <Field id="pd-name" label="Nome do produto" required>
            <input id="pd-name" className="prod-input" value={p.name} maxLength={80} autoFocus
              placeholder="Ex.: Conjunto Moletom Infantil"
              onChange={e => onPatch({ name: e.target.value })} style={inputStyle} />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field id="pd-cat" label="Categoria">
              <input id="pd-cat" className="prod-input" value={p.category} maxLength={40}
                placeholder="Ex.: Conjuntos" onChange={e => onPatch({ category: e.target.value })} style={inputStyle} />
            </Field>
            <Field id="pd-sku" label="Código / SKU">
              <input id="pd-sku" className="prod-input" value={p.sku} maxLength={40}
                placeholder="LK-001" onChange={e => onPatch({ sku: e.target.value })}
                style={{ ...inputStyle, fontFamily: MONO, fontSize: 12.5 }} />
            </Field>
            <Field id="pd-price" label="Preço de venda" required>
              <input id="pd-price" className="prod-input" inputMode="decimal"
                value={p.price === 0 ? "" : String(p.price).replace(".", ",")} placeholder="R$ 0,00"
                onChange={e => {
                  const n = Number(e.target.value.replace(/[^\d,.]/g, "").replace(",", "."));
                  onPatch({ price: Number.isFinite(n) ? n : 0 });
                }}
                style={{ ...inputStyle, fontFamily: MONO }} />
            </Field>
            <Field id="pd-stock" label="Estoque">
              <input id="pd-stock" className="prod-input" inputMode="numeric" value={p.stock}
                onChange={e => onPatch({ stock: Math.max(0, parseInt(e.target.value.replace(/\D/g, "") || "0", 10)) })}
                style={{ ...inputStyle, fontFamily: MONO, textAlign: "center" }} />
            </Field>
          </div>

          <Field id="pd-desc" label="Descrição" counter={`${p.description.length}/600`}>
            <textarea id="pd-desc" className="prod-input" value={p.description} maxLength={600} rows={3}
              placeholder="Tecido, tamanhos, cuidados — o que ajuda o cliente a decidir."
              onChange={e => onPatch({ description: e.target.value })}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} />
          </Field>

          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-2)", margin: "0 0 8px" }}>Cor do cartão</p>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {PRODUCT_HUES.map(h => (
                <button key={h} type="button" onClick={() => onPatch({ hue: h })}
                  aria-label={`Cor ${h}`} aria-pressed={p.hue === h}
                  style={{
                    width: 26, height: 26, borderRadius: "50%", cursor: "pointer", background: h,
                    border: p.hue === h ? "2.5px solid var(--text-1)" : "1px solid rgba(0,0,0,0.12)",
                  }} />
              ))}
            </div>
            <p style={{ fontSize: 11, color: "var(--text-3)", margin: "8px 0 0", lineHeight: 1.5 }}>
              Enquanto não há foto, é essa cor que identifica a peça na loja.
            </p>
          </div>

          <label style={{
            display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "12px 14px",
          }}>
            <input type="checkbox" checked={p.active} onChange={e => onPatch({ active: e.target.checked })} />
            <span style={{ flex: 1 }}>
              <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>Visível na loja</span>
              <span style={{ display: "block", fontSize: 11.5, color: "var(--text-2)", marginTop: 2 }}>
                Esgotado continua aparecendo; oculto some da vitrine sem apagar o cadastro.
              </span>
            </span>
          </label>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={{
              flex: 1, fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer",
              color: "#fff", background: "var(--accent)", border: "none",
              borderRadius: 10, padding: "13px", minHeight: 46,
            }}>Pronto</button>
            <button onClick={onDuplicate} title="Duplicar" style={iconBtn}>
              <Copy size={15} color="var(--text-2)" />
            </button>
            <button onClick={onRemove} title="Remover produto" style={iconBtn}>
              <Trash2 size={15} color="var(--red)" />
            </button>
          </div>

          <p style={{
            display: "flex", gap: 8, fontSize: 11.5, color: "var(--text-2)", lineHeight: 1.5,
            background: "var(--accent-bg)", border: "1px solid var(--border-hi)",
            borderRadius: 10, padding: "11px 13px", margin: 0,
          }}>
            <Sparkles size={14} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} />
            As alterações só vão para a loja depois que você clicar em <strong>Salvar</strong>.
          </p>
        </div>
      </div>
    </>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box",
  fontFamily: UI, fontSize: 13, color: "var(--text-1)",
  background: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: 8, padding: "10px 12px", outline: "none",
};

const iconBtn: React.CSSProperties = {
  width: 46, height: 46, borderRadius: 10, flexShrink: 0, cursor: "pointer",
  background: "var(--surface)", border: "1px solid var(--border)",
  display: "flex", alignItems: "center", justifyContent: "center",
};

function Field({ id, label, required, counter, children }: {
  id: string; label: string; required?: boolean; counter?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <label htmlFor={id} style={{ fontFamily: UI, fontSize: 11, fontWeight: 600, color: "var(--text-2)" }}>
          {label}{required && <span style={{ color: "var(--accent)", marginLeft: 2 }}>*</span>}
        </label>
        {counter && <span style={{ fontFamily: MONO, fontSize: 10, color: "var(--text-3)" }}>{counter}</span>}
      </div>
      {children}
    </div>
  );
}
