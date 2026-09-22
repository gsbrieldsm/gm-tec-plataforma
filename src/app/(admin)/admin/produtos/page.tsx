"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search, X, Plus, Shirt, ChevronRight, Pencil, Trash2,
  Layers, Store, AlertTriangle, Copy,
} from "lucide-react";
import {
  CHANNELS, MOCK_PRODUCTS, totalStock, margin,
  type ChannelKey, type Product,
} from "@/lib/catalog";

const UI   = "var(--font-space), var(--font-geist-sans), sans-serif";
const MONO = "var(--font-space-mono), var(--font-geist-mono), monospace";

function getStatus(p: Product) {
  if (!p.active)            return { label: "Inativo",     color: "#64748b", bg: "rgba(100,116,139,0.10)" };
  if (totalStock(p) === 0)  return { label: "Sem estoque", color: "#dc2626", bg: "rgba(220,38,38,0.10)"   };
  if (totalStock(p) < 10)   return { label: "Estoque baixo", color: "#d97706", bg: "rgba(217,119,6,0.10)" };
  return                         { label: "Ativo",       color: "#059669", bg: "rgba(5,150,105,0.10)"  };
}

function fmtBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const FILTERS = ["Todos", "Ativo", "Estoque baixo", "Sem estoque", "Inativo"];

