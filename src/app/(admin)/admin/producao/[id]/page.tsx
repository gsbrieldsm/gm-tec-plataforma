"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Factory, CheckCircle, Circle, Plus, Minus,
  Save, ChevronRight, Calendar, Tag, StickyNote,
} from "lucide-react";

/* ── Types ─────────────────────────────────────── */
type Stage = { id: string; label: string; done: boolean };
type Item  = { id: string; name: string; sku: string; qty: number; done: number; stages: Stage[] };
type Status = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

/* ── Mock data for PROD-001 ─────────────────────── */
const MOCK: {
  id: string; orderNumber: string; status: Status;
  priority: string; dueDate: string; notes: string;
  items: Item[];
} = {
  id: "1",
  orderNumber: "PROD-001",
  status: "IN_PROGRESS",
  priority: "HIGH",
  dueDate: "2026-09-20",
  notes: "Prioridade para reposição de estoque. Atenção ao corte da estampa.",
  items: [
    {
      id: "a",
      name: "Vestido Floral Verão",
      sku: "VFV-001-P-ROSA",
      qty: 20,
      done: 12,
      stages: [
        { id: "corte",      label: "Corte",      done: true  },
        { id: "costura",    label: "Costura",    done: true  },
        { id: "acabamento", label: "Acabamento", done: false },
        { id: "qualidade",  label: "Qualidade",  done: false },
      ],
    },
    {
      id: "b",
      name: "Vestido Floral Verão",
      sku: "VFV-001-M-ROSA",
      qty: 20,
      done: 8,
      stages: [
        { id: "corte",      label: "Corte",      done: true  },
        { id: "costura",    label: "Costura",    done: false },
        { id: "acabamento", label: "Acabamento", done: false },
        { id: "qualidade",  label: "Qualidade",  done: false },
      ],
    },
  ],
};

const PRIORITY_LABEL: Record<string, string> = {
  LOW: "Baixa", NORMAL: "Normal", HIGH: "Alta", URGENT: "Urgente",
};
const PRIORITY_COLOR: Record<string, string> = {
  LOW: "var(--text-3)", NORMAL: "#3b82f6", HIGH: "#d97706", URGENT: "#dc2626",
};
const STATUS_NEXT: Record<Status, { label: string; next: Status } | null> = {
  PLANNED:     { label: "Iniciar produção →", next: "IN_PROGRESS" },
  IN_PROGRESS: { label: "Marcar como concluída →", next: "COMPLETED" },
  COMPLETED:   null,
  CANCELLED:   null,
};
const STATUS_LABEL: Record<Status, string> = {
  PLANNED: "Planejado", IN_PROGRESS: "Em Andamento",
  COMPLETED: "Concluído", CANCELLED: "Cancelado",
};
const STATUS_COLOR: Record<Status, string> = {
  PLANNED: "#3b82f6", IN_PROGRESS: "#d97706",
  COMPLETED: "#059669", CANCELLED: "#dc2626",
};

const UI   = "var(--font-space), var(--font-geist-sans), sans-serif";
const MONO = "var(--font-space-mono), var(--font-geist-mono), monospace";

/* ── Progress ring ──────────────────────────────── */
function Ring({ pct, size = 96 }: { pct: number; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="var(--surface-3)" strokeWidth={8}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="var(--accent)" strokeWidth={8}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: "stroke-dasharray 0.4s ease" }}
      />
      <text x={size/2} y={size/2 + 5} textAnchor="middle"
        fontSize={size === 96 ? 18 : 14} fontWeight="700"
        fill="var(--text-1)" fontFamily={MONO}>
        {pct}%
      </text>
    </svg>
  );
}

