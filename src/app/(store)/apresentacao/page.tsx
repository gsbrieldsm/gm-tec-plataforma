"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3, Package, ArrowRight, CheckCircle,
  TrendingUp, Settings, MessageCircle, CreditCard,
  Lightbulb, Factory, GitBranch, Layers, ShoppingBag,
  ChevronDown, ChevronUp, ArrowDown,
} from "lucide-react";

/* ── Design tokens (dark-tech) ──────────────────────── */
const C = {
  bg:      "#07070f",
  bg2:     "#0d0d1c",
  surface: "#12122a",
  card:    "#17173a",
  border:  "rgba(99,102,241,0.15)",
  border2: "rgba(99,102,241,0.32)",
  indigo:  "#6366f1",
  violet:  "#8b5cf6",
  sky:     "#38bdf8",
  text:    "#f1f5f9",
  text2:   "#94a3b8",
  text3:   "#475569",
  green:   "#34d399",
};

const PLATFORMS = [
  { name: "Mercado Livre", color: "#ffe600", text: "#111", short: "ML"  },
  { name: "Shopee",        color: "#f37021", text: "#fff", short: "SH"  },
  { name: "Amazon",        color: "#ff9900", text: "#111", short: "AMZ" },
  { name: "Magalu",        color: "#0086ff", text: "#fff", short: "MGL" },
  { name: "Americanas",    color: "#e11d48", text: "#fff", short: "AME" },
  { name: "OLX",           color: "#7300c8", text: "#fff", short: "OLX" },
  { name: "Shopify",       color: "#96bf48", text: "#fff", short: "SPF" },
  { name: "WooCommerce",   color: "#7f54b3", text: "#fff", short: "WOO" },
];

const FEATURES = [
  { icon: BarChart3,  title: "Relatórios Unificados",    desc: "Dados de todos os canais num único painel. Receita, ticket médio, conversão — sem abrir 8 abas.", color: C.sky    },
  { icon: Package,    title: "Gestão de Pedidos",        desc: "Todos os pedidos centralizados, independente de qual plataforma vieram. Status em tempo real.",    color: C.indigo },
  { icon: CreditCard, title: "Controle de Pagamentos",   desc: "Receita bruta, repasses e comissões por canal. Saiba exatamente o que entra no caixa.",            color: C.violet },
  { icon: Layers,     title: "Integrações Nativas",      desc: "Mercado Livre, Shopee, Amazon, Magalu e mais. Conecte em minutos, sem API manual.",                color: C.sky    },
  { icon: Lightbulb,  title: "Dicas por Plataforma",     desc: "Sugestões específicas para crescer em cada canal — título, foto, frete, pricing.",                color: C.indigo },
  { icon: GitBranch,  title: "Mapeamento de Processos",  desc: "Visualize seu fluxo de produção e identifique gargalos antes que virem atraso na entrega.",       color: C.violet },
  { icon: Factory,    title: "Gestão de Produção",       desc: "Controle o que produz, o que tem em estoque e o que precisa repor — integrado aos pedidos.",      color: C.sky    },
  { icon: TrendingUp, title: "Melhorias Contínuas",      desc: "Análise de desempenho por produto, por canal e por período para decisões mais inteligentes.",      color: C.indigo },
];

const JOURNEY = [
  { emoji: "📦", label: "Tenho um produto",             sub: "Minha loja, meu estoque"             },
  { emoji: "🛒", label: "Quero vender em todo lugar",   sub: "ML, Shopee, Amazon..."               },
  { emoji: "😵", label: "Como gerencio tudo isso?",     sub: "8 abas abertas, relatórios manuais"  },
  { emoji: "⚡", label: "O sistema cuida",              sub: "Um painel. Tudo centralizado.", hl: true },
];

const CYCLE_WORDS = ["Mercado Livre", "Shopee", "Amazon", "Magalu", "todo lugar"];

