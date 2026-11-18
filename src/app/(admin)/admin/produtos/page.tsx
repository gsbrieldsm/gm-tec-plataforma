"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search, X, Plus, Shirt, Trash2, Loader2, ExternalLink,
  AlertTriangle, PackageOpen,
} from "lucide-react";
import { apiUrl } from "@/lib/base-path";
import { ImageField } from "@/components/admin/image-field";
import { fmtCents, parseMoney, centsToInput } from "@/lib/money";
import { PRODUCT_HUES } from "@/lib/tenant-settings";
import { PHOTO_ASPECT } from "@/lib/photo";
import type { ApiProduct, ApiVariant } from "@/lib/product-schema";

const UI   = "var(--font-space), var(--font-geist-sans), sans-serif";
const MONO = "var(--font-space-mono), var(--font-geist-mono), monospace";

const FILTERS = ["Todos", "À venda", "Esgotado", "Ocultos"] as const;
type Filter = (typeof FILTERS)[number];

/** Grades mais comuns — um clique preenche a linha inteira. */
const SIZE_PRESETS: Record<string, string[]> = {
  "Infantil":    ["2", "4", "6", "8", "10", "12"],
  "Bebê":        ["RN", "P", "M", "G"],
  "Adulto":      ["PP", "P", "M", "G", "GG"],
  "Numeração":   ["36", "38", "40", "42", "44"],
  "Tamanho único": ["Único"],
};

type DraftImage = { id?: string; url: string; path: string };
type Draft = Omit<ApiProduct, "id" | "images"> & { id: string | null; images: DraftImage[] };

const totalStock = (p: { variants: { stock: number }[] }) =>
  p.variants.reduce((a, v) => a + v.stock, 0);

function statusOf(p: ApiProduct) {
  if (!p.active)             return { label: "Oculto",        color: "#64748b" };
  if (totalStock(p) === 0)   return { label: "Esgotado",      color: "#dc2626" };
  if (totalStock(p) < 5)     return { label: "Pouco estoque", color: "#d97706" };
  return                          { label: "À venda",        color: "#059669" };
}

function emptyDraft(position: number): Draft {
  return {
    id: null, name: "", category: "", sku: "", description: "",
    priceCents: 0, hue: PRODUCT_HUES[position % PRODUCT_HUES.length],
    imageUrl: null, active: true, position,
    variants: [{ id: "", size: "", color: "", sku: "", stock: 0, position: 0 }],
    images: [],
  };
}