/* ── Page ───────────────────────────────────────── */
export default function ProducaoDetailPage() {
  const [prod, setProd] = useState(MOCK);
  const [notes, setNotes] = useState(prod.notes);
  const [saved, setSaved] = useState(false);

  const totalQty  = prod.items.reduce((s, i) => s + i.qty,  0);
  const totalDone = prod.items.reduce((s, i) => s + i.done, 0);
  const pct = totalQty === 0 ? 0 : Math.round((totalDone / totalQty) * 100);

  /* toggle stage */
  function toggleStage(itemId: string, stageId: string) {
    setProd(p => ({
      ...p,
      items: p.items.map(it =>
        it.id !== itemId ? it : {
          ...it,
          stages: it.stages.map(st =>
            st.id !== stageId ? st : { ...st, done: !st.done }
          ),
        }
      ),
    }));
  }

  /* update quantity */
  function updateQty(itemId: string, delta: number) {
    setProd(p => ({
      ...p,
      items: p.items.map(it =>
        it.id !== itemId ? it : {
          ...it,
          done: Math.max(0, Math.min(it.qty, it.done + delta)),
        }
      ),
    }));
  }

  /* advance status */
  function advanceStatus() {
    const next = STATUS_NEXT[prod.status];
    if (!next) return;
    setProd(p => ({ ...p, status: next.next }));
  }

  /* save (mock) */
  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const nextAction = STATUS_NEXT[prod.status];

  return (
    <div style={{ maxWidth: 780, fontFamily: UI }}>

      {/* ── Back ────────────────────────────────── */}
      <Link href="/admin/producao" style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontFamily: UI, fontSize: 12, fontWeight: 500,
        color: "var(--text-2)", textDecoration: "none",
        marginBottom: 20,
      }}>
        <ArrowLeft size={14}/> Voltar à lista
      </Link>

      {/* ── Header card ─────────────────────────── */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "24px 28px",
        marginBottom: 16,
        display: "flex", alignItems: "center", gap: 24,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}>
        <Ring pct={pct}/>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "var(--accent-bg)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Factory size={18} color="var(--accent)"/>
            </div>
            <span style={{
              fontFamily: MONO, fontSize: 20, fontWeight: 700,
              color: "var(--text-1)", letterSpacing: "-0.02em",
            }}>{prod.orderNumber}</span>
            <span style={{
              fontFamily: UI, fontSize: 11, fontWeight: 700,
              color: STATUS_COLOR[prod.status],
              background: STATUS_COLOR[prod.status] + "15",
              border: `1px solid ${STATUS_COLOR[prod.status]}30`,
              borderRadius: 6, padding: "2px 9px", letterSpacing: "0.04em",
            }}>{STATUS_LABEL[prod.status]}</span>
          </div>

          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Tag size={12} color="var(--text-3)"/>
              <span style={{ fontSize: 12, color: "var(--text-2)" }}>Prioridade: </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: PRIORITY_COLOR[prod.priority] }}>
                {PRIORITY_LABEL[prod.priority]}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Calendar size={12} color="var(--text-3)"/>
              <span style={{ fontSize: 12, color: "var(--text-2)" }}>Prazo: </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-1)" }}>
                {new Date(prod.dueDate + "T00:00:00").toLocaleDateString("pt-BR")}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Factory size={12} color="var(--text-3)"/>
              <span style={{ fontSize: 12, color: "var(--text-2)" }}>
                {totalDone} / {totalQty} peças concluídas
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Items ───────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
        {prod.items.map(item => {
          const itemPct = item.qty === 0 ? 0 : Math.round((item.done / item.qty) * 100);
          const allStagesDone = item.stages.every(s => s.done);

          return (
            <div key={item.id} style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            }}>
              {/* item header */}
              <div style={{
                padding: "16px 20px 12px",
                borderBottom: "1px solid var(--border-2)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <div style={{ fontFamily: UI, fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginBottom: 3 }}>
                    {item.name}
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 11, color: "var(--text-3)", letterSpacing: "0.04em" }}>
                    {item.sku}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Ring pct={itemPct} size={56}/>
                  {allStagesDone && (
                    <CheckCircle size={20} color="#059669"/>
                  )}
                </div>
              </div>

              {/* stages checklist */}
              <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border-2)" }}>
                <div style={{
                  fontFamily: UI, fontSize: 9.5, fontWeight: 600,
                  color: "var(--text-3)", letterSpacing: "0.12em",
                  textTransform: "uppercase", marginBottom: 10,
                }}>Etapas</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {item.stages.map((stage, si) => {
                    const prevDone = si === 0 || item.stages[si - 1].done;
                    const canToggle = prevDone; // must complete in order
                    return (
                      <button
                        key={stage.id}
                        onClick={() => canToggle && toggleStage(item.id, stage.id)}
                        style={{
                          display: "flex", alignItems: "center", gap: 7,
                          padding: "10px 16px", borderRadius: 10,
                          fontFamily: UI, fontSize: 13, fontWeight: 500,
                          cursor: canToggle ? "pointer" : "not-allowed",
                          transition: "all 0.15s",
                          background: stage.done
                            ? "rgba(5,150,105,0.09)"
                            : canToggle ? "var(--surface-2)" : "var(--surface-3)",
                          border: `1.5px solid ${stage.done
                            ? "rgba(5,150,105,0.3)"
                            : canToggle ? "var(--border)" : "var(--border-2)"}`,
                          color: stage.done ? "#059669"
                            : canToggle ? "var(--text-1)" : "var(--text-3)",
                          opacity: !canToggle && !stage.done ? 0.5 : 1,
                          minHeight: 44, // tablet touch target
                        }}
                      >
                        {stage.done
                          ? <CheckCircle size={15} color="#059669"/>
                          : <Circle size={15} color={canToggle ? "var(--text-2)" : "var(--text-3)"}/>
                        }
                        {stage.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* quantity counter */}
              <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 600, color: "var(--text-3)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  Qtd. concluída
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 0, marginLeft: "auto" }}>
                  <button
                    onClick={() => updateQty(item.id, -1)}
                    disabled={item.done <= 0}
                    style={{
                      width: 48, height: 48, borderRadius: "10px 0 0 10px",
                      background: "var(--surface-2)",
                      border: "1.5px solid var(--border)",
                      borderRight: "none",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: item.done <= 0 ? "not-allowed" : "pointer",
                      opacity: item.done <= 0 ? 0.4 : 1,
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={e => { if (item.done > 0) (e.currentTarget as HTMLElement).style.background = "var(--surface-3)"; }}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"}
                  >
                    <Minus size={18} color="var(--text-1)"/>
                  </button>

                  <div style={{
                    width: 80, height: 48,
                    background: "var(--surface)",
                    border: "1.5px solid var(--border)",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color: "var(--text-1)", lineHeight: 1 }}>
                      {item.done}
                    </span>
                    <span style={{ fontFamily: UI, fontSize: 9, color: "var(--text-3)", letterSpacing: "0.06em", marginTop: 1 }}>
                      de {item.qty}
                    </span>
                  </div>

                  <button
                    onClick={() => updateQty(item.id, 1)}
                    disabled={item.done >= item.qty}
                    style={{
                      width: 48, height: 48, borderRadius: "0 10px 10px 0",
                      background: item.done >= item.qty ? "var(--surface-2)" : "var(--accent)",
                      border: "1.5px solid",
                      borderColor: item.done >= item.qty ? "var(--border)" : "var(--accent)",
                      borderLeft: "none",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: item.done >= item.qty ? "not-allowed" : "pointer",
                      opacity: item.done >= item.qty ? 0.4 : 1,
                      transition: "all 0.1s",
                    }}
                  >
                    <Plus size={18} color={item.done >= item.qty ? "var(--text-1)" : "#fff"}/>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Notes ───────────────────────────────── */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "18px 20px",
        marginBottom: 20,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 7, marginBottom: 10,
          fontFamily: UI, fontSize: 9.5, fontWeight: 600,
          color: "var(--text-3)", letterSpacing: "0.12em", textTransform: "uppercase",
        }}>
          <StickyNote size={12} color="var(--text-3)"/> Observações
        </div>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          placeholder="Adicionar observações sobre essa produção..."
          style={{
            width: "100%", resize: "vertical",
            fontFamily: UI, fontSize: 13,
            color: "var(--text-1)",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 8, padding: "10px 12px",
            outline: "none", lineHeight: 1.6,
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* ── Actions ─────────────────────────────── */}
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={save}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            fontFamily: UI, fontSize: 13, fontWeight: 600,
            color: saved ? "#059669" : "var(--text-1)",
            background: saved ? "rgba(5,150,105,0.08)" : "var(--surface)",
            border: `1.5px solid ${saved ? "rgba(5,150,105,0.3)" : "var(--border)"}`,
            borderRadius: 10, padding: "14px 24px",
            cursor: "pointer", transition: "all 0.2s", minHeight: 52,
          }}
        >
          {saved ? <CheckCircle size={16} color="#059669"/> : <Save size={16}/>}
          {saved ? "Salvo!" : "Salvar progresso"}
        </button>

        {nextAction && prod.status !== "COMPLETED" && (
          <button
            onClick={advanceStatus}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              fontFamily: UI, fontSize: 13, fontWeight: 700,
              color: "#fff",
              background: prod.status === "IN_PROGRESS"
                ? "linear-gradient(135deg, #059669, #047857)"
                : "linear-gradient(135deg, var(--accent), var(--accent-hi))",
              border: "none", borderRadius: 10, padding: "14px 24px",
              cursor: "pointer", minHeight: 52,
              boxShadow: prod.status === "IN_PROGRESS"
                ? "0 4px 16px rgba(5,150,105,0.3)"
                : "0 4px 16px rgba(124,63,237,0.25)",
              transition: "all 0.15s",
              letterSpacing: "0.01em",
            }}
          >
            {prod.status === "IN_PROGRESS" && <CheckCircle size={16}/>}
            {nextAction.label} <ChevronRight size={15}/>
          </button>
        )}

        {prod.status === "COMPLETED" && (
          <div style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontFamily: UI, fontSize: 13, fontWeight: 600,
            color: "#059669",
            background: "rgba(5,150,105,0.07)",
            border: "1.5px solid rgba(5,150,105,0.25)",
            borderRadius: 10, padding: "14px 24px", minHeight: 52,
          }}>
            <CheckCircle size={16} color="#059669"/> Produção concluída
          </div>
        )}
      </div>

      {/* tablet hint */}
      <p style={{
        fontFamily: UI, fontSize: 10.5, color: "var(--text-3)",
        marginTop: 14, textAlign: "center",
      }}>
        As alterações ficam salvas nesta sessão · Integração com banco de dados em breve
      </p>
    </div>
  );
}
