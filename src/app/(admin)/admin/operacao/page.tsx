"use client";

import { useState, useRef, useEffect } from "react";
import { AdminHeader } from "@/components/admin/header";
import { formatCurrency } from "@/lib/utils";
import {
  Scissors, Shirt, Sparkles, ShieldCheck, Package, Truck, CheckCircle2,
  Settings2, Plus, Trash2, ChevronLeft, ChevronRight, X, Check, Zap,
  type LucideIcon,
} from "lucide-react";

/* ── Types ──────────────────────────────────────────── */
type Order = { id: string; customer: string; product: string; value: number; due: string };
type Stage = { id: string; label: string; icon: LucideIcon; color: string; glow: string; orders: Order[] };

/* ── Palette ────────────────────────────────────────── */
const PALETTE = [
  { color: "#6366f1", glow: "rgba(99,102,241,0.15)" },
  { color: "#f59e0b", glow: "rgba(245,158,11,0.12)" },
  { color: "#8b5cf6", glow: "rgba(139,92,246,0.15)" },
  { color: "#38bdf8", glow: "rgba(56,189,248,0.12)" },
  { color: "#34d399", glow: "rgba(52,211,153,0.12)" },
  { color: "#f472b6", glow: "rgba(244,114,182,0.12)" },
  { color: "#fb923c", glow: "rgba(251,146,60,0.12)" },
];
const ICON_CYCLE: LucideIcon[] = [Zap, Scissors, Shirt, Sparkles, ShieldCheck, Package, Truck, CheckCircle2];

/* ── Initial data ───────────────────────────────────── */
const INITIAL_STAGES: Stage[] = [
  {
    id: "pedido", label: "Pedido", icon: CheckCircle2, color: "#6366f1", glow: "rgba(99,102,241,0.15)",
    orders: [
      { id: "PED-012", customer: "Beatriz Mendes", product: "Vestido Linho P", value: 310, due: "hoje" },
      { id: "PED-013", customer: "Camila Torres", product: "Conjunto Jeans M", value: 420, due: "hoje" },
      { id: "PED-014", customer: "Lucas Ramos", product: "Calça Moletom G", value: 189, due: "amanhã" },
    ],
  },
  {
    id: "corte", label: "Corte", icon: Scissors, color: "#f59e0b", glow: "rgba(245,158,11,0.12)",
    orders: [
      { id: "PED-009", customer: "Renata Souza", product: "Blusa Crepe PP", value: 159, due: "hoje" },
      { id: "PED-010", customer: "Felipe Dias", product: "Short Tactel M", value: 95, due: "amanhã" },
    ],
  },
  {
    id: "costura", label: "Costura", icon: Shirt, color: "#8b5cf6", glow: "rgba(139,92,246,0.15)",
    orders: [
      { id: "PED-006", customer: "Ana Lima", product: "Vestido Floral G", value: 380, due: "hoje" },
      { id: "PED-007", customer: "Pedro Castro", product: "Jaqueta Jeans M", value: 520, due: "amanhã" },
      { id: "PED-008", customer: "Fernanda Costa", product: "Saia Midi P", value: 240, due: "amanhã" },
    ],
  },
  {
    id: "acabamento", label: "Acabamento", icon: Sparkles, color: "#38bdf8", glow: "rgba(56,189,248,0.12)",
    orders: [
      { id: "PED-004", customer: "Juliana Pires", product: "Blusa Tricot M", value: 290, due: "hoje" },
      { id: "PED-005", customer: "Roberto Nunes", product: "Calça Social G", value: 350, due: "hoje" },
    ],
  },
  {
    id: "qualidade", label: "Qualidade", icon: ShieldCheck, color: "#34d399", glow: "rgba(52,211,153,0.12)",
    orders: [
      { id: "PED-003", customer: "Marina Alves", product: "Conjunto P", value: 420, due: "hoje" },
    ],
  },
  {
    id: "embalagem", label: "Embalagem", icon: Package, color: "#f472b6", glow: "rgba(244,114,182,0.12)",
    orders: [
      { id: "PED-002", customer: "Sofia Rocha", product: "Vestido Festa M", value: 580, due: "agora" },
      { id: "PED-001", customer: "Clara Santos", product: "Blusa Seda P", value: 220, due: "agora" },
    ],
  },
  {
    id: "expedicao", label: "Expedição", icon: Truck, color: "#fb923c", glow: "rgba(251,146,60,0.12)",
    orders: [
      { id: "PED-011", customer: "Marcos Oliveira", product: "Kit 3 Blusas", value: 390, due: "despachado" },
    ],
  },
];

let _counter = 100;
function uid() { return `s-${++_counter}`; }
function oid() { return `PED-${String(Date.now()).slice(-4)}`; }

