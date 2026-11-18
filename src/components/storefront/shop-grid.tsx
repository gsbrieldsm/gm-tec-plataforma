"use client";

import { useEffect, useMemo, useState } from "react";
import { Shirt, X, ShoppingBag, MessageCircle, ChevronLeft, ChevronRight, Tag, Trash2 } from "lucide-react";
import { fmtCents, installment } from "@/lib/money";
import type { ShopItem } from "./storefront-view";

export type ShopUI = {
  surface: string; text: string; muted: string; border: string;
  primary: string; onPrimary: string;
  card: number; button: number;
  heading: string; body: string;
};

export type ResellerView = {
  name: string;
  company: string;
  status: string;
  discountPct: number;
} | null;

type CartLine = { key: string; id: string; name: string; size: string; priceCents: number; qty: number };

const price = (cents: number, pct: number) =>
  pct > 0 ? Math.round((cents * (100 - pct)) / 100) : cents;

type Props = {
  products: readonly ShopItem[];
  ui: ShopUI;
  whatsapp: string | null;
  reseller: ResellerView;
  preview?: boolean;
  storeName: string;
};

export function ShopGrid({ products, ui, whatsapp, reseller, preview, storeName }: Props) {
  const pct = reseller?.status === "ativo" ? reseller.discountPct : 0;
  const [open, setOpen] = useState<ShopItem | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);

  const total = useMemo(() => cart.reduce((a, l) => a + l.priceCents * l.qty, 0), [cart]);
  const pieces = useMemo(() => cart.reduce((a, l) => a + l.qty, 0), [cart]);

  function add(p: ShopItem, size: string, qty: number) {
    const key = `${p.id}|${size}`;
    setCart(c => {
      const i = c.findIndex(l => l.key === key);
      if (i < 0) return [...c, { key, id: p.id, name: p.name, size, priceCents: price(p.priceCents, pct), qty }];
      const next = [...c];
      next[i] = { ...next[i], qty: next[i].qty + qty };
      return next;
    });
    setOpen(null);
  }

  const waHref = useMemo(() => {
    if (!whatsapp || !cart.length) return null;
    const digits = whatsapp.replace(/\D/g, "");
    if (digits.length < 10) return null;
    const full = digits.length <= 11 ? `55${digits}` : digits;

    const lines = cart.map(l =>
      `• ${l.name}${l.size ? ` — Tam ${l.size}` : ""} — ${l.qty}x ${fmtCents(l.priceCents)}`);
    const msg = [
      `Olá! Quero fechar este pedido pela loja ${storeName}.`,
      "",
      ...lines,
      "",
      `Total: ${fmtCents(total)}`,
      pct > 0 ? `(Lojista ${reseller?.name} — atacado ${pct}% já aplicado)` : "",
    ].filter(Boolean).join("\n");

    return `https://wa.me/${full}?text=${encodeURIComponent(msg)}`;
  }, [whatsapp, cart, total, pct, reseller, storeName]);

  const visible = products.filter(p => p.active);

  return (
    <>
      <style>{`
        .sg-card { transition: transform .18s ease, box-shadow .18s ease; }
        .sg-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,.09); }
        .sg-card:hover .sg-alt { opacity: 1; }
        .sg-alt { opacity: 0; transition: opacity .25s ease; }
        .sg-thumb { cursor: pointer; }
        @media (prefers-reduced-motion: reduce) {
          .sg-card, .sg-alt { transition: none; }
          .sg-card:hover { transform: none; }
        }
      `}</style>

      <div className="sf-grid">
        {visible.map(p => {
          const out = p.stock === 0;
          const sizes = p.sizes.filter(z => z.label);
          const final = price(p.priceCents, pct);
          const parc = installment(final);
          const photos = p.photos?.length ? p.photos : (p.imageUrl ? [p.imageUrl] : []);

          return (
            <article key={p.id} className="sg-card" style={{
              background: ui.surface, border: `1px solid ${ui.border}`,
              borderRadius: ui.card, overflow: "hidden",
              display: "flex", flexDirection: "column",
            }}>
              <div
                className="sg-thumb"
                onClick={() => !preview && setOpen(p)}
                style={{
                  position: "relative", aspectRatio: "4 / 5",
                  background: photos.length ? ui.surface
                    : `linear-gradient(160deg, ${p.hue}2e 0%, ${p.hue}0d 100%)`,
                  display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
                }}>
                {photos.length ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photos[0]} alt={p.name} loading="lazy"
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    {photos[1] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photos[1]} alt="" aria-hidden className="sg-alt" loading="lazy"
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                    )}
                  </>
                ) : (
                  <Shirt size={44} strokeWidth={1.2} color={`${p.hue}99`} />
                )}

                {out && (
                  <span style={badge(ui)}>Esgotado</span>
                )}
                {!out && pct > 0 && (
                  <span style={{ ...badge(ui), background: ui.primary, color: ui.onPrimary, border: "none",
                    display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <Tag size={10} /> -{pct}% atacado
                  </span>
                )}
                {photos.length > 1 && (
                  <span style={{
                    position: "absolute", bottom: 10, right: 10, fontSize: 10.5, fontWeight: 600,
                    padding: "3px 7px", borderRadius: 999, background: "rgba(0,0,0,.55)", color: "#fff",
                  }}>{photos.length} fotos</span>
                )}
              </div>

              <div style={{ padding: "14px 14px 16px", display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                {p.category && <span style={{ fontSize: 11.5, color: ui.muted }}>{p.category}</span>}
                <h3 style={{ fontSize: 14.5, fontWeight: 600, margin: 0, lineHeight: 1.3 }}>{p.name}</h3>

                {sizes.length > 0 && (
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
                    {sizes.map(sz => (
                      <span key={sz.label} style={sizePill(ui, sz.stock > 0)}>{sz.label}</span>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: 8, display: "flex", alignItems: "baseline", gap: 7, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                    {fmtCents(final)}
                  </span>
                  {pct > 0 && (
                    <span style={{ fontSize: 12, color: ui.muted, textDecoration: "line-through",
                      fontVariantNumeric: "tabular-nums" }}>{fmtCents(p.priceCents)}</span>
                  )}
                </div>
                {parc && (
                  <span style={{ fontSize: 11.5, color: ui.muted, fontVariantNumeric: "tabular-nums" }}>
                    ou {parc.n}x de {fmtCents(parc.cents)}
                  </span>
                )}

                <div style={{ marginTop: "auto", paddingTop: 12 }}>
                  <button type="button" disabled={out || preview}
                    onClick={() => setOpen(p)}
                    className="sf-card-btn"
                    style={{ ...btnStyle(ui, !out), width: "100%", boxSizing: "border-box",
                      color: out ? ui.muted : ui.onPrimary, cursor: out ? "default" : "pointer" }}>
                    {out ? "Esgotado" : "Ver peça"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {open && <Detail p={open} ui={ui} pct={pct} onClose={() => setOpen(null)} onAdd={add} />}

      {cart.length > 0 && !preview && (
        <CartBar ui={ui} cart={cart} pieces={pieces} total={total} waHref={waHref}
          onRemove={k => setCart(c => c.filter(l => l.key !== k))} />
      )}
    </>
  );
}

/* ----------------------------------------------------------------- peça */

function Detail({ p, ui, pct, onClose, onAdd }: {
  p: ShopItem; ui: ShopUI; pct: number;
  onClose: () => void;
  onAdd: (p: ShopItem, size: string, qty: number) => void;
}) {
  const photos = p.photos?.length ? p.photos : (p.imageUrl ? [p.imageUrl] : []);
  const sizes = p.sizes.filter(z => z.label);
  const [shot, setShot] = useState(0);
  const [size, setSize] = useState(() => sizes.find(s => s.stock > 0)?.label ?? "");
  const [qty, setQty] = useState(1);
  const final = price(p.priceCents, pct);
  const parc = installment(final);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, [onClose]);

  const needsSize = sizes.length > 0 && !size;

  return (
    <div onClick={onClose} role="dialog" aria-modal aria-label={p.name}
      style={{
        position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,.6)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: ui.surface, color: ui.text, borderRadius: ui.card, overflow: "hidden",
        width: "100%", maxWidth: 860, maxHeight: "92vh", overflowY: "auto",
        display: "grid", gridTemplateColumns: "minmax(0,1fr)", position: "relative",
      }} className="sg-detail">
        <style>{`
          @media (min-width: 740px) { .sg-detail { grid-template-columns: 1fr 1fr !important; } }
        `}</style>

        <button type="button" onClick={onClose} aria-label="Fechar" style={{
          position: "absolute", top: 12, right: 12, zIndex: 2,
          width: 34, height: 34, borderRadius: 999, cursor: "pointer",
          background: ui.surface, border: `1px solid ${ui.border}`, color: ui.text,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}><X size={16} /></button>

        {/* galeria */}
        <div style={{ background: `${p.hue}0f` }}>
          <div style={{ position: "relative", aspectRatio: "4 / 5", overflow: "hidden" }}>
            {photos.length ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photos[shot]} alt={p.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Shirt size={60} strokeWidth={1.1} color={`${p.hue}99`} />
              </div>
            )}
            {photos.length > 1 && (
              <>
                <button type="button" aria-label="Foto anterior"
                  onClick={() => setShot(s => (s - 1 + photos.length) % photos.length)}
                  style={arrow(ui, "left")}><ChevronLeft size={18} /></button>
                <button type="button" aria-label="Próxima foto"
                  onClick={() => setShot(s => (s + 1) % photos.length)}
                  style={arrow(ui, "right")}><ChevronRight size={18} /></button>
              </>
            )}
          </div>
          {photos.length > 1 && (
            <div style={{ display: "flex", gap: 7, padding: 12, overflowX: "auto" }}>
              {photos.map((src, i) => (
                <button key={src + i} type="button" onClick={() => setShot(i)}
                  aria-label={`Foto ${i + 1}`}
                  style={{
                    flexShrink: 0, width: 52, aspectRatio: "4 / 5", padding: 0, cursor: "pointer",
                    borderRadius: 7, overflow: "hidden", background: "none",
                    border: `2px solid ${i === shot ? ui.primary : ui.border}`,
                  }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* dados */}
        <div style={{ padding: "26px 24px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          {p.category && <span style={{ fontSize: 11.5, color: ui.muted, letterSpacing: ".04em",
            textTransform: "uppercase", fontWeight: 600 }}>{p.category}</span>}
          <h2 style={{ fontFamily: ui.heading, fontSize: 24, fontWeight: 700, margin: 0,
            lineHeight: 1.2, letterSpacing: "-.02em", textWrap: "balance" }}>{p.name}</h2>

          <div style={{ display: "flex", alignItems: "baseline", gap: 9, flexWrap: "wrap" }}>
            <span style={{ fontSize: 26, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
              {fmtCents(final)}
            </span>
            {pct > 0 && (
              <>
                <span style={{ fontSize: 14, color: ui.muted, textDecoration: "line-through",
                  fontVariantNumeric: "tabular-nums" }}>{fmtCents(p.priceCents)}</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999,
                  background: ui.primary, color: ui.onPrimary }}>-{pct}% atacado</span>
              </>
            )}
          </div>
          {parc && <span style={{ fontSize: 12.5, color: ui.muted, fontVariantNumeric: "tabular-nums" }}>
            ou {parc.n}x de {fmtCents(parc.cents)}
          </span>}

          {p.description && (
            <p style={{ fontSize: 14, lineHeight: 1.65, color: ui.muted, margin: 0, whiteSpace: "pre-line" }}>
              {p.description}
            </p>
          )}

          {sizes.length > 0 && (
            <div>
              <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".05em",
                textTransform: "uppercase", color: ui.muted }}>Tamanho</span>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 8 }}>
                {sizes.map(sz => {
                  const on = sz.label === size;
                  const dead = sz.stock === 0;
                  return (
                    <button key={sz.label} type="button" disabled={dead}
                      onClick={() => setSize(sz.label)}
                      style={{
                        fontSize: 13, fontWeight: 600, padding: "9px 14px", borderRadius: ui.button,
                        cursor: dead ? "not-allowed" : "pointer",
                        background: on ? ui.primary : "transparent",
                        color: on ? ui.onPrimary : dead ? ui.muted : ui.text,
                        border: `1px solid ${on ? ui.primary : ui.border}`,
                        opacity: dead ? .45 : 1,
                        textDecoration: dead ? "line-through" : "none",
                      }}>{sz.label}</button>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".05em",
              textTransform: "uppercase", color: ui.muted }}>Qtd</span>
            <div style={{ display: "flex", alignItems: "center", border: `1px solid ${ui.border}`,
              borderRadius: ui.button, overflow: "hidden" }}>
              <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Menos"
                style={stepper(ui)}>−</button>
              <span style={{ minWidth: 34, textAlign: "center", fontSize: 14, fontWeight: 600,
                fontVariantNumeric: "tabular-nums" }}>{qty}</span>
              <button type="button" onClick={() => setQty(q => Math.min(99, q + 1))} aria-label="Mais"
                style={stepper(ui)}>+</button>
            </div>
          </div>

          <button type="button" disabled={needsSize}
            onClick={() => onAdd(p, size, qty)}
            style={{ ...btnStyle(ui, true), marginTop: 8, width: "100%", boxSizing: "border-box",
              opacity: needsSize ? .5 : 1, cursor: needsSize ? "not-allowed" : "pointer" }}>
            <ShoppingBag size={16} /> {needsSize ? "Escolha o tamanho" : "Adicionar à sacola"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- sacola */

function CartBar({ ui, cart, pieces, total, waHref, onRemove }: {
  ui: ShopUI; cart: CartLine[]; pieces: number; total: number;
  waHref: string | null; onRemove: (key: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 50 }}>
      {show && (
        <div style={{
          background: ui.surface, borderTop: `1px solid ${ui.border}`,
          maxHeight: "46vh", overflowY: "auto", padding: "14px 20px",
        }}>
          <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", flexDirection: "column", gap: 9 }}>
            {cart.map(l => (
              <div key={l.key} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5 }}>
                <span style={{ flex: 1 }}>
                  {l.name}{l.size ? ` — Tam ${l.size}` : ""}
                </span>
                <span style={{ color: ui.muted, fontVariantNumeric: "tabular-nums" }}>
                  {l.qty}× {fmtCents(l.priceCents)}
                </span>
                <button type="button" onClick={() => onRemove(l.key)} aria-label={`Remover ${l.name}`}
                  style={{ background: "none", border: "none", cursor: "pointer", color: ui.muted, padding: 4 }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{
        background: ui.surface, borderTop: `1px solid ${ui.border}`,
        boxShadow: "0 -6px 24px rgba(0,0,0,.10)", padding: "12px 20px",
      }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", alignItems: "center",
          gap: 12, flexWrap: "wrap" }}>
          <button type="button" onClick={() => setShow(s => !s)}
            style={{ background: "none", border: "none", cursor: "pointer", color: ui.text,
              display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, padding: 0 }}>
            <ShoppingBag size={17} />
            {pieces} {pieces === 1 ? "peça" : "peças"}
            <span style={{ color: ui.muted, fontWeight: 500 }}>· {fmtCents(total)}</span>
          </button>
          <div style={{ marginLeft: "auto" }}>
            {waHref ? (
              <a href={waHref} target="_blank" rel="noreferrer" style={btnStyle(ui, true)}>
                <MessageCircle size={16} /> Fechar no WhatsApp
              </a>
            ) : (
              <span style={{ ...btnStyle(ui, false), color: ui.muted, cursor: "default" }}>
                Loja sem WhatsApp cadastrado
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- estilo */

const badge = (ui: ShopUI): React.CSSProperties => ({
  position: "absolute", top: 10, left: 10,
  fontSize: 11, fontWeight: 600, padding: "4px 9px",
  borderRadius: ui.button === 999 ? 999 : 6,
  background: ui.surface, color: ui.muted, border: `1px solid ${ui.border}`,
});

const sizePill = (ui: ShopUI, live: boolean): React.CSSProperties => ({
  fontSize: 10.5, fontWeight: 600, lineHeight: 1,
  padding: "4px 7px", borderRadius: ui.button === 999 ? 999 : 5,
  border: `1px solid ${live ? ui.border : "transparent"}`,
  color: live ? ui.text : ui.muted,
  opacity: live ? 1 : 0.45,
  textDecoration: live ? "none" : "line-through",
});

const btnStyle = (ui: ShopUI, primary: boolean): React.CSSProperties => ({
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
  fontFamily: ui.body, fontSize: 14, fontWeight: 600,
  padding: "12px 22px", borderRadius: ui.button, textDecoration: "none",
  background: primary ? ui.primary : "transparent",
  color: primary ? ui.onPrimary : ui.text,
  border: primary ? `1px solid ${ui.primary}` : `1px solid ${ui.border}`,
  cursor: "pointer", whiteSpace: "nowrap",
});

const arrow = (ui: ShopUI, side: "left" | "right"): React.CSSProperties => ({
  position: "absolute", top: "50%", transform: "translateY(-50%)",
  [side]: 10, width: 34, height: 34, borderRadius: 999, cursor: "pointer",
  background: ui.surface, border: `1px solid ${ui.border}`, color: ui.text,
  display: "flex", alignItems: "center", justifyContent: "center",
});

const stepper = (ui: ShopUI): React.CSSProperties => ({
  width: 34, height: 34, cursor: "pointer", background: "transparent",
  border: "none", color: ui.text, fontSize: 16, fontWeight: 600, lineHeight: 1,
});
