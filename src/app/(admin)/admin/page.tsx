"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const UI   = "var(--font-space), var(--font-geist-sans), sans-serif";
const MONO = "var(--font-space-mono), var(--font-geist-mono), monospace";

/* ── Utilities ────────────────────────────────────────────────────── */
function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

/* ── Sparkline ────────────────────────────────────────────────────── */
function Spark({ color, up }: { color: string; up: boolean }) {
  const p = up
    ? "M0 20 L10 16 L20 18 L30 11 L40 9 L50 4 L60 1"
    : "M0 1 L10 6 L20 4 L30 9 L40 11 L50 15 L60 19";
  return (
    <svg viewBox="0 0 60 22" style={{ width: 70, height: 26, flexShrink: 0 }}>
      <path d={p} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/* ── Bar chart ────────────────────────────────────────────────────── */
function BarChart() {
  const vals = [480, 320, 650, 420, 890, 560, 340, 720, 890, 1020, 760, 540, 680, 920, 1100, 840, 1210];
  const lbls = ["1", "", "", "4", "", "", "7", "", "", "10", "", "", "13", "", "15", "", "17"];
  const max  = Math.max(...vals);
  const W = 340, H = 88;
  return (
    <svg viewBox={`0 0 ${W} ${H + 18}`} style={{ width: "100%", height: H + 18 }}>
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c3fed" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.35"/>
        </linearGradient>
      </defs>
      {vals.map((v, i) => {
        const h   = (v / max) * H;
        const x   = i * (W / vals.length) + 2;
        const bw  = W / vals.length - 4;
        const cur = i === vals.length - 1;
        return (
          <g key={i}>
            <rect x={x} y={H - h} width={bw} height={h}
              fill={cur ? "#7c3fed" : "url(#bg)"} rx={2}
              opacity={cur ? 1 : 0.7}/>
            {lbls[i] && (
              <text x={x + bw / 2} y={H + 14} textAnchor="middle"
                fontSize="7.5" fill="var(--text-3)" fontFamily={UI}>{lbls[i]}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ── Channel illustration ──────────────────────────────────────────── */
function ChannelIllustration() {
  const nodes = [
    { l: "Shopee", c: "#EE4D2D", x: 26, y: 30 },
    { l: "ML",     c: "#FFCC00", x: 158, y: 26 },
    { l: "AMZ",    c: "#FF9900", x: 170, y: 86 },
    { l: "MGL",    c: "#0086FF", x: 24, y: 120 },
    { l: "AMR",    c: "#EF2C33", x: 90, y: 150 },
  ];
  return (
    <svg viewBox="0 0 196 172" style={{ width: 196, height: 172, flexShrink: 0 }}>
      {/* dashed orbit */}
      <circle cx="92" cy="82" r="54" fill="none"
        stroke="rgba(124,63,237,0.12)" strokeWidth="1" strokeDasharray="4 4"/>
      <circle cx="92" cy="82" r="40" fill="none"
        stroke="rgba(124,63,237,0.07)" strokeWidth="1" strokeDasharray="3 5"/>
      {/* lines hub → nodes */}
      {nodes.map((n, i) => (
        <line key={i} x1="92" y1="82" x2={n.x} y2={n.y}
          stroke={n.c} strokeWidth="1" opacity="0.25"/>
      ))}
      {/* hub rings */}
      <circle cx="92" cy="82" r="28" fill="rgba(124,63,237,0.07)"/>
      <circle cx="92" cy="82" r="19" fill="rgba(124,63,237,0.13)"/>
      <circle cx="92" cy="82" r="13" fill="#7c3fed"/>
      <text x="92" y="86" textAnchor="middle"
        fontSize="8" fill="white" fontWeight="700" fontFamily={UI}>GM</text>
      {/* channel nodes */}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r="17" fill={n.c}/>
          <circle cx={n.x} cy={n.y} r="17" fill="white" opacity="0.15"/>
          <text x={n.x} y={n.y + 4} textAnchor="middle"
            fontSize="6.5" fill="white" fontWeight="700" fontFamily={UI}>{n.l}</text>
        </g>
      ))}
    </svg>
  );
}

/* ── Data ─────────────────────────────────────────────────────────── */
const METRICS = [
  { label: "Receita do mês",  value: "R$ 12.580", sub: "6 pedidos · Ver relatório →", delta: "+12,5%", up: true,  color: "#7c3fed" },
  { label: "Sessões hoje",    value: "1.842",      sub: "3 visitantes ao vivo",        delta: "+18%",   up: true,  color: "#06b6d4" },
  { label: "Ticket médio",    value: "R$ 547",     sub: "23 pedidos este mês",         delta: "+6,2%",  up: true,  color: "#10b981" },
];

const ACTIONS = [
  { icon: "📦", bold: "6 pedidos",      rest: " para processar",   href: "/admin/pedidos" },
  { icon: "⚠️",  bold: "7 produtos",    rest: " com estoque baixo", href: "/admin/estoque" },
  { icon: "💳", bold: "50+ pagamentos", rest: " a capturar",        href: "/admin/pedidos" },
];

const HERO_TAGS = ["Shopee", "Amazon", "ML", "Analytics", "IA", "Estoque", "Pedidos"];

/* ── Page ─────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { data: session }         = useSession();
  const [time, setTime]           = useState<Date | null>(null);
  const [hoveredAction, setHover] = useState<number | null>(null);
  const [activeMonth, setMonth]   = useState(0);

  const firstName = (session?.user?.name ?? "").trim().split(" ")[0];

  useEffect(() => {
    setTime(new Date());
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeStr = time
    ? time.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "--:--:--";

  const dateStr = time
    ? time.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }) + " · "
    : "";

  return (
    <div style={{ maxWidth: 1100, fontFamily: UI }}>

      {/* ── HERO ──────────────────────────────────────────── */}
      <div className="admin-hero" style={{
        background: "linear-gradient(135deg, #0c0420 0%, #190a58 35%, #0b1e66 68%, #062244 100%)",
        borderRadius: 18,
        padding: "36px 40px 38px",
        position: "relative",
        overflow: "hidden",
        marginBottom: 20,
        minHeight: 168,
      }}>
        {/* Orb 1 — violet */}
        <div style={{
          position: "absolute", width: 380, height: 380, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,63,237,0.5) 0%, transparent 62%)",
          top: -155, right: 70,
          animation: "drift-1 14s ease-in-out infinite",
          pointerEvents: "none",
        }}/>
        {/* Orb 2 — cyan */}
        <div style={{
          position: "absolute", width: 260, height: 260, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6,182,212,0.42) 0%, transparent 62%)",
          bottom: -90, left: 240,
          animation: "drift-2 18s ease-in-out infinite",
          pointerEvents: "none",
        }}/>
        {/* Orb 3 — indigo */}
        <div style={{
          position: "absolute", width: 200, height: 200, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.38) 0%, transparent 60%)",
          top: -20, left: 380,
          animation: "drift-3 11s ease-in-out infinite",
          pointerEvents: "none",
        }}/>

        {/* Floating tech tags */}
        {HERO_TAGS.map((tag, i) => (
          <span key={tag} className="admin-hero-tags" style={{
            position: "absolute",
            fontFamily: UI, fontSize: 8.5, fontWeight: 700,
            color: "rgba(255,255,255,0.18)",
            letterSpacing: "0.16em", textTransform: "uppercase",
            top:   `${[18, 68, 45, 80, 28, 60, 15][i]}%`,
            right: `${[8, 16, 32, 24, 44, 52, 62][i]}%`,
            animation: `float-tag ${9 + i * 1.5}s ease-in-out infinite`,
            animationDelay: `${i * 1.2}s`,
            pointerEvents: "none",
          }}>{tag}</span>
        ))}

        {/* breadcrumb */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          marginBottom: 18, position: "relative", zIndex: 1,
        }}>
          <span style={{
            fontFamily: UI, fontSize: 8, fontWeight: 700,
            color: "rgba(157,110,248,0.85)", letterSpacing: "0.22em", textTransform: "uppercase",
          }}>SYS</span>
          <span style={{ width: 14, height: 1, background: "rgba(157,110,248,0.35)" }}/>
          <span style={{
            fontFamily: UI, fontSize: 8, fontWeight: 600,
            color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", textTransform: "uppercase",
          }}>Dashboard</span>
        </div>

        {/* greeting */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{
            fontFamily: UI, fontSize: 30, fontWeight: 600,
            color: "#ffffff", margin: 0,
            letterSpacing: "-0.025em", lineHeight: 1.1,
          }}>{greeting()}{firstName && `, ${firstName}`}.</h1>
          <p style={{
            fontFamily: UI, fontSize: 13, color: "rgba(255,255,255,0.45)",
            margin: "7px 0 0", lineHeight: 1.4,
          }}>
            {dateStr}Aqui está o status da sua loja hoje.
          </p>
        </div>

        {/* live + clock */}
        <div className="admin-hero-clock" style={{
          position: "absolute", top: 36, right: 40, zIndex: 1,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#06b6d4",
            boxShadow: "0 0 10px #06b6d4",
            animation: "pulse-live 2.5s infinite",
            display: "block",
          }}/>
          <span style={{
            fontFamily: UI, fontSize: 9, fontWeight: 700,
            color: "#06b6d4", letterSpacing: "0.14em", textTransform: "uppercase",
          }}>AO VIVO</span>
          <span style={{
            fontFamily: MONO, fontSize: 11.5,
            color: "rgba(255,255,255,0.35)", letterSpacing: "0.05em",
          }}>{timeStr}</span>
        </div>
      </div>

      {/* ── Metric cards ──────────────────────────────────── */}
      <div className="admin-grid-metrics" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
        {METRICS.map((m) => (
          <div key={m.label} style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: "20px 24px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(124,63,237,0.03)",
          }}>
            <div style={{
              fontFamily: UI, fontSize: 9.5, fontWeight: 600,
              color: "var(--text-2)", letterSpacing: "0.12em",
              textTransform: "uppercase", marginBottom: 10,
            }}>{m.label}</div>

            <div style={{
              display: "flex", alignItems: "flex-end",
              justifyContent: "space-between", marginBottom: 10,
            }}>
              <div style={{
                fontFamily: MONO, fontSize: 26, fontWeight: 700,
                color: "var(--text-1)", letterSpacing: "-0.02em", lineHeight: 1,
              }}>{m.value}</div>
              <Spark color={m.color} up={m.up}/>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{
                fontFamily: UI, fontSize: 10.5, fontWeight: 700,
                color: m.up ? "#059669" : "#dc2626",
                background: m.up ? "rgba(5,150,105,0.09)" : "rgba(220,38,38,0.09)",
                padding: "2px 7px", borderRadius: 4,
              }}>{m.delta}</span>
              <span style={{ fontFamily: UI, fontSize: 11, color: "var(--text-2)" }}>
                {m.sub}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Chart + Actions ───────────────────────────────── */}
      <div className="admin-grid-split" style={{ display: "grid", gridTemplateColumns: "1fr 268px", gap: 12, marginBottom: 14 }}>

        {/* Sales bar chart */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "20px 24px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{
                fontFamily: UI, fontSize: 9.5, fontWeight: 600,
                color: "var(--text-2)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 5,
              }}>Vendas — Setembro</div>
              <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.02em" }}>
                R$ 12.580
              </div>
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              {["Set", "Ago", "Jul"].map((m, i) => (
                <button key={m} onClick={() => setMonth(i)} style={{
                  fontFamily: UI, fontSize: 10, fontWeight: 600,
                  color: activeMonth === i ? "#7c3fed" : "var(--text-3)",
                  background: activeMonth === i ? "rgba(124,63,237,0.09)" : "transparent",
                  border: `1px solid ${activeMonth === i ? "rgba(124,63,237,0.22)" : "var(--border)"}`,
                  borderRadius: 6, padding: "4px 10px", cursor: "pointer", transition: "all 0.1s",
                }}>{m}</button>
              ))}
            </div>
          </div>
          <BarChart/>
        </div>

        {/* Actions */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}>
          <div style={{
            padding: "15px 20px",
            borderBottom: "1px solid var(--border-2)",
          }}>
            <div style={{
              fontFamily: UI, fontSize: 9.5, fontWeight: 600,
              color: "var(--text-2)", letterSpacing: "0.12em", textTransform: "uppercase",
            }}>Ações pendentes</div>
          </div>
          {ACTIONS.map((a, i) => (
            <a key={i} href={a.href} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 20px",
              borderBottom: i < ACTIONS.length - 1 ? "1px solid var(--border-2)" : "none",
              textDecoration: "none",
              background: hoveredAction === i ? "var(--surface-2)" : "transparent",
              transition: "background 0.1s",
            }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: "rgba(124,63,237,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, flexShrink: 0,
                }}>{a.icon}</div>
                <div style={{ fontFamily: UI, fontSize: 12.5, color: "var(--text-1)", lineHeight: 1.4 }}>
                  <strong style={{ fontWeight: 600 }}>{a.bold}</strong>
                  <span style={{ color: "var(--text-2)" }}>{a.rest}</span>
                </div>
              </div>
              <span style={{
                color: hoveredAction === i ? "#7c3fed" : "var(--text-3)",
                fontSize: 18, lineHeight: 1, transition: "color 0.1s",
              }}>›</span>
            </a>
          ))}
        </div>
      </div>

      {/* ── Connect channels banner ────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, #f7f3ff 0%, #f0f5ff 100%)",
        border: "1px solid rgba(124,63,237,0.13)",
        borderRadius: 16,
        padding: "28px 36px",
        display: "flex", alignItems: "center", gap: 44,
        boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: UI, fontSize: 8.5, fontWeight: 700,
            color: "#7c3fed", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10,
          }}>NET · CANAIS DE VENDA</div>

          <h3 style={{
            fontFamily: UI, fontSize: 18, fontWeight: 600,
            color: "var(--text-1)", margin: "0 0 9px",
            letterSpacing: "-0.015em", lineHeight: 1.25,
          }}>Conecte seus marketplaces</h3>

          <p style={{
            fontFamily: UI, fontSize: 13, color: "var(--text-2)",
            margin: "0 0 22px", lineHeight: 1.6, maxWidth: 380,
          }}>
            Integre Shopee, Mercado Livre, Amazon e mais em minutos. Gerencie pedidos, estoque e faturamento de todos os canais num único painel.
          </p>

          <a href="/admin/ecommerce/shopee" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontFamily: UI, fontSize: 12.5, fontWeight: 600,
            color: "white", background: "#7c3fed",
            padding: "10px 20px", borderRadius: 9,
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(124,63,237,0.28)",
            transition: "all 0.15s",
            letterSpacing: "0.01em",
          }}>Começar integração →</a>
        </div>

        <ChannelIllustration/>
      </div>

    </div>
  );
}