export default function ProdutosPage() {
  const [products, setProducts] = useState<ApiProduct[] | null>(null);
  const [store, setStore]       = useState<{ handle: string | null; name: string } | null>(null);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState<Filter>("Todos");
  const [draft, setDraft]       = useState<Draft | null>(null);

  async function reload() {
    const r = await fetch(apiUrl("/api/tenant/products"));
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? "Erro ao carregar.");
    const d = await r.json() as { products: ApiProduct[] };
    setProducts(d.products);
  }

  useEffect(() => {
    Promise.all([
      reload(),
      fetch(apiUrl("/api/tenant/settings")).then(r => r.json()).then(d =>
        setStore({ handle: d.handle, name: d.settings?.brand?.storeName || d.name })),
    ]).catch(e => setLoadError((e as Error).message));
  }, []);

  const shown = useMemo(() => {
    if (!products) return [];
    const q = search.trim().toLowerCase();
    return products.filter(p => {
      const matchQ = !q || p.name.toLowerCase().includes(q)
        || p.category.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      const st = totalStock(p);
      const matchF =
        filter === "Todos"    ? true :
        filter === "Ocultos"  ? !p.active :
        filter === "Esgotado" ? p.active && st === 0 :
                                p.active && st > 0;
      return matchQ && matchF;
    });
  }, [products, search, filter]);

  if (loadError) return <p style={{ fontFamily: UI, color: "var(--red)", fontSize: 14 }}>{loadError}</p>;
  if (!products) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: UI, color: "var(--text-2)", fontSize: 13, padding: 24 }}>
        <Loader2 size={16} className="sp" /> Carregando catálogo…
      </div>
    );
  }

  const pecas = products.reduce((a, p) => a + totalStock(p), 0);
  const valor = products.reduce((a, p) => a + totalStock(p) * p.priceCents, 0);

  return (
    <>
      <style>{`
        .prod-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 14px; }
        .pi:focus { border-color: var(--accent) !important; box-shadow: 0 0 0 3px var(--accent-bg); outline: none; }
        .sp { animation: sp 1s linear infinite; }
        @keyframes sp { to { transform: rotate(360deg); } }
      `}</style>

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
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{
            fontFamily: UI, fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.16em", textTransform: "uppercase", margin: "0 0 6px",
          }}>Catálogo{store?.name ? ` · ${store.name}` : ""}</p>
          <h1 style={{ fontFamily: UI, fontSize: 24, fontWeight: 800, color: "#fff", margin: 0 }}>Produtos</h1>
          <p style={{ fontFamily: UI, fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "6px 0 0" }}>
            O que você cadastra aqui aparece na sua loja na hora.
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
              { label: "Produtos", value: String(products.length) },
              { label: "À venda",  value: String(products.filter(p => p.active).length) },
              { label: "Peças",    value: String(pecas) },
              { label: "Valor em estoque", value: fmtCents(valor) },
            ].map(s => (
              <div key={s.label}>
                <p style={{ fontFamily: MONO, fontSize: 20, fontWeight: 700, color: "#fff", margin: 0 }}>{s.value}</p>
                <p style={{ fontFamily: UI, fontSize: 10, color: "rgba(255,255,255,0.4)", margin: "2px 0 0" }}>{s.label}</p>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {store?.handle && (
              <Link href={`/loja/${store.handle}`} target="_blank" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontFamily: UI, fontSize: 12, fontWeight: 700, textDecoration: "none",
                color: "rgba(255,255,255,0.85)", background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.18)", borderRadius: 10, padding: "9px 14px",
              }}>Ver loja <ExternalLink size={12} /></Link>
            )}
            <button onClick={() => setDraft(emptyDraft(products.length))} style={{
              display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer",
              fontFamily: UI, fontSize: 12, fontWeight: 700,
              color: "#fff", background: "var(--accent)", border: "none",
              borderRadius: 10, padding: "9px 16px", minHeight: 38,
            }}><Plus size={13} /> Novo produto</button>
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "48px 24px", borderRadius: 16,
          border: "1px dashed var(--border-hi)", background: "var(--surface)",
        }}>
          <PackageOpen size={30} color="var(--accent)" />
          <h2 style={{ fontFamily: UI, fontSize: 16, fontWeight: 700, color: "var(--text-1)", margin: "12px 0 6px" }}>
            Seu catálogo está vazio
          </h2>
          <p style={{ fontFamily: UI, fontSize: 13, color: "var(--text-2)", margin: "0 auto 20px", maxWidth: 440, lineHeight: 1.55 }}>
            Cada produto cadastrado aqui aparece na sua loja. Comece por uma peça —
            você informa os tamanhos e quanto tem de cada um.
          </p>
          <button onClick={() => setDraft(emptyDraft(0))} style={{
            display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer",
            fontFamily: UI, fontSize: 14, fontWeight: 700,
            color: "#fff", background: "var(--accent)", border: "none",
            borderRadius: 12, padding: "14px 26px", minHeight: 48,
            boxShadow: "0 4px 16px rgba(124,63,237,0.28)",
          }}><Plus size={16} /> Cadastrar primeiro produto</button>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 10, marginBottom: 18, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
              <Search size={14} color="var(--text-3)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input className="pi" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nome, categoria ou código..."
                style={{
                  width: "100%", boxSizing: "border-box",
                  fontFamily: UI, fontSize: 13, color: "var(--text-1)",
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: 10, padding: "10px 12px 10px 34px", outline: "none",
                }} />
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
              const sizes = p.variants.filter(v => v.size);
              return (
                <button key={p.id} onClick={() => setDraft({ ...p })} style={{
                  display: "block", textAlign: "left", cursor: "pointer", padding: 0,
                  background: "var(--surface)", borderRadius: 14, overflow: "hidden",
                  border: "1px solid var(--border)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}>
                  <div style={{
                    position: "relative", aspectRatio: PHOTO_ASPECT,
                    background: p.imageUrl ? "var(--surface-2)"
                      : `linear-gradient(135deg, ${p.hue}26 0%, ${p.hue}0a 60%, var(--surface-2) 100%)`,
                    borderBottom: "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
                  }}>
                    {p.imageUrl
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={p.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <Shirt size={30} color={`${p.hue}66`} strokeWidth={1.4} />}
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
                    }}>{p.name}</p>
                    <p style={{ fontFamily: UI, fontSize: 11, color: "var(--text-3)", margin: "2px 0 8px" }}>
                      {p.category || "sem categoria"}
                    </p>
                    {sizes.length > 0 && (
                      <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 8 }}>
                        {sizes.slice(0, 6).map(v => (
                          <span key={v.id} style={{
                            fontFamily: MONO, fontSize: 9.5, fontWeight: 700, padding: "2px 5px", borderRadius: 4,
                            background: v.stock > 0 ? "var(--surface-2)" : "transparent",
                            border: "1px solid var(--border)",
                            color: v.stock > 0 ? "var(--text-2)" : "var(--text-3)",
                            opacity: v.stock > 0 ? 1 : 0.5,
                          }}>{v.size}</span>
                        ))}
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: "var(--text-1)" }}>
                        {fmtCents(p.priceCents)}
                      </span>
                      <span style={{
                        fontFamily: UI, fontSize: 11, fontWeight: 600,
                        color: totalStock(p) === 0 ? "#dc2626" : "var(--text-2)",
                        display: "inline-flex", alignItems: "center", gap: 4,
                      }}>
                        {totalStock(p) > 0 && totalStock(p) < 5 && <AlertTriangle size={10} color="#d97706" />}
                        {totalStock(p)} un
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

      {draft && (
        <ProductDrawer
          draft={draft}
          onChange={setDraft}
          onClose={() => setDraft(null)}
          onSaved={async () => { await reload(); setDraft(null); }}
        />
      )}
    </>
  );
}

