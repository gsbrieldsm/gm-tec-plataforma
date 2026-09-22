import { ShoppingBag, Shirt, MessageCircle, Mail, AtSign, MapPin } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { totalStock } from "@/lib/catalog";
import {
  FONT_STACKS, RADIUS, readableOn,
  type BrandSettings, type StoreSettings,
} from "@/lib/tenant-settings";

const THEMES = {
  light: { bg: "#faf9f7", surface: "#ffffff", text: "#161616", muted: "#6b6b6b", border: "rgba(0,0,0,0.08)" },
  dark:  { bg: "#0e0e11", surface: "#17171b", text: "#f3f3f3", muted: "#9a9aa2", border: "rgba(255,255,255,0.09)" },
};

function fmtBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function whatsappLink(raw: string, text: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) return null;
  const full = digits.length <= 11 ? `55${digits}` : digits;
  return `https://wa.me/${full}?text=${encodeURIComponent(text)}`;
}

type Props = {
  brand: BrandSettings;
  store: StoreSettings;
  /** Usado quando o lojista ainda não deu nome à loja. */
  fallbackName: string;
  products: readonly Product[];
  /** Dentro da prévia das configurações: links inertes. */
  preview?: boolean;
  /** Dono vendo a própria loja antes de publicar. */
  draft?: boolean;
};

