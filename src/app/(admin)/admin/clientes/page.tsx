"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search, X, Phone, Mail, MapPin, ShoppingBag,
  Tag, Plus, ChevronRight,
} from "lucide-react";

const UI   = "var(--font-space), var(--font-geist-sans), sans-serif";
const MONO = "var(--font-space-mono), var(--font-geist-mono), monospace";

const MOCK_CUSTOMERS = [
  {
    id: "1",
    name: "Ana Carolina Ferreira",
    email: "ana.ferreira@email.com",
    phone: "(11) 98765-4321",
    whatsapp: "(11) 98765-4321",
    city: "São Paulo, SP",
    totalSpent: 8420.50,
    totalOrders: 32,
    lastOrder: "2026-09-12",
    tags: ["VIP", "Atacado", "Fiel"],
    notes: "Prefere entregas para loja física. Sempre pede nota fiscal.",
    orders: [
      { id: "PED-0891", date: "2026-09-12", channel: "Shopee",  value: 420.00,  status: "Entregue"   },
      { id: "PED-0832", date: "2026-09-01", channel: "Direto",  value: 1200.00, status: "Entregue"   },
      { id: "PED-0780", date: "2026-08-20", channel: "ML",      value: 580.00,  status: "Entregue"   },
      { id: "PED-0754", date: "2026-08-10", channel: "Direto",  value: 890.00,  status: "Entregue"   },
      { id: "PED-0701", date: "2026-07-28", channel: "Shopee",  value: 320.00,  status: "Entregue"   },
    ],
  },
  {
    id: "2",
    name: "Lucas Moreira",
    email: "lucas.moreira@email.com",
    phone: "(21) 97654-3210",
    whatsapp: "(21) 97654-3210",
    city: "Rio de Janeiro, RJ",
    totalSpent: 11200.00,
    totalOrders: 47,
    lastOrder: "2026-09-16",
    tags: ["VIP", "Recorrente"],
    notes: "Compra para revenda. Volume mensal alto.",
    orders: [
      { id: "PED-0920", date: "2026-09-16", channel: "Direto",  value: 2400.00, status: "Em preparo" },
      { id: "PED-0870", date: "2026-09-05", channel: "Direto",  value: 1800.00, status: "Entregue"   },
      { id: "PED-0845", date: "2026-08-25", channel: "ML",      value: 960.00,  status: "Entregue"   },
      { id: "PED-0800", date: "2026-08-14", channel: "Direto",  value: 2200.00, status: "Entregue"   },
      { id: "PED-0756", date: "2026-08-01", channel: "Direto",  value: 1640.00, status: "Entregue"   },
    ],
  },
  {
    id: "3",
    name: "Roberto Magalhães",
    email: "roberto.mag@email.com",
    phone: "(31) 99876-5432",
    whatsapp: "(31) 99876-5432",
    city: "Belo Horizonte, MG",
    totalSpent: 4850.00,
    totalOrders: 19,
    lastOrder: "2026-09-10",
    tags: ["Fiel"],
    notes: "",
    orders: [
      { id: "PED-0860", date: "2026-09-10", channel: "Shopee",  value: 350.00, status: "Entregue" },
      { id: "PED-0810", date: "2026-09-02", channel: "Shopee",  value: 480.00, status: "Entregue" },
      { id: "PED-0770", date: "2026-08-18", channel: "ML",      value: 620.00, status: "Entregue" },
      { id: "PED-0730", date: "2026-08-05", channel: "Shopee",  value: 290.00, status: "Entregue" },
      { id: "PED-0680", date: "2026-07-22", channel: "ML",      value: 440.00, status: "Entregue" },
    ],
  },
  {
    id: "4",
    name: "Felipe Andrade",
    email: "f.andrade@gmail.com",
    phone: "(41) 98765-1234",
    whatsapp: null,
    city: "Curitiba, PR",
    totalSpent: 3240.00,
    totalOrders: 12,
    lastOrder: "2026-09-14",
    tags: ["Atacado"],
    notes: "",
    orders: [
      { id: "PED-0900", date: "2026-09-14", channel: "Amazon", value: 780.00, status: "Aguardando" },
      { id: "PED-0850", date: "2026-09-03", channel: "Amazon", value: 540.00, status: "Entregue"  },
      { id: "PED-0790", date: "2026-08-22", channel: "ML",     value: 420.00, status: "Entregue"  },
      { id: "PED-0740", date: "2026-08-08", channel: "Amazon", value: 680.00, status: "Entregue"  },
      { id: "PED-0700", date: "2026-07-30", channel: "ML",     value: 320.00, status: "Entregue"  },
    ],
  },
  {
    id: "5",
    name: "Juliana Costa",
    email: "ju.costa@email.com",
    phone: "(11) 91234-5678",
    whatsapp: "(11) 91234-5678",
    city: "São Paulo, SP",
    totalSpent: 2100.00,
    totalOrders: 8,
    lastOrder: "2026-09-08",
    tags: [] as string[],
    notes: "",
    orders: [
      { id: "PED-0855", date: "2026-09-08", channel: "Shopee", value: 380.00, status: "Entregue" },
      { id: "PED-0795", date: "2026-08-25", channel: "Shopee", value: 290.00, status: "Entregue" },
      { id: "PED-0750", date: "2026-08-12", channel: "ML",     value: 560.00, status: "Entregue" },
      { id: "PED-0710", date: "2026-08-01", channel: "Shopee", value: 420.00, status: "Entregue" },
      { id: "PED-0665", date: "2026-07-15", channel: "ML",     value: 320.00, status: "Entregue" },
    ],
  },
  {
    id: "6",
    name: "Camila Ramos",
    email: "camila.ramos@email.com",
    phone: "(85) 98888-7777",
    whatsapp: "(85) 98888-7777",
    city: "Fortaleza, CE",
    totalSpent: 680.00,
    totalOrders: 3,
    lastOrder: "2026-09-05",
    tags: ["Novo"],
    notes: "",
    orders: [
      { id: "PED-0840", date: "2026-09-05", channel: "ML", value: 280.00, status: "Entregue" },
      { id: "PED-0795", date: "2026-08-20", channel: "ML", value: 240.00, status: "Entregue" },
      { id: "PED-0770", date: "2026-08-05", channel: "ML", value: 160.00, status: "Entregue" },
    ],
  },
  {
    id: "7",
    name: "Patricia Lima",
    email: null,
    phone: "(71) 97777-6666",
    whatsapp: "(71) 97777-6666",
    city: "Salvador, BA",
    totalSpent: 1750.00,
    totalOrders: 7,
    lastOrder: "2026-09-03",
    tags: [] as string[],
    notes: "",
    orders: [
      { id: "PED-0830", date: "2026-09-03", channel: "Shopee", value: 320.00, status: "Entregue" },
      { id: "PED-0789", date: "2026-08-19", channel: "Shopee", value: 260.00, status: "Entregue" },
      { id: "PED-0745", date: "2026-08-08", channel: "Shopee", value: 480.00, status: "Entregue" },
      { id: "PED-0698", date: "2026-07-25", channel: "ML",     value: 340.00, status: "Entregue" },
      { id: "PED-0650", date: "2026-07-10", channel: "Shopee", value: 200.00, status: "Entregue" },
    ],
  },
  {
    id: "8",
    name: "Diego Santos",
    email: "diego.s@email.com",
    phone: "(48) 96666-5555",
    whatsapp: null,
    city: "Florianópolis, SC",
    totalSpent: 220.00,
    totalOrders: 1,
    lastOrder: "2026-09-01",
    tags: ["Novo"],
    notes: "",
    orders: [
      { id: "PED-0825", date: "2026-09-01", channel: "Amazon", value: 220.00, status: "Entregue" },
    ],
  },
];

