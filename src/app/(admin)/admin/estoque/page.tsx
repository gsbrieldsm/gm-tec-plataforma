"use client";

import { useState } from "react";
import {
  Search, X, Plus, Minus, ArrowDown, ArrowUp, RotateCcw,
  AlertTriangle, Package, MapPin, ChevronRight, History,
} from "lucide-react";

const UI   = "var(--font-space), var(--font-geist-sans), sans-serif";
const MONO = "var(--font-space-mono), var(--font-geist-mono), monospace";

type Movement = { type: "IN" | "OUT" | "ADJ"; qty: number; reason: string; time: string };

const MOCK_SKUS = [
  {
    id: "1",
    product: "Vestido Floral Verão",
    sku: "VFV-001-PP-ROSA",
    size: "PP", color: "Rosa", category: "Vestidos",
    stock: 12, minStock: 5, cost: 48.00, price: 149.90,
    location: "Prateleira A-03",
    movements: [
      { type: "OUT", qty: -2, reason: "Venda #PED-0891",     time: "hoje 10:15"   },
      { type: "IN",  qty: 20, reason: "Produção PROD-001",   time: "12/09 08:00"  },
      { type: "OUT", qty: -6, reason: "Venda #PED-0832",     time: "01/09 14:20"  },
    ] as Movement[],
  },
  {
    id: "2",
    product: "Vestido Floral Verão",
    sku: "VFV-001-P-ROSA",
    size: "P", color: "Rosa", category: "Vestidos",
    stock: 8, minStock: 5, cost: 48.00, price: 149.90,
    location: "Prateleira A-03",
    movements: [
      { type: "OUT", qty: -4, reason: "Venda #PED-0870",   time: "hoje 11:40"  },
      { type: "IN",  qty: 12, reason: "Produção PROD-001", time: "12/09 08:00" },
    ] as Movement[],
  },
  {
    id: "3",
    product: "Blusa Básica Algodão",
    sku: "BBA-002-M-BRANCO",
    size: "M", color: "Branco", category: "Blusas",
    stock: 3, minStock: 10, cost: 22.00, price: 79.90,
    location: "Prateleira B-01",
    movements: [
      { type: "IN",  qty: 20, reason: "Compra fornecedor", time: "hoje 09:00"  },
      { type: "OUT", qty: -17, reason: "Venda #PED-0845",  time: "16/09 15:00" },
    ] as Movement[],
  },
  {
    id: "4",
    product: "Blusa Básica Algodão",
    sku: "BBA-002-G-PRETO",
    size: "G", color: "Preto", category: "Blusas",
    stock: 0, minStock: 10, cost: 22.00, price: 79.90,
    location: "Prateleira B-01",
    movements: [
      { type: "OUT", qty: -8, reason: "Venda #PED-0900",  time: "14/09 09:30" },
      { type: "ADJ", qty: -2, reason: "Ajuste inventário", time: "10/09 16:00" },
    ] as Movement[],
  },
  {
    id: "5",
    product: "Calça Jeans Skinny",
    sku: "CJS-003-36-AZUL",
    size: "36", color: "Azul", category: "Calças",
    stock: 15, minStock: 5, cost: 65.00, price: 199.90,
    location: "Prateleira C-02",
    movements: [
      { type: "ADJ", qty: -1, reason: "Ajuste inventário", time: "ontem 16:30" },
      { type: "IN",  qty: 16, reason: "Compra fornecedor", time: "05/09 10:00" },
    ] as Movement[],
  },
  {
    id: "6",
    product: "Saia Midi Plissada",
    sku: "SMP-004-U-VERDE",
    size: "Único", color: "Verde", category: "Saias",
    stock: 4, minStock: 5, cost: 38.00, price: 129.90,
    location: "Prateleira A-07",
    movements: [
      { type: "OUT", qty: -3, reason: "Venda #PED-0855",   time: "08/09 12:00" },
      { type: "IN",  qty: 7,  reason: "Produção PROD-002", time: "28/08 09:00" },
    ] as Movement[],
  },
  {
    id: "7",
    product: "Camisa Linho Manga Longa",
    sku: "CLM-005-M-BEGE",
    size: "M", color: "Bege", category: "Camisas",
    stock: 22, minStock: 8, cost: 54.00, price: 179.90,
    location: "Prateleira D-01",
    movements: [
      { type: "IN",  qty: 24, reason: "Importação IMP-014", time: "10/09 07:00" },
      { type: "OUT", qty: -2, reason: "Venda #PED-0920",    time: "16/09 18:00" },
    ] as Movement[],
  },
  {
    id: "8",
    product: "Cropped Canelado",
    sku: "CRC-006-P-PRETO",
    size: "P", color: "Preto", category: "Blusas",
    stock: 2, minStock: 12, cost: 18.00, price: 69.90,
    location: "Prateleira B-04",
    movements: [
      { type: "OUT", qty: -10, reason: "Venda #PED-0840", time: "05/09 11:00" },
    ] as Movement[],
  },
  {
    id: "9",
    product: "Short Alfaiataria",
    sku: "SHA-007-38-CAQUI",
    size: "38", color: "Caqui", category: "Shorts",
    stock: 0, minStock: 6, cost: 41.00, price: 139.90,
    location: "Prateleira C-05",
    movements: [
      { type: "OUT", qty: -6, reason: "Venda #PED-0825", time: "01/09 14:00" },
    ] as Movement[],
  },
];