export function StorefrontView({ brand, store, fallbackName, products, preview, draft }: Props) {
  const t = THEMES[brand.theme];
  const r = RADIUS[brand.radius];
  const heading = FONT_STACKS[brand.font];
  const body = brand.font === "elegante" ? FONT_STACKS.classica : heading;
  const onPrimary = readableOn(brand.primary);
  const name = brand.storeName || fallbackName;
  const visible = products.filter(p => p.active);
  const wa = (text: string) => whatsappLink(store.whatsapp, text);
  const ig = store.instagram.replace(/^@/, "");

  const btn = (primary: boolean): React.CSSProperties => ({
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    fontFamily: body, fontSize: 14, fontWeight: 600,
    padding: "12px 22px", borderRadius: r.button, textDecoration: "none",
    background: primary ? brand.primary : "transparent",
    color: primary ? onPrimary : t.text,
    border: primary ? `1px solid ${brand.primary}` : `1px solid ${t.border}`,
    cursor: "pointer", whiteSpace: "nowrap",
  });

  return (
    <div
      className="sf-root"
      style={{
        background: t.bg, color: t.text, fontFamily: body,
        minHeight: preview ? undefined : "100vh",
        pointerEvents: preview ? "none" : undefined,
        containerType: "inline-size",
      }}
    >
      <style>{`
        .sf-wrap { width: 100%; max-width: 1120px; margin: 0 auto; padding-inline: 20px; box-sizing: border-box; }
        .sf-grid { display: grid; gap: 18px; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
        .sf-hero-title { font-size: 48px; }
        @container (max-width: 640px) {
          .sf-nav { display: none !important; }
          .sf-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
          .sf-hero-title { font-size: 30px; }
          .sf-hero { padding-block: 40px 36px !important; }
          .sf-card-btn { padding: 9px 10px !important; font-size: 12px !important; }
        }
      `}</style>

      {draft && (
        <div style={{
          background: "#fef3c7", color: "#78350f", fontSize: 13, fontWeight: 500,
          padding: "10px 16px", textAlign: "center",
        }}>
          Rascunho — só você está vendo. Publique em Configurações → Loja online.
        </div>
      )}

      {store.announcement && (
        <div style={{
          background: brand.primary, color: onPrimary,
          fontSize: 12.5, fontWeight: 500, letterSpacing: "0.02em",
          padding: "9px 16px", textAlign: "center",
        }}>
          {store.announcement}
        </div>
      )}

      {/* Header */}
      <header style={{ borderBottom: `1px solid ${t.border}`, background: t.surface }}>
        <div className="sf-wrap" style={{ display: "flex", alignItems: "center", gap: 20, height: 68 }}>
          {brand.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.logo} alt={name} style={{ height: 38, width: "auto", maxWidth: 160, objectFit: "contain" }} />
          ) : (
            <span style={{ fontFamily: heading, fontSize: 21, fontWeight: 700, letterSpacing: "-0.02em" }}>{name}</span>
          )}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 22 }}>
            <nav className="sf-nav" style={{ display: "flex", gap: 22, fontSize: 14 }}>
              <a href="#colecao" style={{ color: t.text, textDecoration: "none" }}>Coleção</a>
              {store.about && <a href="#sobre" style={{ color: t.text, textDecoration: "none" }}>Sobre</a>}
              <a href="#contato" style={{ color: t.text, textDecoration: "none" }}>Contato</a>
            </nav>
            <span aria-label="Sacola" style={{
              width: 40, height: 40, borderRadius: r.button,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: `1px solid ${t.border}`,
            }}>
              <ShoppingBag size={17} />
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="sf-hero" style={{
        background: `linear-gradient(160deg, ${brand.accent}33 0%, ${brand.accent}0f 55%, transparent 100%)`,
        paddingBlock: "72px 64px",
      }}>
        <div className="sf-wrap">
          <p style={{
            fontSize: 12, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase",
            color: t.muted, margin: "0 0 14px",
          }}>{name}</p>
          <h1 className="sf-hero-title" style={{
            fontFamily: heading, fontWeight: brand.font === "elegante" ? 500 : 700,
            lineHeight: 1.08, letterSpacing: "-0.025em",
            margin: 0, maxWidth: 680, textWrap: "balance",
          }}>
            {brand.tagline || "Peças escolhidas a dedo, direto para você."}
          </h1>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 28 }}>
            <a href="#colecao" style={btn(true)}>Ver coleção</a>
            {wa("Olá! Vim pela loja online.") && (
              <a href={wa("Olá! Vim pela loja online.")!} target="_blank" rel="noreferrer" style={btn(false)}>
                <MessageCircle size={16} /> Falar no WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Coleção */}
      <section id="colecao" style={{ paddingBlock: "48px 56px" }}>
        <div className="sf-wrap">
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 22 }}>
            <h2 style={{ fontFamily: heading, fontSize: 26, fontWeight: brand.font === "elegante" ? 500 : 700, margin: 0, letterSpacing: "-0.02em" }}>
              Coleção
            </h2>
            <span style={{ fontSize: 13, color: t.muted }}>{visible.length} peças</span>
          </div>

          <div className="sf-grid">
            {visible.map(p => {
              const out = totalStock(p) === 0;
              const link = wa(`Olá! Tenho interesse em ${p.name} (${p.sku}).`);
              return (
                <article key={p.id} style={{
                  background: t.surface, border: `1px solid ${t.border}`,
                  borderRadius: r.card, overflow: "hidden",
                  display: "flex", flexDirection: "column",
                }}>
                  <div style={{
                    position: "relative", aspectRatio: "4 / 5",
                    background: `linear-gradient(160deg, ${p.hue}2e 0%, ${p.hue}0d 100%)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Shirt size={44} strokeWidth={1.2} color={`${p.hue}99`} />
                    {out && (
                      <span style={{
                        position: "absolute", top: 10, left: 10,
                        fontSize: 11, fontWeight: 600, padding: "4px 9px",
                        borderRadius: r.button, background: t.surface, color: t.muted,
                        border: `1px solid ${t.border}`,
                      }}>Esgotado</span>
                    )}
                  </div>
                  <div style={{ padding: "14px 14px 16px", display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                    <span style={{ fontSize: 11.5, color: t.muted }}>{p.category}</span>
                    <h3 style={{ fontSize: 14.5, fontWeight: 600, margin: 0, lineHeight: 1.3 }}>{p.name}</h3>
                    <span style={{ fontSize: 15, fontWeight: 700, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
                      {fmtBRL(p.price)}
                    </span>
                    <div style={{ marginTop: "auto", paddingTop: 12 }}>
                      {out ? (
                        <span className="sf-card-btn" style={{ ...btn(false), width: "100%", boxSizing: "border-box", color: t.muted, cursor: "default" }}>
                          Esgotado
                        </span>
                      ) : link ? (
                        <a href={link} target="_blank" rel="noreferrer" className="sf-card-btn"
                          style={{ ...btn(true), width: "100%", boxSizing: "border-box" }}>
                          Quero esta
                        </a>
                      ) : (
                        <span className="sf-card-btn" style={{ ...btn(false), width: "100%", boxSizing: "border-box", color: t.muted, cursor: "default" }}>
                          Compra online em breve
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {store.about && (
        <section id="sobre" style={{ paddingBlock: "48px", background: t.surface, borderBlock: `1px solid ${t.border}` }}>
          <div className="sf-wrap" style={{ maxWidth: 720 }}>
            <h2 style={{ fontFamily: heading, fontSize: 24, fontWeight: brand.font === "elegante" ? 500 : 700, margin: "0 0 14px" }}>
              Sobre a {name}
            </h2>
            <p style={{ fontSize: 15.5, lineHeight: 1.7, color: t.muted, margin: 0, whiteSpace: "pre-line" }}>{store.about}</p>
          </div>
        </section>
      )}

      {/* Rodapé */}
      <footer id="contato" style={{ paddingBlock: "40px 32px" }}>
        <div className="sf-wrap" style={{ display: "flex", flexWrap: "wrap", gap: 28, justifyContent: "space-between" }}>
          <div style={{ minWidth: 180 }}>
            <p style={{ fontFamily: heading, fontSize: 18, fontWeight: 700, margin: "0 0 6px" }}>{name}</p>
            {store.city && (
              <p style={{ fontSize: 13, color: t.muted, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                <MapPin size={13} /> {store.city}
              </p>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13.5 }}>
            {wa("Olá!") && (
              <a href={wa("Olá!")!} target="_blank" rel="noreferrer" style={{ color: t.text, textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
                <MessageCircle size={14} /> {store.whatsapp}
              </a>
            )}
            {store.email && (
              <a href={`mailto:${store.email}`} style={{ color: t.text, textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
                <Mail size={14} /> {store.email}
              </a>
            )}
            {ig && (
              <a href={`https://www.instagram.com/${encodeURIComponent(ig)}`} target="_blank" rel="noreferrer" style={{ color: t.text, textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
                <AtSign size={14} /> {ig}
              </a>
            )}
          </div>
        </div>
        <div className="sf-wrap" style={{
          marginTop: 28, paddingTop: 18, borderTop: `1px solid ${t.border}`,
          display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "space-between",
          fontSize: 12, color: t.muted,
        }}>
          <span>{store.document ? `CNPJ/CPF ${store.document}` : `© ${name}`}</span>
          <span>Loja criada com GM &amp; Co Tec</span>
        </div>
      </footer>
    </div>
  );
}