/* ── Blank card form ────────────────────────────────── */
const blankCard = { customer: "", product: "", value: "", due: "hoje" };

/* ── Page ───────────────────────────────────────────── */
export default function OperacaoPage() {
  const [stages, setStages] = useState<Stage[]>(INITIAL_STAGES);
  const [editMode, setEditMode] = useState(false);

  // rename
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const renameRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (renamingId) renameRef.current?.focus(); }, [renamingId]);

  // add card
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [form, setForm] = useState(blankCard);

  /* ── Stage handlers ─────────────────────────────── */
  function moveStage(id: string, dir: -1 | 1) {
    setStages(prev => {
      const i = prev.findIndex(s => s.id === id);
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function deleteStage(id: string) {
    const target = stages.find(s => s.id === id);
    if (target && target.orders.length > 0) {
      const ok = window.confirm(`"${target.label}" tem ${target.orders.length} pedido(s). Deseja remover mesmo assim?`);
      if (!ok) return;
    }
    setStages(prev => prev.filter(s => s.id !== id));
  }

  function addStage() {
    const id = uid();
    const idx = stages.length % PALETTE.length;
    const iconIdx = stages.length % ICON_CYCLE.length;
    const newStage: Stage = {
      id,
      label: "Novo Estágio",
      icon: ICON_CYCLE[iconIdx],
      color: PALETTE[idx].color,
      glow: PALETTE[idx].glow,
      orders: [],
    };
    setStages(prev => [...prev, newStage]);
    setRenamingId(id);
    setRenameVal("Novo Estágio");
  }

  function startRename(id: string, label: string) {
    setRenamingId(id);
    setRenameVal(label);
  }

  function commitRename() {
    if (!renamingId) return;
    setStages(prev => prev.map(s =>
      s.id === renamingId ? { ...s, label: renameVal.trim() || s.label } : s
    ));
    setRenamingId(null);
  }

  /* ── Card handlers ──────────────────────────────── */
  function moveCard(fromId: string, orderId: string, dir: -1 | 1) {
    setStages(prev => {
      const fi = prev.findIndex(s => s.id === fromId);
      const ti = fi + dir;
      if (ti < 0 || ti >= prev.length) return prev;
      const next = prev.map(s => ({ ...s, orders: [...s.orders] }));
      const oi = next[fi].orders.findIndex(o => o.id === orderId);
      const [card] = next[fi].orders.splice(oi, 1);
      next[ti].orders.push(card);
      return next;
    });
  }

  function deleteCard(stageId: string, orderId: string) {
    setStages(prev => prev.map(s =>
      s.id === stageId ? { ...s, orders: s.orders.filter(o => o.id !== orderId) } : s
    ));
  }

  function submitCard(stageId: string) {
    if (!form.customer.trim()) return;
    const card: Order = {
      id: oid(),
      customer: form.customer,
      product: form.product || "Produto",
      value: parseFloat(form.value) || 0,
      due: form.due,
    };
    setStages(prev => prev.map(s =>
      s.id === stageId ? { ...s, orders: [...s.orders, card] } : s
    ));
    setForm(blankCard);
    setAddingTo(null);
  }

  /* ── Derived ────────────────────────────────────── */
  const totalOrders = stages.reduce((a, s) => a + s.orders.length, 0);
  const totalValue  = stages.reduce((a, s) => a + s.orders.reduce((b, o) => b + o.value, 0), 0);

  const dueStyle = (due: string) =>
    due === "agora" || due === "hoje"
      ? { color: "#dc2626", background: "rgba(220,38,38,0.08)" }
      : { color: "var(--accent)", background: "var(--accent-bg)" };

  /* ── Render ─────────────────────────────────────── */
  return (
    <>
      <AdminHeader title="Operação" description="Pipeline de produção em tempo real">
        <button
          onClick={() => { setEditMode(m => !m); setRenamingId(null); setAddingTo(null); }}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all font-medium"
          style={editMode
            ? { background: "var(--accent-bg)", border: "1px solid var(--accent)", color: "var(--accent)" }
            : { background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-2)" }
          }
        >
          {editMode
            ? <><Check className="h-3.5 w-3.5" /> Concluir</>
            : <><Settings2 className="h-3.5 w-3.5" /> Personalizar</>
          }
        </button>
      </AdminHeader>

      {/* Resumo */}
      <div className="flex items-center gap-5 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: "var(--text-2)" }}>Em produção</span>
          <span className="text-sm font-bold" style={{ color: "var(--text-1)" }}>{totalOrders} pedidos</span>
        </div>
        <div className="w-px h-4" style={{ background: "var(--border)" }} />
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: "var(--text-2)" }}>Valor total</span>
          <span className="text-sm font-bold" style={{ color: "var(--text-1)" }}>{formatCurrency(totalValue)}</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          {stages.map(s => (
            <div key={s.id} className="w-2 h-2 rounded-full" style={{ background: s.orders.length > 0 ? s.color : "var(--border)" }} />
          ))}
        </div>
      </div>

      {/* Progress tracker */}
      <div className="relative mb-8">
        <div className="absolute top-[18px] left-[18px] right-[18px] h-px" style={{ background: "var(--border-2)", zIndex: 0 }} />
        <div className="flex items-start">
          {stages.map((stage) => {
            const Icon = stage.icon;
            return (
              <div key={stage.id} className="flex-1 flex flex-col items-center gap-1.5 relative z-10">
                <div className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{
                    background: stage.orders.length > 0 ? stage.glow : "var(--surface-2)",
                    border: `1.5px solid ${stage.orders.length > 0 ? stage.color : "var(--border)"}`,
                    boxShadow: stage.orders.length > 0 ? `0 0 12px ${stage.glow}` : "none",
                  }}
                >
                  <Icon className="h-4 w-4" style={{ color: stage.orders.length > 0 ? stage.color : "var(--text-3)" }} />
                </div>
                <span className="text-[10px] font-medium text-center px-1 max-w-[64px] leading-tight"
                  style={{ color: stage.orders.length > 0 ? stage.color : "var(--text-3)" }}
                >
                  {stage.label}
                </span>
                <span className="text-xs font-bold" style={{ color: stage.orders.length > 0 ? "var(--text-1)" : "var(--text-3)" }}>
                  {stage.orders.length}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Kanban */}
      <div className="flex gap-3 overflow-x-auto pb-4" style={{ scrollbarWidth: "thin" }}>
        {stages.map((stage, stageIdx) => {
          const Icon = stage.icon;
          const isFirst = stageIdx === 0;
          const isLast  = stageIdx === stages.length - 1;

          return (
            <div key={stage.id} className="shrink-0 w-56 rounded-xl flex flex-col"
              style={{
                background: "var(--surface)",
                border: `1px solid ${stage.orders.length > 0 ? stage.color + "30" : "var(--border)"}`,
                minHeight: 320,
                outline: editMode ? `1px dashed ${stage.color}40` : "none",
                outlineOffset: 2,
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              {/* Column header */}
              <div className="px-3 py-2.5 flex items-center gap-2 rounded-t-xl"
                style={{ borderBottom: `1px solid ${stage.color}20` }}
              >
                <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                  style={{ background: stage.glow }}
                >
                  <Icon className="h-3 w-3" style={{ color: stage.color }} />
                </div>

                {/* Rename input or label */}
                {renamingId === stage.id ? (
                  <input
                    ref={renameRef}
                    value={renameVal}
                    onChange={e => setRenameVal(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={e => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenamingId(null); }}
                    className="flex-1 text-xs font-semibold bg-transparent outline-none border-b"
                    style={{ borderColor: stage.color, caretColor: stage.color, color: "var(--text-1)" }}
                  />
                ) : (
                  <span
                    className="flex-1 text-xs font-semibold truncate"
                    style={{ cursor: editMode ? "text" : "default", color: "var(--text-1)" }}
                    onClick={() => editMode && startRename(stage.id, stage.label)}
                    title={editMode ? "Clique para renomear" : stage.label}
                  >
                    {stage.label}
                  </span>
                )}

                <span className="text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: stage.glow, color: stage.color }}
                >
                  {stage.orders.length}
                </span>
              </div>

              {/* Edit mode: stage controls */}
              {editMode && (
                <div className="flex items-center gap-1 px-3 py-1.5"
                  style={{ borderBottom: `1px solid var(--border-2)` }}
                >
                  <button
                    disabled={isFirst}
                    onClick={() => moveStage(stage.id, -1)}
                    className="p-1 rounded transition-colors disabled:opacity-20"
                    style={{ color: "var(--text-2)" }}
                    title="Mover esquerda"
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </button>
                  <button
                    disabled={isLast}
                    onClick={() => moveStage(stage.id, 1)}
                    className="p-1 rounded transition-colors disabled:opacity-20"
                    style={{ color: "var(--text-2)" }}
                    title="Mover direita"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={() => deleteStage(stage.id)}
                    className="p-1 rounded transition-colors hover:text-red-500"
                    style={{ color: "var(--text-3)" }}
                    title="Remover estágio"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )}

              {/* Cards */}
              <div className="p-2 flex flex-col gap-2 flex-1">
                {stage.orders.length === 0 && !addingTo && (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-[10px]" style={{ color: "var(--text-3)" }}>Vazio</p>
                  </div>
                )}

                {stage.orders.map((order) => (
                  <div key={order.id} className="rounded-lg p-3 group relative transition-all"
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                  >
                    {/* Delete card (edit mode) */}
                    {editMode && (
                      <button
                        onClick={() => deleteCard(stage.id, order.id)}
                        className="absolute top-1.5 right-1.5 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                        style={{ color: "var(--text-3)" }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}

                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <p className="text-xs font-semibold leading-tight pr-4" style={{ color: "var(--text-1)" }}>{order.customer}</p>
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full shrink-0"
                        style={dueStyle(order.due)}
                      >
                        {order.due}
                      </span>
                    </div>
                    <p className="text-[10px] mb-2" style={{ color: "var(--text-2)" }}>{order.product}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px]" style={{ color: "var(--text-3)" }}>{order.id}</span>
                      <span className="text-xs font-bold" style={{ color: stage.color }}>
                        {formatCurrency(order.value)}
                      </span>
                    </div>

                    {/* Move left / right */}
                    <div className="flex items-center gap-1 mt-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ borderTop: "1px solid var(--border-2)" }}
                    >
                      <button
                        disabled={isFirst}
                        onClick={() => moveCard(stage.id, order.id, -1)}
                        className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded transition-colors disabled:opacity-20"
                        style={{ color: "var(--text-2)", background: "var(--accent-bg)" }}
                      >
                        <ChevronLeft className="h-2.5 w-2.5" /> Voltar
                      </button>
                      <div className="flex-1" />
                      <button
                        disabled={isLast}
                        onClick={() => moveCard(stage.id, order.id, 1)}
                        className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded transition-colors disabled:opacity-20"
                        style={{ color: "var(--text-2)", background: "var(--accent-bg)" }}
                      >
                        Avançar <ChevronRight className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add card form */}
                {addingTo === stage.id ? (
                  <div className="rounded-lg p-3" style={{ background: "var(--surface-2)", border: `1px solid ${stage.color}40` }}>
                    <input
                      autoFocus
                      placeholder="Cliente *"
                      value={form.customer}
                      onChange={e => setForm(f => ({ ...f, customer: e.target.value }))}
                      className="w-full text-xs bg-transparent outline-none mb-2"
                      style={{ color: "var(--text-1)" }}
                    />
                    <input
                      placeholder="Produto"
                      value={form.product}
                      onChange={e => setForm(f => ({ ...f, product: e.target.value }))}
                      className="w-full text-xs bg-transparent outline-none mb-2"
                      style={{ color: "var(--text-1)" }}
                    />
                    <input
                      placeholder="Valor (R$)"
                      value={form.value}
                      onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                      type="number"
                      className="w-full text-xs bg-transparent outline-none mb-2"
                      style={{ color: "var(--text-1)" }}
                    />
                    <select
                      value={form.due}
                      onChange={e => setForm(f => ({ ...f, due: e.target.value }))}
                      className="w-full text-xs outline-none mb-3"
                      style={{ color: "var(--accent)", background: "var(--surface-2)", border: "none" }}
                    >
                      <option value="agora">agora</option>
                      <option value="hoje">hoje</option>
                      <option value="amanhã">amanhã</option>
                      <option value="esta semana">esta semana</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={() => submitCard(stage.id)}
                        className="flex-1 text-[10px] py-1 rounded font-medium"
                        style={{ background: stage.color, color: "#fff" }}
                      >
                        Adicionar
                      </button>
                      <button
                        onClick={() => { setAddingTo(null); setForm(blankCard); }}
                        className="text-[10px] px-2 py-1 rounded"
                        style={{ color: "var(--text-2)", background: "var(--accent-bg)" }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { setAddingTo(stage.id); setForm(blankCard); }}
                    className="flex items-center gap-1.5 text-[10px] px-3 py-2 rounded-lg w-full transition-colors"
                    style={{ color: "var(--text-3)", border: "1px dashed var(--border)" }}
                  >
                    <Plus className="h-3 w-3" /> Adicionar pedido
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Add new stage (edit mode) */}
        {editMode && (
          <div className="shrink-0 w-40">
            <button
              onClick={addStage}
              className="w-full h-full min-h-[120px] rounded-xl flex flex-col items-center justify-center gap-2 transition-all hover:text-indigo-400"
              style={{
                border: "1.5px dashed var(--border)",
                color: "var(--text-3)",
                background: "var(--accent-bg)",
              }}
            >
              <Plus className="h-5 w-5" />
              <span className="text-xs font-medium">Novo Estágio</span>
            </button>
          </div>
        )}
      </div>

      {/* Edit mode hint */}
      {editMode && (
        <p className="text-[10px] mt-2" style={{ color: "var(--text-3)" }}>
          Clique no nome do estágio para renomear · Use ← → para reordenar · Passe o mouse sobre um pedido para mover ou remover
        </p>
      )}
    </>
  );
}