type Sku = typeof MOCK_SKUS[0];

function getStatus(s: Sku) {
  if (s.stock === 0)        return { label: "Zerado", color: "#dc2626", bg: "rgba(220,38,38,0.10)" };
  if (s.stock < s.minStock) return { label: "Baixo",  color: "#d97706", bg: "rgba(217,119,6,0.10)" };
  return                         { label: "OK",     color: "#059669", bg: "rgba(5,150,105,0.10)"  };
}

function fmtBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const MOV_STYLE = {
  IN:  { color: "#059669", icon: ArrowDown,  label: "Entrada" },
  OUT: { color: "#dc2626", icon: ArrowUp,    label: "Saída"   },
  ADJ: { color: "#64748b", icon: RotateCcw,  label: "Ajuste"  },
};

const FILTERS = ["Todos", "OK", "Baixo", "Zerado"];

export default function EstoquePage() {
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("Todos");
  const [selected, setSelected] = useState<Sku | null>(null);

  const filtered = MOCK_SKUS.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || s.product.toLowerCase().includes(q)
      || s.sku.toLowerCase().includes(q)
      || s.color.toLowerCase().includes(q);
    const matchFilter = filter === "Todos" || getStatus(s).label === filter;
    return matchSearch && matchFilter;
  });

  const baixo   = MOCK_SKUS.filter(s => getStatus(s).label === "Baixo").length;
  const zerado  = MOCK_SKUS.filter(s => getStatus(s).label === "Zerado").length;
  const pecas   = MOCK_SKUS.reduce((a, s) => a + s.stock, 0);
  const valor   = MOCK_SKUS.reduce((a, s) => a + s.stock * s.cost, 0);

  return (
    <>
      {/* ── Hero ──────────────────────────────────── */}
      <div className="admin-hero" style={{
        position:"relative",borderRadius:20,overflow:"hidden",
        background:"linear-gradient(135deg,#0c0420 0%,#190a58 35%,#0b1e66 65%,#062244 100%)",
        padding:"32px 32px 28px",marginBottom:24,
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

        {/* floating labels */}
        <div className="admin-hero-tags" style={{
          position:"absolute",top:16,right:20,
          display:"flex",gap:7,flexWrap:"wrap",justifyContent:"flex-end",maxWidth:280,
        }}>
          {["SKUs","Entradas","Saídas","Inventário","Reposição"].map((t,i) => (
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

        {/* title */}
        <div style={{ position:"relative",zIndex:1,maxWidth:460 }}>
          <p style={{
            fontFamily:UI,fontSize:10,fontWeight:700,
            color:"rgba(255,255,255,0.4)",letterSpacing:"0.16em",
            textTransform:"uppercase",marginBottom:8,
          }}>OPERAÇÕES · ESTOQUE</p>
          <h1 style={{
            fontFamily:UI,fontSize:26,fontWeight:800,
            color:"#fff",margin:"0 0 8px",lineHeight:1.15,
          }}>Controle de Estoque</h1>
          <p style={{ fontFamily:UI,fontSize:13,color:"rgba(255,255,255,0.5)",margin:0 }}>
            Todas as variações em um lugar — saldo, mínimo, movimentações e reposição.
          </p>
        </div>

        {/* stats strip + quick movement buttons */}
        <div className="admin-hero-stats" style={{
          position:"relative",zIndex:1,
          display:"flex",alignItems:"flex-end",justifyContent:"space-between",
          gap:24,marginTop:26,flexWrap:"wrap",
          borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:18,
        }}>
          <div style={{ display:"flex",gap:28,flexWrap:"wrap" }}>
            {[
              { label:"Total de SKUs",    value: MOCK_SKUS.length.toString(), color:"#fff"    },
              { label:"Estoque baixo",    value: baixo.toString(),            color:"#fbbf24" },
              { label:"Sem estoque",      value: zerado.toString(),           color:"#f87171" },
              { label:"Peças em estoque", value: pecas.toString(),            color:"#fff"    },
              { label:"Valor em estoque", value: fmtBRL(valor),               color:"#fff"    },
            ].map(s => (
              <div key={s.label}>
                <p style={{ fontFamily:MONO,fontSize:20,fontWeight:700,color:s.color,margin:0 }}>{s.value}</p>
                <p style={{ fontFamily:UI,fontSize:10,color:"rgba(255,255,255,0.4)",margin:"2px 0 0" }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div style={{ display:"flex",gap:7,flexWrap:"wrap" }}>
            {[
              { label:"Entrada", icon:ArrowDown },
              { label:"Saída",   icon:ArrowUp   },
              { label:"Ajuste",  icon:RotateCcw },
            ].map(({ label, icon:Icon }) => (
              <button key={label} style={{
                display:"inline-flex",alignItems:"center",gap:6,
                fontFamily:UI,fontSize:12,fontWeight:700,
                color:"rgba(255,255,255,0.85)",
                background:"rgba(255,255,255,0.08)",
                border:"1px solid rgba(255,255,255,0.18)",
                borderRadius:10,padding:"9px 14px",cursor:"pointer",
                backdropFilter:"blur(8px)",
              }}>
                <Icon size={13}/> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Search + filter ───────────────────────── */}
      <div style={{ display:"flex",gap:10,marginBottom:18,alignItems:"center",flexWrap:"wrap" }}>
        <div style={{ position:"relative",flex:1,minWidth:220 }}>
          <Search size={14} color="var(--text-3)" style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)" }}/>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por produto, SKU ou cor..."
            style={{
              width:"100%",boxSizing:"border-box",
              fontFamily:UI,fontSize:13,color:"var(--text-1)",
              background:"var(--surface)",border:"1px solid var(--border)",
              borderRadius:10,padding:"10px 12px 10px 34px",outline:"none",
            }}
          />
        </div>
        <div style={{ display:"flex",gap:6 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              fontFamily:UI,fontSize:12,fontWeight:600,
              padding:"9px 14px",borderRadius:8,cursor:"pointer",
              background: filter === f ? "var(--accent-bg)" : "var(--surface)",
              border:`1px solid ${filter === f ? "var(--accent)" : "var(--border)"}`,
              color: filter === f ? "var(--accent)" : "var(--text-2)",
              transition:"all 0.15s",
            }}>{f}</button>
          ))}
        </div>
      </div>

      {/* ── SKU cards ─────────────────────────────── */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",
        gap:12,
      }}>
        {filtered.map(s => {
          const st = getStatus(s);
          const active = selected?.id === s.id;
          // fill bar: stock relative to 2× the minimum (a healthy level)
          const pct = Math.min(100, Math.round((s.stock / Math.max(s.minStock * 2, 1)) * 100));
          return (
            <div
              key={s.id}
              onClick={() => setSelected(active ? null : s)}
              style={{
                background:"var(--surface)",
                border:`1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                borderRadius:14,padding:"16px 18px",
                cursor:"pointer",transition:"all 0.15s",
                boxShadow: active ? "0 0 0 3px var(--accent-bg)" : "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              {/* header */}
              <div style={{ display:"flex",alignItems:"flex-start",gap:12,marginBottom:12 }}>
                <div style={{
                  width:40,height:40,borderRadius:10,flexShrink:0,
                  background:st.bg,border:`1.5px solid ${st.color}30`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                }}>
                  <Package size={17} color={st.color}/>
                </div>
                <div style={{ flex:1,minWidth:0 }}>
                  <p style={{
                    fontFamily:UI,fontSize:13,fontWeight:700,color:"var(--text-1)",
                    margin:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
                  }}>{s.product}</p>
                  <p style={{
                    fontFamily:MONO,fontSize:10,color:"var(--text-2)",margin:"3px 0 0",
                    whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
                  }}>{s.sku}</p>
                </div>
                <span style={{
                  fontFamily:UI,fontSize:10,fontWeight:700,
                  color:st.color,background:st.bg,
                  border:`1px solid ${st.color}25`,
                  borderRadius:6,padding:"3px 8px",whiteSpace:"nowrap",
                }}>{st.label}</span>
              </div>

              {/* variation chips */}
              <div style={{ display:"flex",gap:5,marginBottom:12 }}>
                {[s.size, s.color, s.category].map(v => (
                  <span key={v} style={{
                    fontFamily:UI,fontSize:10,fontWeight:600,
                    color:"var(--text-2)",background:"var(--surface-2)",
                    border:"1px solid var(--border)",
                    borderRadius:6,padding:"2px 8px",
                  }}>{v}</span>
                ))}
              </div>

              {/* stock number + fill bar */}
              <div style={{ display:"flex",alignItems:"baseline",gap:7,marginBottom:6 }}>
                {s.stock > 0 && s.stock < s.minStock && (
                  <AlertTriangle size={13} color={st.color} style={{ alignSelf:"center" }}/>
                )}
                <span style={{ fontFamily:MONO,fontSize:22,fontWeight:700,color:st.color }}>
                  {s.stock}
                </span>
                <span style={{ fontFamily:UI,fontSize:11,color:"var(--text-3)" }}>
                  unid. · mín. {s.minStock}
                </span>
              </div>
              <div style={{
                height:4,borderRadius:4,background:"var(--surface-3)",
                overflow:"hidden",marginBottom:12,
              }}>
                <div style={{
                  width:`${pct}%`,height:"100%",borderRadius:4,
                  background:st.color,transition:"width 0.3s",
                }}/>
              </div>

              {/* footer */}
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:8 }}>
                <span style={{ fontFamily:UI,fontSize:10,color:"var(--text-3)",display:"flex",alignItems:"center",gap:4 }}>
                  <MapPin size={10}/> {s.location}
                </span>
                <ChevronRight size={14} color={active ? "var(--accent)" : "var(--text-3)"}
                  style={{ transform: active ? "rotate(90deg)" : "none", transition:"transform 0.2s" }}
                />
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{
            gridColumn:"1/-1",textAlign:"center",padding:"48px 24px",
            fontFamily:UI,fontSize:13,color:"var(--text-2)",
          }}>
            Nenhum SKU encontrado para &quot;{search}&quot;
          </div>
        )}
      </div>

      {/* ── Drawer ────────────────────────────────── */}
      {selected && <SkuDrawer sku={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

/* ─── SKU detail drawer ──────────────────────────── */

function SkuDrawer({ sku: s, onClose }: { sku: Sku; onClose: () => void }) {
  const st = getStatus(s);
  const [movType, setMovType] = useState<"IN" | "OUT" | "ADJ">("IN");
  const [qty, setQty]         = useState(1);
  const [reason, setReason]   = useState("");

  const delta  = movType === "OUT" ? -qty : qty;
  const result = Math.max(0, s.stock + delta);

  return (
    <>
      <div onClick={onClose} style={{
        position:"fixed",inset:0,zIndex:40,
        background:"rgba(0,0,0,0.25)",backdropFilter:"blur(3px)",
      }}/>

      <div style={{
        position:"fixed",top:0,right:0,bottom:0,
        width:"min(480px,100vw)",zIndex:50,
        background:"var(--bg)",
        borderLeft:"1px solid var(--border)",
        boxShadow:"-8px 0 48px rgba(0,0,0,0.14)",
        display:"flex",flexDirection:"column",overflowY:"auto",
      }}>

        {/* header */}
        <div style={{
          background:"linear-gradient(135deg,#0c0420 0%,#190a58 60%,#0b1e66 100%)",
          padding:"24px 24px 20px",position:"relative",overflow:"hidden",flexShrink:0,
        }}>
          <div style={{
            position:"absolute",width:140,height:140,borderRadius:"50%",
            background:`radial-gradient(circle,${st.color}35 0%,transparent 70%)`,
            top:-30,right:40,animation:"drift-1 8s ease-in-out infinite",pointerEvents:"none",
          }}/>

          <button onClick={onClose} style={{
            position:"absolute",top:16,right:16,
            width:32,height:32,borderRadius:8,
            background:"rgba(255,255,255,0.1)",
            border:"1px solid rgba(255,255,255,0.15)",
            cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
          }}>
            <X size={15} color="rgba(255,255,255,0.7)"/>
          </button>

          <div style={{ display:"flex",alignItems:"flex-start",gap:14,position:"relative",zIndex:1 }}>
            <div style={{
              width:52,height:52,borderRadius:12,flexShrink:0,
              background:st.bg,border:`2px solid ${st.color}40`,
              display:"flex",alignItems:"center",justifyContent:"center",
            }}>
              <Package size={22} color={st.color}/>
            </div>
            <div style={{ minWidth:0,paddingRight:40 }}>
              <p style={{ fontFamily:UI,fontSize:16,fontWeight:800,color:"#fff",margin:0 }}>{s.product}</p>
              <p style={{ fontFamily:MONO,fontSize:11,color:"rgba(255,255,255,0.45)",margin:"3px 0 8px" }}>{s.sku}</p>
              <span style={{
                fontFamily:UI,fontSize:10,fontWeight:700,
                color:st.color,background:`${st.color}22`,
                border:`1px solid ${st.color}30`,
                borderRadius:6,padding:"3px 10px",
              }}>{st.label}</span>
            </div>
          </div>

          <div style={{
            display:"flex",gap:24,marginTop:20,flexWrap:"wrap",
            borderTop:"1px solid rgba(255,255,255,0.1)",paddingTop:16,
            position:"relative",zIndex:1,
          }}>
            {[
              { label:"Em estoque",     value:`${s.stock} un`      },
              { label:"Mínimo",         value:`${s.minStock} un`   },
              { label:"Valor em custo", value: fmtBRL(s.stock * s.cost) },
            ].map(x => (
              <div key={x.label}>
                <p style={{ fontFamily:MONO,fontSize:15,fontWeight:700,color:"#fff",margin:0 }}>{x.value}</p>
                <p style={{ fontFamily:UI,fontSize:9.5,color:"rgba(255,255,255,0.4)",margin:"2px 0 0" }}>{x.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* body */}
        <div style={{ padding:"22px 24px",flex:1 }}>

          {/* Ajuste rápido */}
          <Section label="Movimentar estoque">
            {/* type selector */}
            <div style={{ display:"flex",gap:6,marginBottom:14 }}>
              {(["IN","OUT","ADJ"] as const).map(t => {
                const m = MOV_STYLE[t];
                const on = movType === t;
                return (
                  <button key={t} onClick={() => setMovType(t)} style={{
                    flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,
                    fontFamily:UI,fontSize:12,fontWeight:700,
                    padding:"11px 8px",borderRadius:9,cursor:"pointer",
                    background: on ? `${m.color}15` : "var(--surface)",
                    border:`1px solid ${on ? m.color : "var(--border)"}`,
                    color: on ? m.color : "var(--text-2)",
                    transition:"all 0.15s",minHeight:44,
                  }}>
                    <m.icon size={13}/> {m.label}
                  </button>
                );
              })}
            </div>

            {/* counter */}
            <div style={{
              display:"flex",alignItems:"center",justifyContent:"center",gap:14,
              background:"var(--surface)",border:"1px solid var(--border)",
              borderRadius:12,padding:"14px",marginBottom:12,
            }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} style={counterBtn}>
                <Minus size={18} color="var(--text-2)"/>
              </button>
              <div style={{ textAlign:"center",minWidth:80 }}>
                <p style={{ fontFamily:MONO,fontSize:28,fontWeight:700,color:"var(--text-1)",margin:0,lineHeight:1 }}>
                  {qty}
                </p>
                <p style={{ fontFamily:UI,fontSize:10,color:"var(--text-3)",margin:"4px 0 0" }}>unidades</p>
              </div>
              <button onClick={() => setQty(q => q + 1)} style={counterBtn}>
                <Plus size={18} color="var(--text-2)"/>
              </button>
            </div>

            {/* preview */}
            <div style={{
              display:"flex",alignItems:"center",justifyContent:"center",gap:10,
              background:"var(--surface-2)",borderRadius:9,padding:"10px",marginBottom:12,
              fontFamily:MONO,fontSize:13,fontWeight:700,
            }}>
              <span style={{ color:"var(--text-2)" }}>{s.stock}</span>
              <ChevronRight size={14} color="var(--text-3)"/>
              <span style={{ color: MOV_STYLE[movType].color }}>{result}</span>
              <span style={{ fontFamily:UI,fontSize:11,fontWeight:500,color:"var(--text-3)" }}>unidades</span>
            </div>

            <input
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Motivo (ex: Compra fornecedor, Venda #PED-001)"
              style={{
                width:"100%",boxSizing:"border-box",
                fontFamily:UI,fontSize:12,color:"var(--text-1)",
                background:"var(--surface)",border:"1px solid var(--border)",
                borderRadius:9,padding:"11px 12px",outline:"none",
              }}
            />
          </Section>

          {/* Detalhes */}
          <Section label="Detalhes do SKU">
            <div style={{
              display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,
              background:"var(--border)",border:"1px solid var(--border)",
              borderRadius:10,overflow:"hidden",
            }}>
              {[
                { k:"Tamanho",     v:s.size },
                { k:"Cor",         v:s.color },
                { k:"Categoria",   v:s.category },
                { k:"Localização", v:s.location },
                { k:"Custo",       v:fmtBRL(s.cost) },
                { k:"Preço venda", v:fmtBRL(s.price) },
                { k:"Margem",      v:`${Math.round((1 - s.cost / s.price) * 100)}%` },
                { k:"Estoque mín.",v:`${s.minStock} un` },
              ].map(x => (
                <div key={x.k} style={{ background:"var(--surface)",padding:"10px 13px" }}>
                  <p style={{ fontFamily:UI,fontSize:9.5,color:"var(--text-3)",margin:0 }}>{x.k}</p>
                  <p style={{ fontFamily:UI,fontSize:12,fontWeight:600,color:"var(--text-1)",margin:"2px 0 0" }}>{x.v}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Movimentações */}
          <Section label={`Movimentações · ${s.movements.length} registros`}>
            <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
              {s.movements.map((m, i) => {
                const ms = MOV_STYLE[m.type];
                return (
                  <div key={i} style={{
                    display:"flex",alignItems:"center",gap:10,
                    background:"var(--surface)",border:"1px solid var(--border)",
                    borderRadius:8,padding:"9px 12px",
                  }}>
                    <div style={{
                      width:24,height:24,borderRadius:"50%",flexShrink:0,
                      background:`${ms.color}15`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                    }}>
                      <ms.icon size={12} color={ms.color}/>
                    </div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <p style={{
                        fontFamily:UI,fontSize:12,fontWeight:600,color:"var(--text-1)",margin:0,
                        whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
                      }}>{m.reason}</p>
                      <p style={{ fontFamily:UI,fontSize:10,color:"var(--text-3)",margin:"2px 0 0" }}>{m.time}</p>
                    </div>
                    <span style={{ fontFamily:MONO,fontSize:12,fontWeight:700,color:ms.color,whiteSpace:"nowrap" }}>
                      {m.qty > 0 ? "+" : ""}{m.qty}
                    </span>
                  </div>
                );
              })}
            </div>
            <button style={{
              display:"flex",alignItems:"center",gap:6,marginTop:8,
              fontFamily:UI,fontSize:11,fontWeight:600,
              color:"var(--text-2)",background:"transparent",
              border:"1px dashed var(--border)",borderRadius:8,
              padding:"8px 14px",cursor:"pointer",width:"100%",justifyContent:"center",
            }}>
              <History size={12}/> Ver histórico completo
            </button>
          </Section>

          {/* actions */}
          <div style={{ display:"flex",gap:8,paddingBottom:4 }}>
            <button style={{
              flex:1,fontFamily:UI,fontSize:13,fontWeight:700,
              color:"#fff",background:"var(--accent)",
              border:"none",borderRadius:10,padding:"14px",
              cursor:"pointer",minHeight:48,
              boxShadow:"0 4px 14px rgba(124,63,237,0.25)",
            }}>
              Confirmar {MOV_STYLE[movType].label.toLowerCase()}
            </button>
            <button style={{
              fontFamily:UI,fontSize:13,fontWeight:500,
              color:"var(--text-2)",background:"var(--surface)",
              border:"1px solid var(--border)",borderRadius:10,
              padding:"14px 18px",cursor:"pointer",minHeight:48,
            }}>
              Editar SKU
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Helpers ──────────────────────────────────────── */

const counterBtn: React.CSSProperties = {
  width:48,height:48,borderRadius:12,flexShrink:0,
  background:"var(--surface-2)",border:"1px solid var(--border)",
  cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
};

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
