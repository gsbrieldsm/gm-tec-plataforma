"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Scissors, Shirt, Package, CheckCircle, Truck, Star,
  Plus, GripVertical, ArrowRight, ArrowDown,
  Settings, Clock, Users, ChevronDown, ChevronUp,
  Zap, Eye, Send, X, ShoppingBag,
} from "lucide-react";

/* ── Brand tokens ───────────────────────────────────── */
const B = {
  bg:       "#1a1310",
  bg2:      "#211a14",
  surface:  "#2f2419",
  surface2: "#38291c",
  border:   "rgba(201,169,110,0.15)",
  border2:  "rgba(201,169,110,0.25)",
  accent:   "#c9a96e",
  accent2:  "#e8c987",
  text:     "#f5ede0",
  text2:    "#b8a78d",
  text3:    "#7a6a55",
};

// ─── Types ──────────────────────────────────────────────────────────────────

interface Stage {
  id: string;
  name: string;
  icon: string;
  color: string;
  duration: string;
  responsible: string;
  description: string;
  substeps: string[];
}

// ─── Stage library ──────────────────────────────────────────────────────────

const STAGE_LIBRARY = [
  { icon: "scissors", color: B.accent,  name: "Corte",        duration: "2h",    responsible: "Costureira", description: "Corte das peças no tecido",              substeps: ["Risco no tecido", "Corte manual", "Conferência de peças"] },
  { icon: "shirt",    color: B.accent2, name: "Costura",      duration: "4h",    responsible: "Costureira", description: "Montagem e costura das peças",            substeps: ["Costura lateral", "Costura das mangas", "Acabamento"] },
  { icon: "star",     color: "#e8c987", name: "Pilotagem",    duration: "1h",    responsible: "Modelista",  description: "Peça piloto e aprovação do modelo",       substeps: ["Montagem piloto", "Prova no manequim", "Ajustes"] },
  { icon: "check",    color: "#86c68a", name: "Qualidade",    duration: "30min", responsible: "Inspetor",   description: "Controle de qualidade final",             substeps: ["Inspeção visual", "Medição", "Aprovação"] },
  { icon: "package",  color: B.text2,   name: "Acabamento",   duration: "1h",    responsible: "Costureira", description: "Bordado, appliqué e detalhes",            substeps: ["Bordado", "Etiquetagem", "Limpeza de fios"] },
  { icon: "truck",    color: B.accent,  name: "Embalagem",    duration: "30min", responsible: "Expedição",  description: "Embalagem e despacho do pedido",          substeps: ["Dobrar peça", "Empacotar", "Etiquetar caixa"] },
  { icon: "zap",      color: B.accent2, name: "Lavagem",      duration: "2h",    responsible: "Lavanderia", description: "Lavagem, tintura ou tratamento especial", substeps: ["Separação", "Lavagem", "Secagem"] },
  { icon: "eye",      color: B.text2,   name: "Revisão",      duration: "20min", responsible: "Supervisor", description: "Revisão e liberação final",               substeps: ["Conferência geral", "Liberação"] },
  { icon: "settings", color: B.text3,   name: "Personalizado",duration: "1h",    responsible: "Definir",    description: "Etapa personalizada",                    substeps: [] },
];

const ICON_MAP: Record<string, React.ElementType> = {
  scissors: Scissors,
  shirt: Shirt,
  package: Package,
  check: CheckCircle,
  truck: Truck,
  star: Star,
  zap: Zap,
  eye: Eye,
  settings: Settings,
};

function StageIcon({ icon, size = 16 }: { icon: string; size?: number }) {
  const Icon = ICON_MAP[icon] ?? Settings;
  return <Icon size={size} />;
}

// ─── Stage Card ──────────────────────────────────────────────────────────────