export default function ProdutosPage() {
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("Todos");
  const [selected, setSelected] = useState<Product | null>(null);

  const filtered = MOCK_PRODUCTS.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || p.name.toLowerCase().includes(q)
      || p.sku.toLowerCase().includes(q)
      || p.category.toLowerCase().includes(q);
    const matchFilter = filter === "Todos" || getStatus(p).label === filter;
    return matchSearch && matchFilter;
  });

  const ativos    = MOCK_PRODUCTS.filter(p => p.active).length;
  const variacoes = MOCK_PRODUCTS.reduce((a, p) => a + p.variants.length, 0);
  const pecas     = MOCK_PRODUCTS.reduce((a, p) => a + totalStock(p), 0);
  const catalogo  = MOCK_PRODUCTS.reduce((a, p) => a + totalStock(p) * p.price, 0);

  return (
    <>
      {/* ── Hero ──────────────────────────────────── */}
      <div className="admin-hero" style={{
        position:"relative",borderRadius:20,overflow:"hidden",
        background:"linear-gradient(135deg,#0c0420 0%,#190a58 35%,#0b1e66 65%,#062244 100%)",
        padding:"32px 32px 28px",marginBottom:24,
      }}>
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

        <div className="admin-hero-tags" style={{
          position:"absolute",top:16,right:20,
          display:"flex",gap:7,flexWrap:"wrap",justifyContent:"flex-end",maxWidth:280,
        }}>
          {["Catálogo","Variações","Preços","Margem","Canais"].map((t,i) => (
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

        <div style={{ position:"relative",zIndex:1,maxWidth:460 }}>
          <p style={{
            fontFamily:UI,fontSize:10,fontWeight:700,
            color:"rgba(255,255,255,0.4)",letterSpacing:"0.16em",
            textTransform:"uppercase",marginBottom:8,
          }}>OPERAÇÕES · CATÁLOGO</p>
          <h1 style={{
            fontFamily:UI,fontSize:26,fontWeight:800,
            color:"#fff",margin:"0 0 8px",lineHeight:1.15,
          }}>Produtos</h1>
          <p style={{ fontFamily:UI,fontSize:13,color:"rgba(255,255,255,0.5)",margin:0 }}>
            Catálogo completo — variações, preços, margem e onde cada peça está publicada.
          </p>
        </div>

        {/* stats + novo produto */}
        <div className="admin-hero-stats" style={{
          position:"relative",zIndex:1,
          display:"flex",alignItems:"flex-end",justifyContent:"space-between",
          gap:24,marginTop:26,flexWrap:"wrap",
          borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:18,
        }}>
          <div style={{ display:"flex",gap:28,flexWrap:"wrap" }}>
            {[
              { label:"Produtos",         value: MOCK_PRODUCTS.length.toString() },
              { label:"Ativos",           value: ativos.toString() },
              { label:"Variações (SKUs)", value: variacoes.toString() },
              { label:"Peças em estoque", value: pecas.toString() },
              { label:"Valor do catálogo",value: fmtBRL(catalogo) },
            ].map(s => (
              <div key={s.label}>
                <p style={{ fontFamily:MONO,fontSize:20,fontWeight:700,color:"#fff",margin:0 }}>{s.value}</p>
                <p style={{ fontFamily:UI,fontSize:10,color:"rgba(255,255,255,0.4)",margin:"2px 0 0" }}>{s.label}</p>
              </div>
            ))}
          </div>

          <Link href="/admin/produtos/novo" style={{
            display:"inline-flex",alignItems:"center",gap:6,
            fontFamily:UI,fontSize:12,fontWeight:700,
            color:"rgba(255,255,255,0.85)",
            background:"rgba(255,255,255,0.08)",
            border:"1px solid rgba(255,255,255,0.18)",
            borderRadius:10,padding:"9px 16px",textDecoration:"none",
            backdropFilter:"blur(8px)",
          }}>
            <Plus size={13}/> Novo Produto
          </Link>
        </div>
      </div>

      {/* ── Search + filter ───────────────────────── */}
      <div style={{ display:"flex",gap:10,marginBottom:18,alignItems:"center",flexWrap:"wrap" }}>
        <div style={{ position:"relative",flex:1,minWidth:220 }}>
          <Search size={14} color="var(--text-3)" style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)" }}/>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por produto, SKU ou categoria..."
            style={{
              width:"100%",boxSizing:"border-box",
              fontFamily:UI,fontSize:13,color:"var(--text-1)",
              background:"var(--surface)",border:"1px solid var(--border)",
              borderRadius:10,padding:"10px 12px 10px 34px",outline:"none",
            }}
          />
        </div>
        <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
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

      {/* ── Product cards ─────────────────────────── */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",
        gap:14,
      }}>
        {filtered.map(p => {
          const st = getStatus(p);
          const stock = totalStock(p);
          const active = selected?.id === p.id;
          return (
            <div
              key={p.id}
              onClick={() => setSelected(active ? null : p)}
              style={{
                background:"var(--surface)",
                border:`1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                borderRadius:14,overflow:"hidden",
                cursor:"pointer",transition:"all 0.15s",
                boxShadow: active ? "0 0 0 3px var(--accent-bg)" : "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              {/* image band */}
              <div style={{
                position:"relative",aspectRatio:"16 / 9",
                background:`linear-gradient(135deg,${p.hue}18 0%,${p.hue}08 60%,var(--surface-2) 100%)`,
                borderBottom:"1px solid var(--border)",
                display:"flex",alignItems:"center",justifyContent:"center",
              }}>
                <Shirt size={32} color={`${p.hue}55`} strokeWidth={1.4}/>

                {/* category chip */}
                <span style={{
                  position:"absolute",top:10,left:10,
                  fontFamily:UI,fontSize:10,fontWeight:600,
                  color:"var(--text-2)",background:"var(--surface)",
                  border:"1px solid var(--border)",
                  borderRadius:6,padding:"3px 8px",
                }}>{p.category}</span>

                {/* status badge */}
                <span style={{
                  position:"absolute",top:10,right:10,
                  fontFamily:UI,fontSize:10,fontWeight:700,
                  color:st.color,background:"var(--surface)",
                  border:`1px solid ${st.color}35`,
                  borderRadius:6,padding:"3px 8px",whiteSpace:"nowrap",
                }}>{st.label}</span>

                {/* channel dots */}
                <div style={{ position:"absolute",bottom:10,left:10,display:"flex",gap:4 }}>
                  {p.channels.map(ch => (
                    <span key={ch} title={CHANNELS[ch].label} style={{
                      width:7,height:7,borderRadius:"50%",
                      background:CHANNELS[ch].color,
                      border:"1px solid rgba(255,255,255,0.5)",
                    }}/>
                  ))}
                </div>
              </div>

              {/* content */}
              <div style={{ padding:"14px 16px 16px" }}>
                <p style={{
                  fontFamily:UI,fontSize:13,fontWeight:700,color:"var(--text-1)",
                  margin:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
                }}>{p.name}</p>
                <p style={{ fontFamily:MONO,fontSize:10,color:"var(--text-2)",margin:"3px 0 11px" }}>{p.sku}</p>

                <div style={{ display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:8,marginBottom:10 }}>
                  <span style={{ fontFamily:MONO,fontSize:17,fontWeight:700,color:"var(--text-1)" }}>
                    {fmtBRL(p.price)}
                  </span>
                  <span style={{
                    fontFamily:UI,fontSize:10,fontWeight:700,
                    color:"#059669",background:"rgba(5,150,105,0.10)",
                    borderRadius:5,padding:"2px 7px",
                  }}>{margin(p)}% margem</span>
                </div>

                <div style={{
                  display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,
                  borderTop:"1px solid var(--border)",paddingTop:10,
                }}>
                  <span style={{ fontFamily:UI,fontSize:10.5,color:"var(--text-2)",display:"flex",alignItems:"center",gap:5 }}>
                    <Layers size={11} color="var(--text-3)"/> {p.variants.length} variações
                  </span>
                  <span style={{
                    fontFamily:UI,fontSize:10.5,fontWeight:600,
                    color: stock === 0 ? "#dc2626" : stock < 10 ? "#d97706" : "var(--text-2)",
                    display:"flex",alignItems:"center",gap:4,
                  }}>
                    {stock > 0 && stock < 10 && <AlertTriangle size={10}/>}
                    {stock} un
                  </span>
                  <ChevronRight size={13} color={active ? "var(--accent)" : "var(--text-3)"}
                    style={{ transform: active ? "rotate(90deg)" : "none", transition:"transform 0.2s" }}
                  />
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{
            gridColumn:"1/-1",textAlign:"center",padding:"48px 24px",
            fontFamily:UI,fontSize:13,color:"var(--text-2)",
          }}>
            Nenhum produto encontrado para &quot;{search}&quot;
          </div>
        )}
      </div>

      {/* ── Drawer ────────────────────────────────── */}
      {selected && <ProductDrawer product={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

/* ─── Product detail drawer ──────────────────────── */

function ProductDrawer({ product: p, onClose }: { product: Product; onClose: () => void }) {
  const st = getStatus(p);
  const stock = totalStock(p);

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
            background:`radial-gradient(circle,${p.hue}40 0%,transparent 70%)`,
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
              width:56,height:56,borderRadius:12,flexShrink:0,
              background:`linear-gradient(135deg,${p.hue}35,${p.hue}12)`,
              border:`1.5px solid ${p.hue}50`,
              display:"flex",alignItems:"center",justifyContent:"center",
            }}>
              <Shirt size={24} color={p.hue} strokeWidth={1.6}/>
            </div>
            <div style={{ minWidth:0,paddingRight:40 }}>
              <p style={{ fontFamily:UI,fontSize:16,fontWeight:800,color:"#fff",margin:0 }}>{p.name}</p>
              <p style={{ fontFamily:MONO,fontSize:11,color:"rgba(255,255,255,0.45)",margin:"3px 0 8px" }}>{p.sku}</p>
              <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                <span style={{
                  fontFamily:UI,fontSize:10,fontWeight:700,
                  color:st.color,background:`${st.color}22`,
                  border:`1px solid ${st.color}30`,
                  borderRadius:6,padding:"3px 10px",
                }}>{st.label}</span>
                <span style={{
                  fontFamily:UI,fontSize:10,fontWeight:600,
                  color:"rgba(255,255,255,0.6)",
                  background:"rgba(255,255,255,0.08)",
                  border:"1px solid rgba(255,255,255,0.14)",
                  borderRadius:6,padding:"3px 10px",
                }}>{p.category}</span>
              </div>
            </div>
          </div>

          <div style={{
            display:"flex",gap:24,marginTop:20,flexWrap:"wrap",
            borderTop:"1px solid rgba(255,255,255,0.1)",paddingTop:16,
            position:"relative",zIndex:1,
          }}>
            {[
              { label:"Preço de venda", value: fmtBRL(p.price)     },
              { label:"Em estoque",     value: `${stock} un`       },
              { label:"Variações",      value: `${p.variants.length}` },
              { label:"Margem",         value: `${margin(p)}%`     },
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

          {/* Preço */}
          <Section label="Preço e margem">
            <div style={{
              display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,
              background:"var(--border)",border:"1px solid var(--border)",
              borderRadius:10,overflow:"hidden",
            }}>
              {[
                { k:"Custo unitário", v: fmtBRL(p.cost) },
                { k:"Preço de venda", v: fmtBRL(p.price) },
                { k:"Lucro por peça", v: fmtBRL(p.price - p.cost) },
                { k:"Margem",         v: `${margin(p)}%` },
              ].map(x => (
                <div key={x.k} style={{ background:"var(--surface)",padding:"10px 13px" }}>
                  <p style={{ fontFamily:UI,fontSize:9.5,color:"var(--text-3)",margin:0 }}>{x.k}</p>
                  <p style={{ fontFamily:MONO,fontSize:13,fontWeight:700,color:"var(--text-1)",margin:"2px 0 0" }}>{x.v}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Variações */}
          <Section label={`Variações · ${p.variants.length} SKUs`}>
            <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
              {p.variants.map((v, i) => {
                const c = v.stock === 0 ? "#dc2626" : v.stock < 5 ? "#d97706" : "#059669";
                return (
                  <div key={i} style={{
                    display:"flex",alignItems:"center",gap:8,
                    background:"var(--surface)",border:"1px solid var(--border)",
                    borderRadius:8,padding:"9px 12px",
                  }}>
                    <span style={{
                      fontFamily:UI,fontSize:10.5,fontWeight:700,
                      color:"var(--text-2)",background:"var(--surface-2)",
                      border:"1px solid var(--border)",
                      borderRadius:6,padding:"3px 9px",minWidth:42,textAlign:"center",
                    }}>{v.size}</span>
                    <span style={{ fontFamily:UI,fontSize:12,color:"var(--text-1)",flex:1 }}>{v.color}</span>
                    <span style={{ fontFamily:MONO,fontSize:12,fontWeight:700,color:c }}>
                      {v.stock} un
                    </span>
                    <span style={{
                      width:6,height:6,borderRadius:"50%",background:c,flexShrink:0,
                    }}/>
                  </div>
                );
              })}
            </div>
            <button style={{
              display:"flex",alignItems:"center",justifyContent:"center",gap:6,
              marginTop:8,width:"100%",
              fontFamily:UI,fontSize:11,fontWeight:600,
              color:"var(--accent)",background:"transparent",
              border:"1px dashed var(--border-hi)",borderRadius:8,
              padding:"9px 14px",cursor:"pointer",
            }}>
              <Plus size={12}/> Adicionar variação
            </button>
          </Section>

          {/* Canais */}
          <Section label="Publicado em">
            <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
              {(Object.keys(CHANNELS) as ChannelKey[]).map(ch => {
                const on = p.channels.includes(ch);
                const c  = CHANNELS[ch];
                return (
                  <div key={ch} style={{
                    display:"flex",alignItems:"center",gap:10,
                    background:"var(--surface)",
                    border:`1px solid ${on ? `${c.color}35` : "var(--border)"}`,
                    borderRadius:8,padding:"9px 12px",
                    opacity: on ? 1 : 0.6,
                  }}>
                    <div style={{
                      width:24,height:24,borderRadius:7,flexShrink:0,
                      background:`${c.color}18`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                    }}>
                      <Store size={12} color={c.color}/>
                    </div>
                    <span style={{ fontFamily:UI,fontSize:12,fontWeight:600,color:"var(--text-1)",flex:1 }}>
                      {c.label}
                    </span>
                    <span style={{
                      fontFamily:UI,fontSize:10,fontWeight:700,
                      color: on ? c.color : "var(--text-3)",
                      background: on ? `${c.color}15` : "var(--surface-2)",
                      borderRadius:5,padding:"3px 9px",whiteSpace:"nowrap",
                    }}>
                      {on ? "Publicado" : "Publicar"}
                    </span>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* Descrição */}
          <Section label="Descrição">
            <textarea
              defaultValue={p.description}
              rows={3}
              style={{
                width:"100%",boxSizing:"border-box",
                fontFamily:UI,fontSize:12,color:"var(--text-1)",
                background:"var(--surface)",
                border:"1px solid var(--border)",
                borderRadius:8,padding:"10px 12px",
                resize:"vertical",outline:"none",lineHeight:1.5,
              }}
            />
          </Section>

          {/* actions */}
          <div style={{ display:"flex",gap:8,paddingBottom:4 }}>
            <Link href={`/admin/produtos/${p.id}`} style={{
              flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:7,
              fontFamily:UI,fontSize:13,fontWeight:700,
              color:"#fff",background:"var(--accent)",
              border:"none",borderRadius:10,padding:"14px",
              textDecoration:"none",minHeight:48,
              boxShadow:"0 4px 14px rgba(124,63,237,0.25)",
            }}>
              <Pencil size={14}/> Editar produto
            </Link>
            <button title="Duplicar" style={iconBtn}>
              <Copy size={15} color="var(--text-2)"/>
            </button>
            <button title="Excluir" style={iconBtn}>
              <Trash2 size={15} color="var(--red)"/>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Helpers ──────────────────────────────────────── */

const iconBtn: React.CSSProperties = {
  width:48,height:48,borderRadius:10,flexShrink:0,
  background:"var(--surface)",border:"1px solid var(--border)",
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