export default function ApresentacaoPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [wordIdx, setWordIdx]   = useState(0);
  const [wordVis, setWordVis]   = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setWordVis(false);
      setTimeout(() => {
        setWordIdx(i => (i + 1) % CYCLE_WORDS.length);
        setWordVis(true);
      }, 380);
    }, 2400);
    return () => clearInterval(id);
  }, []);

  const faqs = [
    { q: "Preciso saber programar para integrar?",         a: "Não. A integração com cada plataforma é feita em cliques, sem precisar de API manual ou técnico." },
    { q: "Funciona para quem está começando do zero?",     a: "Sim. A plataforma guia o que fazer em cada canal, com sugestões práticas para quem está entrando agora." },
    { q: "Consigo gerenciar vários produtos e variações?", a: "Sim — tamanho, cor, SKU. Cada variação tem estoque e precificação independentes." },
    { q: "E a produção própria, como funciona?",           a: "Você monta seu funil de produção personalizado e o sistema controla cada etapa, alertando atrasos." },
    { q: "Tem integração com Mercado Pago / PIX?",         a: "Sim. Os pagamentos são reconciliados automaticamente com os pedidos de cada canal." },
  ];

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', system-ui, sans-serif; }
        .display { font-family: var(--font-univia), 'DM Sans', system-ui, sans-serif; font-style: italic; }
        .grad { background: linear-gradient(135deg,#818cf8 0%,#38bdf8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .dot-grid { background-image: radial-gradient(circle, rgba(99,102,241,0.07) 1px, transparent 1px); background-size: 28px 28px; }

        /* ── Animated blobs ── */
        @keyframes drift1 {
          0%,100% { transform: translate(0,0) scale(1); }
          33%  { transform: translate(45px,-35px) scale(1.08); }
          66%  { transform: translate(-25px,20px) scale(0.94); }
        }
        @keyframes drift2 {
          0%,100% { transform: translate(0,0) scale(1); }
          40%  { transform: translate(-55px,30px) scale(1.06); }
          75%  { transform: translate(30px,-20px) scale(0.96); }
        }
        @keyframes drift3 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%  { transform: translate(25px,45px) scale(1.05); }
        }
        .blob1 { animation: drift1 9s  ease-in-out infinite; }
        .blob2 { animation: drift2 12s ease-in-out infinite; }
        .blob3 { animation: drift3 15s ease-in-out infinite; }

        /* ── CTA glow pulse ── */
        @keyframes glow-pulse {
          0%,100% { box-shadow: 0 0 28px rgba(99,102,241,0.45); }
          50%      { box-shadow: 0 0 55px rgba(99,102,241,0.75), 0 0 90px rgba(139,92,246,0.3); }
        }
        .cta-primary { animation: glow-pulse 3s ease-in-out infinite; }

        /* ── Cycling word ── */
        .word-swap {
          display: inline-block;
          transition: opacity 0.35s ease, transform 0.35s ease;
        }
        .word-swap.hidden { opacity: 0; transform: translateY(-10px); }
        .word-swap.visible { opacity: 1; transform: translateY(0); }

        .feat-card { transition: transform .2s ease, border-color .2s ease; }
        .feat-card:hover { transform: translateY(-3px); border-color: rgba(99,102,241,0.4) !important; }
        .plat-pill { transition: transform .15s; cursor: default; }
        .plat-pill:hover { transform: scale(1.04); }
        .nav-link { color: #94a3b8; font-size: 14px; text-decoration: none; transition: color .15s; }
        .nav-link:hover { color: #f1f5f9; }
        a { text-decoration: none; }
        @media (max-width: 900px) {
          .split-2 { grid-template-columns: 1fr !important; }
          .journey-row { flex-direction: column !important; align-items: center !important; }
          .nav-links { display: none !important; }
        }
        @media (max-width: 600px) {
          .kpi-row { grid-template-columns: repeat(2,1fr) !important; }
          .chart-row { grid-template-columns: 1fr !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .blob1,.blob2,.blob3 { animation: none; }
          .cta-primary { animation: none; }
          .feat-card:hover, .plat-pill:hover { transform: none; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 40, backdropFilter: "blur(16px)", borderBottom: `1px solid ${C.border}`, background: "rgba(7,7,15,0.88)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/apresentacao" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#38bdf8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShoppingBag size={16} color="#fff" />
            </div>
            <span className="display" style={{ color: C.text, fontWeight: 800, fontSize: 16, fontStyle: "italic" }}>GM & Co Tec</span>
          </Link>
          <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <a href="#canais"          className="nav-link">Integrações</a>
            <a href="#funcionalidades" className="nav-link">Funcionalidades</a>
            <a href="#producao"        className="nav-link">Produção</a>
          </div>
          <Link href="/demo" style={{ padding: "9px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", boxShadow: "0 0 20px rgba(99,102,241,0.3)" }}>
            Quero uma demo
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="dot-grid" style={{ padding: "96px 24px 72px", textAlign: "center", position: "relative", overflow: "hidden" }}>

        {/* ── Animated color blobs ── */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div className="blob1" style={{ position: "absolute", width: 640, height: 520, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.28) 0%,transparent 68%)", top: "-5%", left: "-8%", filter: "blur(55px)" }} />
          <div className="blob2" style={{ position: "absolute", width: 560, height: 480, borderRadius: "50%", background: "radial-gradient(circle,rgba(139,92,246,0.22) 0%,transparent 68%)", top: "0%", right: "-10%", filter: "blur(60px)" }} />
          <div className="blob3" style={{ position: "absolute", width: 480, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(56,189,248,0.18) 0%,transparent 68%)", bottom: "-10%", left: "35%", filter: "blur(50px)" }} />
        </div>

        <div style={{ maxWidth: 820, margin: "0 auto", position: "relative" }}>

          <h1 className="display" style={{ fontSize: "clamp(42px,6.5vw,72px)", fontWeight: 800, lineHeight: 1.06, textWrap: "balance", marginBottom: 28 }}>
            Você tem um produto.<br />
            <span className="grad">
              A gente coloca pra vender<br />
              <span
                className={`word-swap ${wordVis ? "visible" : "hidden"}`}
              >
                em {CYCLE_WORDS[wordIdx]}
              </span>
            </span>
          </h1>

          <p style={{ fontSize: 18, color: C.text2, maxWidth: 540, margin: "0 auto 44px", lineHeight: 1.75 }}>
            Relatórios, pedidos, pagamentos e integrações com os principais e-commerces — tudo em um lugar. Para quem quer vender mais sem se perder na operação.
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap", marginBottom: 56 }}>
            <Link href="/demo" className="cta-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "15px 32px", borderRadius: 14, fontWeight: 700, fontSize: 15, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff" }}>
              Começar agora <ArrowRight size={16} />
            </Link>
            <a href="#funcionalidades" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "15px 32px", borderRadius: 14, fontSize: 15, border: `1px solid ${C.border}`, color: C.text2, backdropFilter: "blur(8px)" }}>
              Ver funcionalidades
            </a>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: C.text3, marginRight: 4 }}>Integra com:</span>
            {PLATFORMS.map((p) => (
              <div key={p.name} className="plat-pill" style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, background: `${p.color}18`, border: `1px solid ${p.color}38`, color: C.text, backdropFilter: "blur(6px)" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
                {p.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CUSTOMER JOURNEY */}
      <section style={{ padding: "0 24px 56px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ textAlign: "center", fontSize: 12, color: C.text3, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 24 }}>A jornada que todo vendedor conhece</p>
          <div className="journey-row" style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {JOURNEY.map((item, i) => (
              <React.Fragment key={i}>
                {i > 0 && <ArrowRight size={18} color={C.text3} style={{ flexShrink: 0 }} />}
                <div style={{ padding: "18px 20px", borderRadius: 14, background: item.hl ? "linear-gradient(135deg,rgba(99,102,241,0.14),rgba(56,189,248,0.08))" : C.bg2, border: `1px solid ${item.hl ? "rgba(99,102,241,0.35)" : C.border}`, textAlign: "center", minWidth: 168, flexShrink: 0 }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{item.emoji}</div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: item.hl ? C.sky : C.text, marginBottom: 3, textWrap: "balance" }}>{item.label}</p>
                  <p style={{ fontSize: 11, color: C.text3 }}>{item.sub}</p>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="funcionalidades" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 12, color: C.indigo, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Funcionalidades</p>
            <h2 className="display" style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, textWrap: "balance", lineHeight: 1.12 }}>
              Tudo que você precisa para vender<br />
              <span className="grad">em múltiplos canais</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 16 }}>
            {FEATURES.map((f) => (
              <div key={f.title} className="feat-card" style={{ padding: "24px", borderRadius: 16, background: C.bg2, border: `1px solid ${C.border}` }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, background: `${f.color}16` }}>
                  <f.icon size={20} color={f.color} />
                </div>
                <p style={{ fontWeight: 600, marginBottom: 8, color: C.text, fontSize: 15 }}>{f.title}</p>
                <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.64 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DASHBOARD MOCKUP */}
      <section style={{ padding: "0 24px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ textAlign: "center", fontSize: 12, color: C.text3, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 }}>Como fica na prática</p>
          <div style={{ borderRadius: 20, overflow: "hidden", border: `1px solid ${C.border}`, background: C.bg2, boxShadow: "0 0 60px rgba(99,102,241,0.08)" }}>
            <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, background: C.bg, borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", gap: 6 }}>
                {["#ef4444","#f59e0b","#22c55e"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
              </div>
              <div style={{ flex: 1, background: C.surface, borderRadius: 6, padding: "5px 12px", fontSize: 11, color: C.text3 }}>
                app.modasystem.com.br/dashboard
              </div>
            </div>

            <div style={{ padding: 20 }}>
              <div className="kpi-row" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
                {[
                  { label: "Receita Total", value: "R$ 48.920", delta: "+18%", color: C.sky,    sub: "todos os canais" },
                  { label: "Pedidos",       value: "312",       delta: "+24%", color: C.indigo, sub: "este mês"        },
                  { label: "Em Produção",   value: "47",        delta: null,   color: C.violet, sub: "itens na fila"   },
                  { label: "Clientes",      value: "1.240",     delta: "+9%",  color: C.green,  sub: "ativos"          },
                ].map((kpi) => (
                  <div key={kpi.label} style={{ padding: "14px 16px", borderRadius: 12, background: C.bg, border: `1px solid ${C.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: C.text3 }}>{kpi.label}</span>
                      {kpi.delta && <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: "rgba(52,211,153,0.12)", color: C.green }}>{kpi.delta}</span>}
                    </div>
                    <p style={{ fontSize: 22, fontWeight: 700, color: kpi.color, fontVariantNumeric: "tabular-nums" }}>{kpi.value}</p>
                    <p style={{ fontSize: 10, color: C.text3, marginTop: 3 }}>{kpi.sub}</p>
                  </div>
                ))}
              </div>

              <div className="chart-row" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
                <div style={{ padding: 16, borderRadius: 12, background: C.bg, border: `1px solid ${C.border}` }}>
                  <p style={{ fontSize: 12, color: C.text2, marginBottom: 14 }}>Receita por canal — últimos 7 dias</p>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
                    {[
                      { label: "ML",  h: 90, color: "#ffe600" },
                      { label: "SH",  h: 60, color: "#f37021" },
                      { label: "AMZ", h: 75, color: "#ff9900" },
                      { label: "MGL", h: 45, color: "#0086ff" },
                      { label: "AME", h: 28, color: "#e11d48" },
                      { label: "OLX", h: 18, color: "#7300c8" },
                    ].map((bar) => (
                      <div key={bar.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
                        <div style={{ width: "100%", borderRadius: "4px 4px 0 0", height: `${bar.h}%`, background: `${bar.color}c0`, minHeight: 4 }} />
                        <span style={{ fontSize: 9, color: C.text3 }}>{bar.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ padding: 16, borderRadius: 12, background: C.bg, border: `1px solid ${C.border}` }}>
                  <p style={{ fontSize: 12, color: C.text2, marginBottom: 14 }}>Últimos pedidos</p>
                  {[
                    { id: "#4821", canal: "ML",  status: "Em Produção", c: C.sky    },
                    { id: "#4820", canal: "SH",  status: "Embalando",   c: C.violet },
                    { id: "#4819", canal: "AMZ", status: "Enviado",     c: C.green  },
                  ].map((o) => (
                    <div key={o.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.border}` }}>
                      <div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{o.id}</span>
                        <span style={{ fontSize: 10, color: C.text3, marginLeft: 8 }}>{o.canal}</span>
                      </div>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: `${o.c}16`, color: o.c }}>{o.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM INTEGRATIONS */}
      <section id="canais" style={{ padding: "64px 24px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <h2 className="display" style={{ fontSize: "clamp(26px,3.5vw,40px)", fontWeight: 800, marginBottom: 14, lineHeight: 1.12 }}>
            Um painel. <span className="grad">Todos os canais.</span>
          </h2>
          <p style={{ color: C.text2, fontSize: 15, maxWidth: 500, margin: "0 auto 44px", lineHeight: 1.7 }}>
            Conecte as principais plataformas e gerencie tudo em um só lugar — sem copiar e colar relatórios.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
            {PLATFORMS.map((p) => (
              <div key={p.name} className="plat-pill" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderRadius: 14, background: `${p.color}12`, border: `1px solid ${p.color}2c` }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: p.text, flexShrink: 0 }}>
                  {p.short}
                </div>
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{p.name}</p>
                  <p style={{ fontSize: 11, color: C.text3 }}>Integração nativa</p>
                </div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 24, fontSize: 13, color: C.text3 }}>+ integrações via API para plataformas específicas</p>
        </div>
      </section>

      {/* PRODUCTION FUNNEL */}
      <section id="producao" style={{ padding: "80px 24px", borderTop: `1px solid ${C.border}` }}>
        <div className="split-2" style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 12, color: C.violet, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Produção</p>
            <h2 className="display" style={{ fontSize: "clamp(26px,3.5vw,40px)", fontWeight: 800, marginBottom: 16, textWrap: "balance", lineHeight: 1.12 }}>
              Seu processo de produção,<br />
              <span className="grad">mapeado e controlado</span>
            </h2>
            <p style={{ color: C.text2, lineHeight: 1.72, marginBottom: 24, fontSize: 15 }}>
              Cada pedido que entra alimenta automaticamente o seu funil de produção. Você vê em qual etapa cada item está — e o sistema alerta quando algo está atrasando.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
              {[
                "Monte as etapas do jeito que você já trabalha",
                "Defina responsáveis e tempos estimados por etapa",
                "Receba alertas de atraso automáticos",
                "Relatórios de eficiência por etapa e por período",
              ].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <CheckCircle size={16} color={C.green} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 14, color: C.text2 }}>{item}</span>
                </div>
              ))}
            </div>
            <Link href="/demo" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 22px", borderRadius: 12, background: "rgba(139,92,246,0.14)", border: "1px solid rgba(139,92,246,0.32)", color: C.violet, fontWeight: 600, fontSize: 14 }}>
              Ver plataforma <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              { name: "Pilotagem", resp: "Modelista",  time: "1h",    color: C.sky,    done: true  },
              { name: "Corte",     resp: "Costureira", time: "2h",    color: C.indigo, done: true  },
              { name: "Costura",   resp: "Costureira", time: "4h",    color: C.violet, done: false },
              { name: "Qualidade", resp: "Inspetor",   time: "30min", color: C.green,  done: false },
            ].map((stage, i) => (
              <React.Fragment key={stage.name}>
                {i > 0 && <div style={{ display: "flex", justifyContent: "center" }}><ArrowDown size={14} color={C.text3} /></div>}
                <div style={{ padding: "12px 16px", borderRadius: 12, display: "flex", alignItems: "center", gap: 12, background: stage.done ? `${stage.color}10` : C.bg2, border: `1px solid ${stage.done ? `${stage.color}28` : C.border}` }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: `${stage.color}1e`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {stage.done ? <CheckCircle size={16} color={stage.color} /> : <Settings size={16} color={stage.color} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{stage.name}</span>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, flexShrink: 0, background: stage.done ? `${stage.color}14` : "rgba(71,85,105,0.2)", color: stage.done ? stage.color : C.text3 }}>
                        {stage.done ? "✓ Concluído" : "Em andamento"}
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: C.text3 }}>{stage.resp} · {stage.time}</span>
                  </div>
                </div>
              </React.Fragment>
            ))}
            <div style={{ marginTop: 6, padding: "10px 14px", borderRadius: 10, background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.2)", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: C.green }}>2 etapas concluídas · 2 em andamento</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "64px 24px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <h2 className="display" style={{ textAlign: "center", fontSize: 28, fontWeight: 800, marginBottom: 36 }}>Perguntas frequentes</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ borderRadius: 12, border: `1px solid ${openFaq === i ? "rgba(99,102,241,0.32)" : C.border}`, overflow: "hidden" }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: "100%", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: openFaq === i ? "rgba(99,102,241,0.07)" : "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{faq.q}</span>
                  {openFaq === i ? <ChevronUp size={16} color={C.text3} /> : <ChevronDown size={16} color={C.text3} />}
                </button>
                {openFaq === i && (
                  <div style={{ padding: "0 20px 16px", background: "rgba(99,102,241,0.05)" }}>
                    <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.7 }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: "48px 24px 80px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center", padding: "52px 32px", borderRadius: 24, background: "linear-gradient(135deg,rgba(99,102,241,0.1),rgba(56,189,248,0.06))", border: "1px solid rgba(99,102,241,0.22)", boxShadow: "0 0 80px rgba(99,102,241,0.07)" }}>
          <h2 className="display" style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 800, marginBottom: 14, lineHeight: 1.1 }}>
            Pronto para centralizar<br />
            <span className="grad">suas vendas?</span>
          </h2>
          <p style={{ color: C.text2, fontSize: 15, marginBottom: 30, lineHeight: 1.7 }}>
            Acesse a plataforma e veja como ela se encaixa no seu negócio. Sem compromisso.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/demo" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 12, fontWeight: 700, fontSize: 14, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff" }}>
              Acessar plataforma <ArrowRight size={15} />
            </Link>
            <a href="https://wa.me/55?text=Quero+conhecer+a+Moda+Store" target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 12, fontSize: 14, border: `1px solid ${C.border}`, color: C.text2 }}>
              <MessageCircle size={15} />Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "20px 24px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#38bdf8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShoppingBag size={12} color="#fff" />
          </div>
          <span style={{ fontSize: 13, color: C.text3 }}>GM & Co Tec © 2026</span>
        </div>
        <div style={{ display: "flex", gap: 20, fontSize: 12 }}>
          <Link href="/demo" style={{ color: C.text3 }}>Plataforma</Link>
          <Link href="/admin" style={{ color: C.text3 }}>Admin</Link>
        </div>
      </footer>
    </div>
  );
}