type Customer = typeof MOCK_CUSTOMERS[0];

function getLevel(c: Customer) {
  if (c.totalSpent >= 8000 || c.totalOrders >= 30)
    return { label: "VIP",    color: "#7c3fed", bg: "rgba(124,63,237,0.12)" };
  if (c.totalSpent >= 3000)
    return { label: "Ouro",   color: "#d97706", bg: "rgba(217,119,6,0.12)"  };
  if (c.totalSpent >= 1000)
    return { label: "Prata",  color: "#64748b", bg: "rgba(100,116,139,0.12)" };
  return   { label: "Bronze", color: "#b45309", bg: "rgba(180,83,9,0.10)"   };
}

function fmtBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

function statusColor(s: string) {
  if (s === "Entregue")   return "#059669";
  if (s === "Em preparo") return "#d97706";
  if (s === "Aguardando") return "#64748b";
  return "var(--text-2)";
}

const LEVELS = ["Todos", "VIP", "Ouro", "Prata", "Bronze"];

export default function ClientesPage() {
  const [search, setSearch]   = useState("");
  const [lvFilter, setLvFilter] = useState("Todos");
  const [selected, setSelected] = useState<Customer | null>(null);

  const filtered = MOCK_CUSTOMERS.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || c.name.toLowerCase().includes(q)
      || (c.email ?? "").toLowerCase().includes(q)
      || c.phone.includes(q);
    const matchLevel = lvFilter === "Todos" || getLevel(c).label === lvFilter;
    return matchSearch && matchLevel;
  });

  const totalVIP    = MOCK_CUSTOMERS.filter(c => getLevel(c).label === "VIP").length;
  const novos       = MOCK_CUSTOMERS.filter(c => c.tags.includes("Novo")).length;
  const ticketMedio = MOCK_CUSTOMERS.reduce((a, c) => a + c.totalSpent, 0) / MOCK_CUSTOMERS.length;

  return (
    <>
      {/* ── Hero ──────────────────────────────────── */}
      <div style={{
        position: "relative", borderRadius: 20,
        overflow: "hidden",
        background: "linear-gradient(135deg,#0c0420 0%,#190a58 35%,#0b1e66 65%,#062244 100%)",
        padding: "32px 32px 28px",
        marginBottom: 24,
      }}>
        {/* orbs */}
        <div style={{ position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none" }}>
          <div style={{
            position:"absolute",width:260,height:260,borderRadius:"50%",
            background:"radial-gradient(circle,rgba(124,63,237,0.22) 0%,transparent 70%)",
            top:-80,right:60,animation:"drift-1 8s ease-in-out infinite",
          }}/>
          <div style={{
            position:"absolute",width:200,height:200,borderRadius:"50%",
            background:"radial-gradient(circle,rgba(6,182,212,0.16) 0%,transparent 70%)",
            bottom:-60,left:120,animation:"drift-2 10s ease-in-out infinite",
          }}/>
          <div style={{
            position:"absolute",width:160,height:160,borderRadius:"50%",
            background:"radial-gradient(circle,rgba(16,185,129,0.14) 0%,transparent 70%)",
            top:20,left:40,animation:"drift-3 12s ease-in-out infinite",
          }}/>
        </div>

        {/* floating tag labels */}
        <div style={{
          position:"absolute",top:16,right:20,
          display:"flex",gap:7,flexWrap:"wrap",justifyContent:"flex-end",maxWidth:280,
        }}>
          {["CRM","Segmentação","Pedidos","Ticket Médio","Tags"].map((t,i) => (
            <span key={t} style={{
              fontFamily:UI,fontSize:10,fontWeight:600,
              color:"rgba(255,255,255,0.4)",
              border:"1px solid rgba(255,255,255,0.1)",
              background:"rgba(255,255,255,0.05)",
              borderRadius:20,padding:"3px 10px",
              animation:`float-tag ${3 + i * 0.5}s ease-in-out infinite`,
            }}>{t}</span>
          ))}
        </div>

        {/* title + description */}
        <div style={{ position:"relative",zIndex:1,maxWidth:480 }}>
          <p style={{
            fontFamily:UI,fontSize:10,fontWeight:700,
            color:"rgba(255,255,255,0.4)",letterSpacing:"0.16em",
            textTransform:"uppercase",marginBottom:8,
          }}>CRM · CLIENTES</p>
          <h1 style={{
            fontFamily:UI,fontSize:26,fontWeight:800,
            color:"#fff",margin:"0 0 8px",lineHeight:1.15,
          }}>Gestão de Clientes</h1>
          <p style={{
            fontFamily:UI,fontSize:13,
            color:"rgba(255,255,255,0.5)",margin:0,
          }}>
            Toda a base CRM — segmente por nível, veja histórico e relacionamento.
          </p>
        </div>

        {/* stats strip + novo cliente */}
        <div style={{
          position:"relative",zIndex:1,
          display:"flex",alignItems:"flex-end",justifyContent:"space-between",
          gap:24,marginTop:26,flexWrap:"wrap",
          borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:18,
        }}>
          <div style={{ display:"flex",gap:28,flexWrap:"wrap" }}>
            {[
              { label:"Total Clientes", value: MOCK_CUSTOMERS.length.toString() },
              { label:"Clientes VIP",   value: totalVIP.toString() },
              { label:"Novos este mês", value: novos.toString() },
              { label:"Ticket Médio",   value: fmtBRL(ticketMedio) },
            ].map(s => (
              <div key={s.label}>
                <p style={{ fontFamily:MONO,fontSize:20,fontWeight:700,color:"#fff",margin:0 }}>{s.value}</p>
                <p style={{ fontFamily:UI,fontSize:10,color:"rgba(255,255,255,0.4)",margin:"2px 0 0" }}>{s.label}</p>
              </div>
            ))}
          </div>

          <Link href="/admin/clientes/novo" style={{
            display:"inline-flex",alignItems:"center",gap:6,
            fontFamily:UI,fontSize:12,fontWeight:700,
            color:"rgba(255,255,255,0.85)",
            background:"rgba(255,255,255,0.08)",
            border:"1px solid rgba(255,255,255,0.18)",
            borderRadius:10,padding:"9px 16px",textDecoration:"none",
            backdropFilter:"blur(8px)",
          }}>
            <Plus size={13}/> Novo Cliente
          </Link>
        </div>
      </div>

      {/* ── Search + level filter ──────────────────── */}
      <div style={{ display:"flex",gap:10,marginBottom:18,alignItems:"center",flexWrap:"wrap" }}>
        <div style={{ position:"relative",flex:1,minWidth:220 }}>
          <Search size={14} color="var(--text-3)" style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)" }}/>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, email ou telefone..."
            style={{
              width:"100%",boxSizing:"border-box",
              fontFamily:UI,fontSize:13,color:"var(--text-1)",
              background:"var(--surface)",border:"1px solid var(--border)",
              borderRadius:10,padding:"10px 12px 10px 34px",outline:"none",
            }}
          />
        </div>
        <div style={{ display:"flex",gap:6 }}>
          {LEVELS.map(lv => (
            <button key={lv} onClick={() => setLvFilter(lv)} style={{
              fontFamily:UI,fontSize:12,fontWeight:600,
              padding:"9px 14px",borderRadius:8,cursor:"pointer",
              background: lvFilter === lv ? "var(--accent-bg)" : "var(--surface)",
              border:`1px solid ${lvFilter === lv ? "var(--accent)" : "var(--border)"}`,
              color: lvFilter === lv ? "var(--accent)" : "var(--text-2)",
              transition:"all 0.15s",
            }}>{lv}</button>
          ))}
        </div>
      </div>

      {/* ── Customer cards ────────────────────────── */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",
        gap:12,
      }}>
        {filtered.map(c => {
          const lv = getLevel(c);
          const active = selected?.id === c.id;
          return (
            <div
              key={c.id}
              onClick={() => setSelected(active ? null : c)}
              style={{
                background:"var(--surface)",
                border:`1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                borderRadius:14,padding:"16px 18px",
                cursor:"pointer",transition:"all 0.15s",
                boxShadow: active
                  ? "0 0 0 3px var(--accent-bg)"
                  : "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              {/* top row: avatar + name + level badge */}
              <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:12 }}>
                <div style={{
                  width:40,height:40,borderRadius:"50%",
                  background:lv.bg,border:`1.5px solid ${lv.color}35`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontFamily:UI,fontSize:14,fontWeight:800,color:lv.color,
                  flexShrink:0,
                }}>
                  {initials(c.name)}
                </div>
                <div style={{ flex:1,minWidth:0 }}>
                  <p style={{
                    fontFamily:UI,fontSize:13,fontWeight:700,color:"var(--text-1)",
                    margin:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
                  }}>{c.name}</p>
                  <p style={{ fontFamily:UI,fontSize:11,color:"var(--text-2)",margin:"2px 0 0" }}>{c.city}</p>
                </div>
                <span style={{
                  fontFamily:UI,fontSize:10,fontWeight:700,
                  color:lv.color,background:lv.bg,
                  border:`1px solid ${lv.color}25`,
                  borderRadius:6,padding:"3px 8px",whiteSpace:"nowrap",
                }}>{lv.label}</span>
              </div>

              {/* stat row */}
              <div style={{ display:"flex",gap:16,marginBottom:12 }}>
                <div>
                  <p style={{ fontFamily:MONO,fontSize:14,fontWeight:700,color:"var(--text-1)",margin:0 }}>
                    {fmtBRL(c.totalSpent)}
                  </p>
                  <p style={{ fontFamily:UI,fontSize:9.5,color:"var(--text-3)",margin:"2px 0 0" }}>Total gasto</p>
                </div>
                <div>
                  <p style={{ fontFamily:MONO,fontSize:14,fontWeight:700,color:"var(--text-1)",margin:0 }}>
                    {c.totalOrders}
                  </p>
                  <p style={{ fontFamily:UI,fontSize:9.5,color:"var(--text-3)",margin:"2px 0 0" }}>Pedidos</p>
                </div>
                <div>
                  <p style={{ fontFamily:MONO,fontSize:14,fontWeight:700,color:"var(--text-1)",margin:0 }}>
                    {fmtDate(c.lastOrder)}
                  </p>
                  <p style={{ fontFamily:UI,fontSize:9.5,color:"var(--text-3)",margin:"2px 0 0" }}>Última compra</p>
                </div>
              </div>

              {/* tags + chevron */}
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:8 }}>
                <div style={{ display:"flex",gap:4,flexWrap:"wrap" }}>
                  {c.tags.slice(0,3).map(tag => (
                    <span key={tag} style={{
                      fontFamily:UI,fontSize:10,fontWeight:600,
                      color:"var(--accent)",background:"var(--accent-bg)",
                      border:"1px solid var(--border-hi)",
                      borderRadius:20,padding:"2px 8px",
                    }}>{tag}</span>
                  ))}
                  {c.tags.length === 0 && (
                    <span style={{ fontFamily:UI,fontSize:10,color:"var(--text-3)" }}>Sem tags</span>
                  )}
                </div>
                <ChevronRight size={14} color={active ? "var(--accent)" : "var(--text-3)"}
                  style={{ transform: active ? "rotate(90deg)" : "none", transition:"transform 0.2s" }}
                />
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{
            gridColumn:"1/-1",
            textAlign:"center",padding:"48px 24px",
            fontFamily:UI,fontSize:13,color:"var(--text-2)",
          }}>
            Nenhum cliente encontrado para &quot;{search}&quot;
          </div>
        )}
      </div>

      {/* ── Detail drawer ─────────────────────────── */}
      {selected && <CustomerDrawer customer={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

/* ─── Customer detail drawer ─────────────────────── */

function CustomerDrawer({ customer: c, onClose }: { customer: Customer; onClose: () => void }) {
  const lv = getLevel(c);

  return (
    <>
      {/* backdrop */}
      <div
        onClick={onClose}
        style={{
          position:"fixed",inset:0,zIndex:40,
          background:"rgba(0,0,0,0.25)",backdropFilter:"blur(3px)",
        }}
      />
      {/* panel */}
      <div style={{
        position:"fixed",top:0,right:0,bottom:0,
        width:"min(480px,100vw)",zIndex:50,
        background:"var(--bg)",
        borderLeft:"1px solid var(--border)",
        boxShadow:"-8px 0 48px rgba(0,0,0,0.14)",
        display:"flex",flexDirection:"column",
        overflowY:"auto",
      }}>

        {/* drawer header — dark gradient matching hero */}
        <div style={{
          background:"linear-gradient(135deg,#0c0420 0%,#190a58 60%,#0b1e66 100%)",
          padding:"24px 24px 20px",
          position:"relative",overflow:"hidden",
          flexShrink:0,
        }}>
          {/* accent orb */}
          <div style={{
            position:"absolute",width:140,height:140,borderRadius:"50%",
            background:`radial-gradient(circle,${lv.color}35 0%,transparent 70%)`,
            top:-30,right:40,animation:"drift-1 8s ease-in-out infinite",
            pointerEvents:"none",
          }}/>

          {/* close */}
          <button onClick={onClose} style={{
            position:"absolute",top:16,right:16,
            width:32,height:32,borderRadius:8,
            background:"rgba(255,255,255,0.1)",
            border:"1px solid rgba(255,255,255,0.15)",
            cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
          }}>
            <X size={15} color="rgba(255,255,255,0.7)"/>
          </button>

          {/* avatar + name */}
          <div style={{ display:"flex",alignItems:"flex-start",gap:14,position:"relative",zIndex:1 }}>
            <div style={{
              width:52,height:52,borderRadius:"50%",
              background:lv.bg,border:`2px solid ${lv.color}40`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontFamily:UI,fontSize:18,fontWeight:800,color:lv.color,
              flexShrink:0,
            }}>
              {initials(c.name)}
            </div>
            <div>
              <p style={{ fontFamily:UI,fontSize:16,fontWeight:800,color:"#fff",margin:0 }}>{c.name}</p>
              <p style={{ fontFamily:UI,fontSize:11,color:"rgba(255,255,255,0.45)",margin:"3px 0 8px" }}>{c.city}</p>
              <span style={{
                fontFamily:UI,fontSize:10,fontWeight:700,
                color:lv.color,background:`${lv.color}22`,
                border:`1px solid ${lv.color}30`,
                borderRadius:6,padding:"3px 10px",
              }}>{lv.label}</span>
            </div>
          </div>

          {/* big numbers */}
          <div style={{
            display:"flex",gap:24,marginTop:20,flexWrap:"wrap",
            borderTop:"1px solid rgba(255,255,255,0.1)",paddingTop:16,
            position:"relative",zIndex:1,
          }}>
            {[
              { label:"Total gasto",  value: fmtBRL(c.totalSpent) },
              { label:"Pedidos",      value: c.totalOrders.toString() },
              { label:"Ticket médio", value: fmtBRL(c.totalSpent / c.totalOrders) },
            ].map(s => (
              <div key={s.label}>
                <p style={{ fontFamily:MONO,fontSize:15,fontWeight:700,color:"#fff",margin:0 }}>{s.value}</p>
                <p style={{ fontFamily:UI,fontSize:9.5,color:"rgba(255,255,255,0.4)",margin:"2px 0 0" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* drawer body */}
        <div style={{ padding:"22px 24px",flex:1 }}>

          {/* Contato */}
          <Section label="Contato">
            <InfoRow icon={Phone}  text={c.phone} />
            {c.whatsapp && <InfoRow icon={Phone} text={`WhatsApp: ${c.whatsapp}`} color="#25d366" />}
            {c.email    && <InfoRow icon={Mail}   text={c.email} />}
            <InfoRow icon={MapPin} text={c.city} />
          </Section>

          {/* Pedidos recentes */}
          <Section label={`Pedidos recentes · ${c.orders.length} registros`}>
            <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
              {c.orders.map(o => (
                <div key={o.id} style={{
                  display:"flex",alignItems:"center",gap:9,
                  background:"var(--surface)",
                  border:"1px solid var(--border)",
                  borderRadius:8,padding:"9px 12px",
                }}>
                  <ShoppingBag size={12} color="var(--text-3)"/>
                  <div style={{ flex:1 }}>
                    <span style={{ fontFamily:MONO,fontSize:11,fontWeight:700,color:"var(--text-1)" }}>
                      {o.id}
                    </span>
                    <span style={{ fontFamily:UI,fontSize:10,color:"var(--text-2)",margin:"0 5px" }}>·</span>
                    <span style={{ fontFamily:UI,fontSize:10,color:"var(--text-2)" }}>{fmtDate(o.date)}</span>
                    <span style={{ fontFamily:UI,fontSize:10,color:"var(--text-3)",marginLeft:5 }}>via {o.channel}</span>
                  </div>
                  <span style={{ fontFamily:MONO,fontSize:11,fontWeight:700,color:"var(--text-1)" }}>
                    {fmtBRL(o.value)}
                  </span>
                  <span style={{
                    fontFamily:UI,fontSize:9,fontWeight:700,
                    color:statusColor(o.status),
                    background:`${statusColor(o.status)}18`,
                    borderRadius:4,padding:"2px 6px",whiteSpace:"nowrap",
                  }}>{o.status}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Tags */}
          <Section label="Tags">
            <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
              {c.tags.map(tag => (
                <span key={tag} style={{
                  fontFamily:UI,fontSize:11,fontWeight:600,
                  color:"var(--accent)",background:"var(--accent-bg)",
                  border:"1px solid var(--border-hi)",
                  borderRadius:20,padding:"4px 12px",
                  display:"flex",alignItems:"center",gap:5,
                }}>
                  <Tag size={10}/> {tag}
                </span>
              ))}
              <button style={{
                fontFamily:UI,fontSize:11,fontWeight:600,
                color:"var(--text-2)",background:"transparent",
                border:"1px dashed var(--border)",
                borderRadius:20,padding:"4px 12px",cursor:"pointer",
                display:"flex",alignItems:"center",gap:5,
              }}>
                <Plus size={10}/> Adicionar
              </button>
            </div>
          </Section>

          {/* Notas */}
          <Section label="Notas internas">
            <textarea
              defaultValue={c.notes}
              placeholder="Anotações sobre este cliente..."
              rows={3}
              style={{
                width:"100%",boxSizing:"border-box",
                fontFamily:UI,fontSize:12,color:"var(--text-1)",
                background:"var(--surface)",
                border:"1px solid var(--border)",
                borderRadius:8,padding:"10px 12px",
                resize:"vertical",outline:"none",
              }}
            />
          </Section>

          {/* Actions */}
          <div style={{ display:"flex",gap:8,paddingBottom:4 }}>
            <button style={{
              flex:1,fontFamily:UI,fontSize:13,fontWeight:700,
              color:"#fff",background:"var(--accent)",
              border:"none",borderRadius:10,padding:"13px",
              cursor:"pointer",
              boxShadow:"0 4px 14px rgba(124,63,237,0.25)",
            }}>
              Salvar alterações
            </button>
            <button style={{
              fontFamily:UI,fontSize:13,fontWeight:500,
              color:"var(--text-2)",background:"var(--surface)",
              border:"1px solid var(--border)",borderRadius:10,
              padding:"13px 18px",cursor:"pointer",
            }}>
              Novo pedido
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Helpers ──────────────────────────────────────── */

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom:20 }}>
      <p style={{
        fontFamily:UI,fontSize:9.5,fontWeight:700,
        color:"var(--text-3)",letterSpacing:"0.14em",
        textTransform:"uppercase",margin:"0 0 10px",
      }}>{label}</p>
      {children}
    </div>
  );
}

function InfoRow({
  icon: Icon, text, color,
}: {
  icon: React.ElementType;
  text: string;
  color?: string;
}) {
  return (
    <div style={{
      display:"flex",alignItems:"center",gap:8,marginBottom:6,
      fontFamily:UI,fontSize:12,color: color ?? "var(--text-2)",
    }}>
      <Icon size={13} color={color ?? "var(--text-3)"}/>
      {text}
    </div>
  );
}