function StageCard({
  stage, index, isSelected, onSelect, onRemove, onDragStart, onDragOver, onDrop,
}: {
  stage: Stage; index: number; isSelected: boolean;
  onSelect: () => void; onRemove: () => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
}) {
  return (
    <div
      className="relative group"
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(e, index); }}
      onDrop={(e) => onDrop(e, index)}
    >
      {index > 0 && (
        <div className="flex justify-center mb-1">
          <ArrowDown size={16} color={B.text3} />
        </div>
      )}

      <div
        onClick={onSelect}
        className="relative cursor-pointer rounded-2xl border-2 transition-all duration-200"
        style={{
          borderColor: isSelected ? stage.color : B.border,
          background: isSelected ? `${stage.color}18` : B.bg2,
          transform: isSelected ? "scale(1.02)" : undefined,
        }}
      >
        <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 cursor-grab">
          <GripVertical size={14} color={B.text2} />
        </div>

        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${stage.color}25`, color: stage.color }}>
            <StageIcon icon={stage.icon} size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm" style={{ color: B.text }}>{stage.name}</p>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs flex items-center gap-1" style={{ color: B.text2 }}><Clock size={10} />{stage.duration}</span>
              <span className="text-xs flex items-center gap-1" style={{ color: B.text2 }}><Users size={10} />{stage.responsible}</span>
            </div>
          </div>
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: stage.color, color: B.bg }}>
            {index + 1}
          </div>
        </div>

        {stage.substeps.length > 0 && (
          <div className="px-4 pb-3 flex gap-1 flex-wrap">
            {stage.substeps.map((s, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full" style={{ background: B.surface, color: B.text2 }}>{s}</span>
            ))}
          </div>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "#ef4444", color: "#fff" }}
        >
          <X size={10} />
        </button>
      </div>
    </div>
  );
}

// ─── Stage Detail Panel ───────────────────────────────────────────────────────

function StageDetailPanel({ stage, onChange, onClose }: { stage: Stage; onChange: (updated: Stage) => void; onClose: () => void; }) {
  const [newSubstep, setNewSubstep] = useState("");

  const inputStyle = { background: B.surface, border: `1px solid ${B.border}`, color: B.text };
  const focusRing = { outline: "none", borderColor: B.accent };

  return (
    <div className="rounded-2xl p-5 sticky top-4" style={{ background: B.surface, border: `1px solid ${B.border}` }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold flex items-center gap-2" style={{ color: B.text }}>
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${stage.color}30`, color: stage.color }}>
            <StageIcon icon={stage.icon} size={14} />
          </div>
          Configurar etapa
        </h3>
        <button onClick={onClose} style={{ color: B.text2 }}><X size={16} /></button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs mb-1 block" style={{ color: B.text2 }}>Nome da etapa</label>
          <input value={stage.name} onChange={(e) => onChange({ ...stage, name: e.target.value })}
            className="w-full rounded-lg px-3 py-2 text-sm"
            style={inputStyle}
            onFocus={(e) => Object.assign(e.target.style, focusRing)}
            onBlur={(e) => { e.target.style.outline = "none"; e.target.style.borderColor = B.border; }}
          />
        </div>
        <div>
          <label className="text-xs mb-1 block" style={{ color: B.text2 }}>Descrição</label>
          <input value={stage.description} onChange={(e) => onChange({ ...stage, description: e.target.value })}
            className="w-full rounded-lg px-3 py-2 text-sm"
            style={inputStyle}
            onFocus={(e) => Object.assign(e.target.style, focusRing)}
            onBlur={(e) => { e.target.style.outline = "none"; e.target.style.borderColor = B.border; }}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs mb-1 block" style={{ color: B.text2 }}>Tempo estimado</label>
            <input value={stage.duration} onChange={(e) => onChange({ ...stage, duration: e.target.value })}
              className="w-full rounded-lg px-3 py-2 text-sm"
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, focusRing)}
              onBlur={(e) => { e.target.style.outline = "none"; e.target.style.borderColor = B.border; }}
            />
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: B.text2 }}>Responsável</label>
            <input value={stage.responsible} onChange={(e) => onChange({ ...stage, responsible: e.target.value })}
              className="w-full rounded-lg px-3 py-2 text-sm"
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, focusRing)}
              onBlur={(e) => { e.target.style.outline = "none"; e.target.style.borderColor = B.border; }}
            />
          </div>
        </div>

        <div>
          <label className="text-xs mb-2 block" style={{ color: B.text2 }}>Cor</label>
          <div className="flex gap-2 flex-wrap">
            {[B.accent, B.accent2, "#e8c987", "#86c68a", "#ef4444", B.text2, B.text3, "#b8c6a8"].map((c) => (
              <button key={c} onClick={() => onChange({ ...stage, color: c })}
                className="w-6 h-6 rounded-full border-2 transition-all"
                style={{ background: c, borderColor: stage.color === c ? B.text : "transparent" }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs mb-2 block" style={{ color: B.text2 }}>Sub-etapas</label>
          <div className="space-y-1 mb-2">
            {stage.substeps.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-sm" style={{ color: B.text2 }}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: B.accent }} />
                <span className="flex-1">{s}</span>
                <button onClick={() => onChange({ ...stage, substeps: stage.substeps.filter((_, j) => j !== i) })} style={{ color: B.text3 }}>
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newSubstep}
              onChange={(e) => setNewSubstep(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newSubstep.trim()) {
                  onChange({ ...stage, substeps: [...stage.substeps, newSubstep.trim()] });
                  setNewSubstep("");
                }
              }}
              placeholder="Adicionar sub-etapa..."
              className="flex-1 rounded-lg px-3 py-1.5 text-sm"
              style={{ ...inputStyle, borderColor: B.border }}
            />
            <button
              onClick={() => {
                if (newSubstep.trim()) {
                  onChange({ ...stage, substeps: [...stage.substeps, newSubstep.trim()] });
                  setNewSubstep("");
                }
              }}
              className="px-3 py-1.5 rounded-lg text-sm"
              style={{ background: B.accent, color: B.bg }}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Contact Modal ────────────────────────────────────────────────────────────

function ContactModal({ stages, onClose }: { stages: Stage[]; onClose: () => void }) {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [business, setBusiness] = useState("");
  const [sent, setSent] = useState(false);

  const inputStyle = { background: B.surface2, border: `1px solid ${B.border}`, color: B.text };

  function handleSend() {
    if (!name || !whatsapp) return;
    const stageNames = stages.map((s, i) => `${i + 1}. ${s.name}`).join(", ");
    const msg = encodeURIComponent(
      `Olá! Me chamo ${name}, tenho o negócio "${business}" e montei meu funil de produção:\n${stageNames}\n\nQuero saber mais sobre a plataforma!`
    );
    window.open(`https://wa.me/55${whatsapp.replace(/\D/g, "")}?text=${msg}`, "_blank");
    setSent(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)" }}>
      <div className="rounded-2xl w-full max-w-md p-6" style={{ background: B.bg2, border: `1px solid ${B.border}` }}>
        {!sent ? (
          <>
            <h3 className="text-xl font-bold mb-1" style={{ color: B.text }}>Ótimo funil!</h3>
            <p className="text-sm mb-5" style={{ color: B.text2 }}>
              Você tem <strong style={{ color: B.accent }}>{stages.length} etapas</strong> no seu processo.
              Preencha abaixo para receber uma demonstração personalizada.
            </p>
            <div className="space-y-3">
              {[
                { value: name,     setter: setName,     placeholder: "Seu nome" },
                { value: business, setter: setBusiness, placeholder: "Nome do seu negócio" },
                { value: whatsapp, setter: setWhatsapp, placeholder: "WhatsApp (DDD + número)" },
              ].map((field) => (
                <input key={field.placeholder}
                  value={field.value}
                  onChange={(e) => field.setter(e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full rounded-xl px-4 py-3 text-sm"
                  style={inputStyle}
                />
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm" style={{ border: `1px solid ${B.border}`, color: B.text2 }}>
                Voltar
              </button>
              <button onClick={handleSend} className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2" style={{ background: B.accent, color: B.bg }}>
                <Send size={16} />Quero uma demo!
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(134,198,138,0.2)" }}>
              <CheckCircle size={32} color="#86c68a" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: B.text }}>Enviado!</h3>
            <p className="text-sm mb-5" style={{ color: B.text2 }}>Em breve entraremos em contato para sua demo personalizada.</p>
            <button onClick={onClose} className="px-6 py-2 rounded-xl text-sm" style={{ background: B.accent, color: B.bg }}>
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FunilPage() {
  const [stages, setStages] = useState<Stage[]>([
    { id: "s1", icon: "star",     color: B.accent2, name: "Pilotagem", duration: "1h",    responsible: "Modelista",  description: "Peça piloto e aprovação",   substeps: ["Montagem piloto", "Aprovação"] },
    { id: "s2", icon: "scissors", color: B.accent,  name: "Corte",    duration: "2h",    responsible: "Costureira", description: "Corte das peças",           substeps: ["Risco no tecido", "Corte"] },
    { id: "s3", icon: "shirt",    color: B.text2,   name: "Costura",  duration: "4h",    responsible: "Costureira", description: "Montagem das peças",         substeps: ["Costura lateral", "Acabamento"] },
    { id: "s4", icon: "check",    color: "#86c68a", name: "Qualidade",duration: "30min", responsible: "Inspetor",   description: "Controle de qualidade",     substeps: ["Inspeção", "Aprovação"] },
    { id: "s5", icon: "package",  color: B.text3,   name: "Embalagem",duration: "30min", responsible: "Expedição",  description: "Embalagem e despacho",      substeps: ["Empacotar", "Etiquetar"] },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showContact, setShowContact] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [dragFrom, setDragFrom] = useState<number | null>(null);

  const selectedStage = stages.find((s) => s.id === selectedId) ?? null;

  function addFromLibrary(template: (typeof STAGE_LIBRARY)[0]) {
    const newStage: Stage = {
      id: `s${Date.now()}`,
      icon: template.icon,
      color: template.color,
      name: template.name,
      duration: template.duration,
      responsible: template.responsible,
      description: template.description,
      substeps: [...template.substeps],
    };
    setStages((prev) => [...prev, newStage]);
    setSelectedId(newStage.id);
    setShowLibrary(false);
  }

  function removeStage(id: string) {
    setStages((prev) => prev.filter((s) => s.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function updateStage(updated: Stage) {
    setStages((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  }

  function handleDrop(e: React.DragEvent, toIndex: number) {
    e.preventDefault();
    if (dragFrom === null || dragFrom === toIndex) return;
    const updated = [...stages];
    const [moved] = updated.splice(dragFrom, 1);
    updated.splice(toIndex, 0, moved);
    setStages(updated);
    setDragFrom(null);
  }

  const totalTime = stages.reduce((acc, s) => {
    const match = s.duration.match(/(\d+(?:\.\d+)?)\s*(h|min)/);
    if (!match) return acc;
    const val = parseFloat(match[1]);
    return acc + (match[2] === "h" ? val * 60 : val);
  }, 0);

  const timeLabel = totalTime >= 60
    ? `${Math.floor(totalTime / 60)}h${totalTime % 60 > 0 ? ` ${totalTime % 60}min` : ""}`
    : `${totalTime}min`;

  return (
    <div className="min-h-screen" style={{ background: B.bg }}>
      {/* Top bar */}
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${B.border}` }}>
        <div className="flex items-center gap-3">
          <Link href="/apresentacao" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: B.accent }}>
              <ShoppingBag size={16} color={B.bg} />
            </div>
            <span className="font-bold text-lg" style={{ color: B.text, fontFamily: "var(--font-univia), system-ui, sans-serif", fontStyle: "italic" }}>GM & Co Tec</span>
          </Link>
          <span style={{ color: B.text3 }}>/</span>
          <span className="text-sm" style={{ color: B.text2 }}>Construtor de Funil de Produção</span>
        </div>
        <button
          onClick={() => setShowContact(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          style={{ background: B.accent, color: B.bg }}
        >
          <Zap size={14} />Quero usar isso!
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs mb-4" style={{ background: `rgba(201,169,110,0.12)`, border: `1px solid rgba(201,169,110,0.25)`, color: B.accent2 }}>
            <Zap size={12} />Personalize para o seu negócio
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: B.text }}>
            Monte o seu funil de<br />
            <span style={{ color: B.accent }}>produção em minutos</span>
          </h1>
          <p className="max-w-xl mx-auto text-sm" style={{ color: B.text2 }}>
            Arraste e solte as etapas, configure cada uma com seu nome,
            responsável e sub-tarefas. Depois veja como ficaria na plataforma.
          </p>
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-8 p-4 rounded-2xl max-w-lg mx-auto" style={{ background: `rgba(201,169,110,0.06)`, border: `1px solid ${B.border}` }}>
          {[
            { value: stages.length, label: "Etapas" },
            { value: timeLabel, label: "Tempo estimado" },
            { value: stages.reduce((a, s) => a + s.substeps.length, 0), label: "Sub-tarefas" },
          ].map((stat, i) => (
            <React.Fragment key={stat.label}>
              {i > 0 && <div className="w-px h-8" style={{ background: B.border }} />}
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: B.text }}>{stat.value}</p>
                <p className="text-xs" style={{ color: B.text2 }}>{stat.label}</p>
              </div>
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Funnel column */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold" style={{ color: B.text }}>Seu processo de produção</h2>
              <button
                onClick={() => setShowLibrary(!showLibrary)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors"
                style={{ background: `rgba(201,169,110,0.1)`, border: `1px solid ${B.border2}`, color: B.accent2 }}
              >
                <Plus size={14} />Adicionar etapa
                {showLibrary ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            {showLibrary && (
              <div className="mb-4 p-4 rounded-2xl grid grid-cols-2 sm:grid-cols-3 gap-2" style={{ background: B.bg2, border: `1px solid ${B.border}` }}>
                {STAGE_LIBRARY.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => addFromLibrary(template)}
                    className="flex items-center gap-2 p-3 rounded-xl text-left transition-colors"
                    style={{ background: B.surface }}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${template.color}25`, color: template.color }}>
                      <StageIcon icon={template.icon} size={14} />
                    </div>
                    <span className="text-sm" style={{ color: B.text2 }}>{template.name}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-0">
              {stages.map((stage, i) => (
                <StageCard
                  key={stage.id}
                  stage={stage}
                  index={i}
                  isSelected={selectedId === stage.id}
                  onSelect={() => setSelectedId(selectedId === stage.id ? null : stage.id)}
                  onRemove={() => removeStage(stage.id)}
                  onDragStart={(idx) => setDragFrom(idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                />
              ))}
            </div>

            {stages.length === 0 && (
              <div className="text-center py-16 rounded-2xl border-2 border-dashed" style={{ borderColor: B.border }}>
                <Package size={32} color={B.text3} className="mx-auto mb-3" />
                <p className="text-sm" style={{ color: B.text2 }}>Nenhuma etapa adicionada.</p>
                <p className="text-xs mt-1" style={{ color: B.text3 }}>Clique em &ldquo;Adicionar etapa&rdquo; para começar.</p>
              </div>
            )}

            {stages.length >= 2 && (
              <div className="mt-6 p-5 rounded-2xl" style={{ background: `rgba(201,169,110,0.08)`, border: `1px solid rgba(201,169,110,0.25)` }}>
                <p className="font-semibold mb-1" style={{ color: B.text }}>Seu funil está pronto!</p>
                <p className="text-sm mb-4" style={{ color: B.text2 }}>
                  A plataforma vai controlar cada etapa automaticamente, alertar atrasos e gerar relatórios de produção.
                </p>
                <button
                  onClick={() => setShowContact(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  style={{ background: B.accent, color: B.bg }}
                >
                  Quero implementar isso no meu negócio<ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Side panel */}
          <div>
            {selectedStage ? (
              <StageDetailPanel stage={selectedStage} onChange={updateStage} onClose={() => setSelectedId(null)} />
            ) : (
              <div className="sticky top-4 space-y-4">
                <div className="rounded-2xl p-5" style={{ background: B.surface, border: `1px solid ${B.border}` }}>
                  <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: B.text }}>
                    <Eye size={16} color={B.accent} />Como funciona
                  </h3>
                  <div className="space-y-3">
                    {[
                      "Monte as etapas do seu processo arrastando e configurando",
                      "Clique em qualquer etapa para personalizar nome, tempo e sub-tarefas",
                      "Solicite uma demo e mostre seu processo a nossa equipe",
                    ].map((text, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5" style={{ background: B.accent, color: B.bg }}>
                          {i + 1}
                        </div>
                        <p className="text-sm" style={{ color: B.text2 }}>{text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl p-5" style={{ background: B.surface, border: `1px solid ${B.border}` }}>
                  <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: B.text }}>
                    <Settings size={16} color={B.accent} />O que a plataforma faz
                  </h3>
                  <div className="space-y-2">
                    {[
                      "Controla cada etapa em tempo real",
                      "Alerta atrasos automaticamente",
                      "Relatório de produção por período",
                      "Controle de estoque integrado",
                      "CRM completo de clientes",
                      "Pedidos via WhatsApp/Instagram",
                      "Financeiro e metas de venda",
                    ].map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm" style={{ color: B.text2 }}>
                        <CheckCircle size={12} color="#86c68a" />{feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showContact && <ContactModal stages={stages} onClose={() => setShowContact(false)} />}
    </div>
  );
}