function ProductDrawer({ draft, onChange, onClose, onSaved }: {
  draft: Draft;
  onChange: (d: Draft) => void;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");
  const [priceText, setPriceText] = useState(centsToInput(draft.priceCents));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = (p: Partial<Draft>) => onChange({ ...draft, ...p });
  const setVariants = (vs: ApiVariant[]) => set({ variants: vs });

  const applyPreset = (key: string) => {
    const existing = new Map(draft.variants.filter(v => v.size).map(v => [v.size, v]));
    setVariants(SIZE_PRESETS[key].map((size, i) => (
      existing.get(size) ?? { id: "", size, color: "", sku: "", stock: 0, position: i }
    )));
  };

  async function save() {
    setSaving(true);
    setError("");
    try {
      const body = {
        name: draft.name, category: draft.category, sku: draft.sku,
        description: draft.description, priceCents: draft.priceCents,
        hue: draft.hue,
        active: draft.active, position: draft.position,
        images: draft.images.map(im => ({
          ...(im.id ? { id: im.id } : {}),
          url: im.url, path: im.path,
        })),
        variants: draft.variants.map(v => ({
          ...(v.id ? { id: v.id } : {}),
          size: v.size, color: v.color, sku: v.sku, stock: v.stock,
        })),
      };
      const r = draft.id
        ? await fetch(apiUrl(`/api/tenant/products/${draft.id}`), {
            method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        : await fetch(apiUrl("/api/tenant/products"), {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Erro ao salvar.");
      await onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!draft.id) return onClose();
    setSaving(true);
    try {
      await fetch(apiUrl(`/api/tenant/products/${draft.id}`), { method: "DELETE" });
      await onSaved();
    } finally {
      setSaving(false);
    }
  }

  const total = draft.variants.reduce((a, v) => a + v.stock, 0);

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.25)", backdropFilter: "blur(3px)" }} />
      <div role="dialog" aria-label={draft.id ? `Editar ${draft.name}` : "Novo produto"} style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "min(500px, 100vw)", zIndex: 50,
        background: "var(--bg)", borderLeft: "1px solid var(--border)",
        boxShadow: "-8px 0 48px rgba(0,0,0,0.14)", overflowY: "auto", fontFamily: UI,
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${draft.hue}3a 0%, #190a58 60%, #0b1e66 100%)`,
          padding: "22px 24px 18px", position: "relative",
        }}>
          <button onClick={onClose} aria-label="Fechar" style={{
            position: "absolute", top: 16, right: 16, width: 32, height: 32, borderRadius: 8,
            background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}><X size={15} color="rgba(255,255,255,0.8)" /></button>
          <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "0.14em", textTransform: "uppercase", margin: 0 }}>
            {draft.id ? "Editando produto" : "Novo produto"}
          </p>
          <p style={{ fontSize: 17, fontWeight: 800, color: "#fff", margin: "4px 0 0", paddingRight: 44 }}>
            {draft.name || "Sem nome ainda"}
          </p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", margin: "6px 0 0" }}>
            {total} {total === 1 ? "peça em estoque" : "peças em estoque"}
          </p>
        </div>

        <div style={{ padding: "20px 24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
          <Field id="pd-name" label="Nome do produto" required>
            <input id="pd-name" className="pi" value={draft.name} maxLength={80} autoFocus
              placeholder="Ex.: Conjunto Moletom Infantil"
              onChange={e => set({ name: e.target.value })} style={inputStyle} />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field id="pd-cat" label="Categoria">
              <input id="pd-cat" className="pi" value={draft.category} maxLength={40}
                placeholder="Conjuntos" onChange={e => set({ category: e.target.value })} style={inputStyle} />
            </Field>
            <Field id="pd-price" label="Preço de venda" required>
              <input id="pd-price" className="pi" inputMode="decimal" value={priceText} placeholder="R$ 0,00"
                onChange={e => { setPriceText(e.target.value); set({ priceCents: parseMoney(e.target.value) }); }}
                onBlur={() => setPriceText(centsToInput(draft.priceCents))}
                style={{ ...inputStyle, fontFamily: MONO }} />
            </Field>
          </div>

          {/* Grade */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-2)", margin: "0 0 8px" }}>
              Tamanhos e estoque <span style={{ color: "var(--accent)" }}>*</span>
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: "var(--text-3)", alignSelf: "center" }}>Grade pronta:</span>
              {Object.keys(SIZE_PRESETS).map(k => (
                <button key={k} type="button" onClick={() => applyPreset(k)} style={{
                  fontFamily: UI, fontSize: 11, fontWeight: 600, cursor: "pointer",
                  padding: "5px 10px", borderRadius: 7,
                  background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-2)",
                }}>{k}</button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {draft.variants.map((v, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 90px 36px", gap: 6, alignItems: "center" }}>
                  <input aria-label={`Tamanho ${i + 1}`} className="pi" value={v.size} maxLength={20} placeholder="Tam."
                    onChange={e => setVariants(draft.variants.map((x, j) => j === i ? { ...x, size: e.target.value } : x))}
                    style={{ ...inputStyle, fontSize: 12, textAlign: "center", fontFamily: MONO }} />
                  <input aria-label={`Cor ${i + 1}`} className="pi" value={v.color} maxLength={30} placeholder="Cor (opcional)"
                    onChange={e => setVariants(draft.variants.map((x, j) => j === i ? { ...x, color: e.target.value } : x))}
                    style={{ ...inputStyle, fontSize: 12 }} />
                  <input aria-label={`Estoque ${i + 1}`} className="pi" inputMode="numeric" value={v.stock}
                    onChange={e => setVariants(draft.variants.map((x, j) =>
                      j === i ? { ...x, stock: Math.max(0, parseInt(e.target.value.replace(/\D/g, "") || "0", 10)) } : x))}
                    style={{ ...inputStyle, fontSize: 12, textAlign: "center", fontFamily: MONO }} />
                  <button type="button" aria-label="Remover tamanho"
                    onClick={() => setVariants(draft.variants.filter((_, j) => j !== i))}
                    disabled={draft.variants.length <= 1}
                    style={{
                      width: 36, height: 36, borderRadius: 8, cursor: "pointer",
                      background: "var(--surface-2)", border: "1px solid var(--border)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      opacity: draft.variants.length <= 1 ? 0.3 : 1,
                    }}><Trash2 size={13} color="var(--red)" /></button>
                </div>
              ))}
              <button type="button" onClick={() => setVariants([...draft.variants,
                { id: "", size: "", color: "", sku: "", stock: 0, position: draft.variants.length }])}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  fontFamily: UI, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  color: "var(--accent)", background: "transparent",
                  border: "1px dashed var(--border-hi)", borderRadius: 8, padding: "9px 14px",
                }}><Plus size={13} /> Adicionar tamanho</button>
            </div>
            <p style={{ fontSize: 11, color: "var(--text-3)", margin: "8px 0 0", lineHeight: 1.5 }}>
              Tamanho sem estoque aparece riscado na loja, em vez de sumir.
            </p>
          </div>

          <ImageField value={draft.images} onChange={images => set({ images })} />

          <Field id="pd-desc" label="Descrição" counter={`${draft.description.length}/600`}>
            <textarea id="pd-desc" className="pi" value={draft.description} maxLength={600} rows={3}
              placeholder="Tecido, caimento, cuidados."
              onChange={e => set({ description: e.target.value })}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field id="pd-sku" label="Código / SKU">
              <input id="pd-sku" className="pi" value={draft.sku} maxLength={40} placeholder="LK-001"
                onChange={e => set({ sku: e.target.value })} style={{ ...inputStyle, fontFamily: MONO, fontSize: 12.5 }} />
            </Field>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-2)", margin: "0 0 6px" }}>Cor do cartão</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {PRODUCT_HUES.map(h => (
                  <button key={h} type="button" onClick={() => set({ hue: h })} aria-label={`Cor ${h}`} aria-pressed={draft.hue === h}
                    style={{
                      width: 24, height: 24, borderRadius: "50%", cursor: "pointer", background: h,
                      border: draft.hue === h ? "2.5px solid var(--text-1)" : "1px solid rgba(0,0,0,0.12)",
                    }} />
                ))}
              </div>
            </div>
          </div>

          <label style={{
            display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "12px 14px",
          }}>
            <input type="checkbox" checked={draft.active} onChange={e => set({ active: e.target.checked })} />
            <span style={{ flex: 1 }}>
              <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>Visível na loja</span>
              <span style={{ display: "block", fontSize: 11.5, color: "var(--text-2)", marginTop: 2 }}>
                Desmarque para tirar do ar sem apagar o cadastro.
              </span>
            </span>
          </label>

          {error && (
            <p style={{
              fontSize: 12.5, color: "var(--red)", margin: 0,
              background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.2)",
              borderRadius: 9, padding: "10px 12px",
            }}>{error}</p>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={save} disabled={saving} style={{
              flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
              fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer",
              color: "#fff", background: "var(--accent)", border: "none",
              borderRadius: 10, padding: "14px", minHeight: 48,
              boxShadow: "0 4px 14px rgba(124,63,237,0.25)",
            }}>
              {saving && <Loader2 size={14} className="sp" />}
              {draft.id ? "Salvar alterações" : "Cadastrar produto"}
            </button>
            {draft.id && (
              <button onClick={remove} disabled={saving} title="Remover produto" style={{
                width: 48, height: 48, borderRadius: 10, flexShrink: 0, cursor: "pointer",
                background: "var(--surface)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}><Trash2 size={15} color="var(--red)" /></button>
            )}
          </div>
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
