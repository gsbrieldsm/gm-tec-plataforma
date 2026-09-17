"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, CheckCircle, Factory } from "lucide-react";

const UI   = "var(--font-space), var(--font-geist-sans), sans-serif";
const MONO = "var(--font-space-mono), var(--font-geist-mono), monospace";

const STAGE_PRESETS: Record<string, string[]> = {
  textil:    ["Corte", "Costura", "Acabamento", "Qualidade"],
  grafica:   ["Arte", "Impressão", "Acabamento", "Embalagem"],
  importacao:["Pedido ao Fornecedor", "Produção", "Inspeção", "Embarque", "Desembaraço", "Entrega"],
  geral:     ["Início", "Produção", "Qualidade", "Entrega"],
};

type Item = { id: number; name: string; sku: string; qty: string };
type Stage = { id: number; label: string };

let itemCounter = 1;
let stageCounter = 1;

export default function NovaProducaoPage() {
  const [orderRef, setOrderRef] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [dueDate, setDueDate]   = useState("");
  const [notes, setNotes]       = useState("");
  const [sector, setSector]     = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [items, setItems] = useState<Item[]>([
    { id: itemCounter++, name: "", sku: "", qty: "" },
  ]);
  const [stages, setStages] = useState<Stage[]>(
    STAGE_PRESETS.textil.map(l => ({ id: stageCounter++, label: l }))
  );

  function addItem() {
    setItems(p => [...p, { id: itemCounter++, name: "", sku: "", qty: "" }]);
  }
  function removeItem(id: number) {
    setItems(p => p.filter(i => i.id !== id));
  }
  function updateItem(id: number, field: keyof Item, value: string) {
    setItems(p => p.map(i => i.id === id ? { ...i, [field]: value } : i));
  }

  function applyPreset(key: string) {
    setSector(key);
    setStages(STAGE_PRESETS[key].map(l => ({ id: stageCounter++, label: l })));
  }
  function addStage() {
    setStages(p => [...p, { id: stageCounter++, label: "" }]);
  }
  function removeStage(id: number) {
    setStages(p => p.filter(s => s.id !== id));
  }
  function updateStage(id: number, label: string) {
    setStages(p => p.map(s => s.id === id ? { ...s, label } : s));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div style={{ maxWidth: 480, margin: "60px auto", textAlign: "center", fontFamily: UI }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: "rgba(5,150,105,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <CheckCircle size={30} color="#059669"/>
        </div>
        <h2 style={{ fontFamily: UI, fontSize: 20, fontWeight: 700, color: "var(--text-1)", marginBottom: 8 }}>
          Pedido de produção criado!
        </h2>
        <p style={{ color: "var(--text-2)", fontSize: 13, marginBottom: 28 }}>
          {orderRef || "PROD-004"} foi criado e pode ser acompanhado na lista de produção.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <Link href="/admin/producao" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontFamily: UI, fontSize: 13, fontWeight: 600,
            color: "#fff", background: "var(--accent)",
            padding: "12px 24px", borderRadius: 10,
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(124,63,237,0.25)",
          }}>
            Ver lista de produção
          </Link>
          <button onClick={() => setSubmitted(false)} style={{
            fontFamily: UI, fontSize: 13, fontWeight: 500,
            color: "var(--text-2)", background: "var(--surface)",
            border: "1px solid var(--border)", borderRadius: 10,
            padding: "12px 24px", cursor: "pointer",
          }}>
            Criar outro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, fontFamily: UI }}>

      <Link href="/admin/producao" style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontFamily: UI, fontSize: 12, fontWeight: 500,
        color: "var(--text-2)", textDecoration: "none", marginBottom: 20,
      }}>
        <ArrowLeft size={14}/> Voltar
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: "var(--accent-bg)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Factory size={20} color="var(--accent)"/>
        </div>
        <div>
          <h1 style={{ fontFamily: UI, fontSize: 20, fontWeight: 700, color: "var(--text-1)", margin: 0 }}>
            Novo pedido de produção
          </h1>
          <p style={{ fontSize: 12, color: "var(--text-2)", margin: "3px 0 0" }}>
            Preencha os dados e os itens que serão produzidos
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>

        {/* ── Identificação ─────────────────────── */}
        <Section label="Identificação">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <Field label="Referência / Código" required>
              <input
                value={orderRef}
                onChange={e => setOrderRef(e.target.value)}
                placeholder="PROD-004"
                style={inputStyle}
              />
            </Field>
            <Field label="Prioridade" required>
              <select value={priority} onChange={e => setPriority(e.target.value)} style={inputStyle}>
                <option value="LOW">Baixa</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">Alta</option>
                <option value="URGENT">Urgente</option>
              </select>
            </Field>
            <Field label="Prazo" required>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                style={inputStyle}
                required
              />
            </Field>
          </div>
          <Field label="Observações">
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Instruções especiais, referências, etc."
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </Field>
        </Section>

        {/* ── Etapas ────────────────────────────── */}
        <Section label="Etapas de produção">
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 14 }}>
            <span style={{ fontSize: 11, color: "var(--text-2)", alignSelf: "center" }}>Templates:</span>
            {Object.entries({ textil: "Têxtil", grafica: "Gráfica", importacao: "Importação", geral: "Geral" }).map(([k, l]) => (
              <button key={k} type="button" onClick={() => applyPreset(k)}
                style={{
                  fontFamily: UI, fontSize: 11, fontWeight: 600,
                  padding: "5px 12px", borderRadius: 7, cursor: "pointer", transition: "all 0.1s",
                  background: sector === k ? "var(--accent-bg)" : "var(--surface-2)",
                  border: `1px solid ${sector === k ? "var(--accent)" : "var(--border)"}`,
                  color: sector === k ? "var(--accent)" : "var(--text-2)",
                }}>
                {l}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {stages.map((st, i) => (
              <div key={st.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                  background: "var(--accent-bg)",
                  border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: MONO, fontSize: 10, fontWeight: 700, color: "var(--accent)",
                }}>{i + 1}</div>
                <input
                  value={st.label}
                  onChange={e => updateStage(st.id, e.target.value)}
                  placeholder={`Etapa ${i + 1}`}
                  style={{ ...inputStyle, flex: 1, margin: 0 }}
                />
                <button type="button" onClick={() => removeStage(st.id)}
                  disabled={stages.length <= 1}
                  style={{
                    width: 32, height: 32, borderRadius: 8, border: "none",
                    background: "transparent", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    opacity: stages.length <= 1 ? 0.3 : 1,
                  }}>
                  <Trash2 size={14} color="var(--red)"/>
                </button>
              </div>
            ))}
            <button type="button" onClick={addStage}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                fontFamily: UI, fontSize: 12, fontWeight: 500,
                color: "var(--accent)", background: "transparent",
                border: "1px dashed var(--border-hi)",
                borderRadius: 8, padding: "9px 14px", cursor: "pointer",
                marginTop: 4,
              }}>
              <Plus size={13}/> Adicionar etapa
            </button>
          </div>
        </Section>

        {/* ── Itens ─────────────────────────────── */}
        <Section label="Itens a produzir">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {items.map((item, i) => (
              <div key={item.id} style={{
                display: "grid", gridTemplateColumns: "1fr 160px 90px 36px",
                gap: 8, alignItems: "end",
              }}>
                <Field label={i === 0 ? "Nome do produto" : ""} required={i === 0}>
                  <input
                    value={item.name}
                    onChange={e => updateItem(item.id, "name", e.target.value)}
                    placeholder="Ex: Vestido Floral P/Rosa"
                    style={inputStyle}
                    required
                  />
                </Field>
                <Field label={i === 0 ? "SKU" : ""}>
                  <input
                    value={item.sku}
                    onChange={e => updateItem(item.id, "sku", e.target.value)}
                    placeholder="VFV-001-P"
                    style={{ ...inputStyle, fontFamily: MONO, fontSize: 12 }}
                  />
                </Field>
                <Field label={i === 0 ? "Qtd." : ""} required={i === 0}>
                  <input
                    type="number" min={1}
                    value={item.qty}
                    onChange={e => updateItem(item.id, "qty", e.target.value)}
                    placeholder="0"
                    style={{ ...inputStyle, fontFamily: MONO, textAlign: "center" }}
                    required
                  />
                </Field>
                <div style={{ paddingBottom: 1 }}>
                  <button type="button" onClick={() => removeItem(item.id)}
                    disabled={items.length <= 1}
                    style={{
                      width: 36, height: 36, borderRadius: 8, border: "none",
                      background: "var(--surface-2)", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      opacity: items.length <= 1 ? 0.3 : 1,
                    }}>
                    <Trash2 size={13} color="var(--red)"/>
                  </button>
                </div>
              </div>
            ))}
            <button type="button" onClick={addItem}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                fontFamily: UI, fontSize: 12, fontWeight: 500,
                color: "var(--accent)", background: "transparent",
                border: "1px dashed var(--border-hi)",
                borderRadius: 8, padding: "9px 14px", cursor: "pointer",
              }}>
              <Plus size={13}/> Adicionar item
            </button>
          </div>
        </Section>

        {/* ── Submit ────────────────────────────── */}
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <button type="submit" style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontFamily: UI, fontSize: 14, fontWeight: 700,
            color: "#fff", background: "var(--accent)",
            border: "none", borderRadius: 12, padding: "16px 28px",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(124,63,237,0.28)",
            minHeight: 54,
          }}>
            <Factory size={16}/> Criar pedido de produção
          </button>
          <Link href="/admin/producao" style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: UI, fontSize: 13, fontWeight: 500,
            color: "var(--text-2)", background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12, padding: "16px 24px",
            textDecoration: "none", minHeight: 54,
          }}>
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────── */
const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box",
  fontFamily: "var(--font-space), var(--font-geist-sans), sans-serif",
  fontSize: 13, color: "var(--text-1)",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8, padding: "9px 12px",
  outline: "none",
};

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 14, padding: "20px 24px",
      marginBottom: 14,
      boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
    }}>
      <div style={{
        fontFamily: "var(--font-space), sans-serif",
        fontSize: 9.5, fontWeight: 700, color: "var(--text-3)",
        letterSpacing: "0.14em", textTransform: "uppercase",
        marginBottom: 16,
      }}>{label}</div>
      {children}
    </div>
  );
}

function Field({ label, required, children }: { label?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      {label && (
        <label style={{
          display: "block",
          fontFamily: "var(--font-space), sans-serif",
          fontSize: 11, fontWeight: 600, color: "var(--text-2)",
          marginBottom: 5,
        }}>
          {label}{required && <span style={{ color: "var(--accent)", marginLeft: 2 }}>*</span>}
        </label>
      )}
      {children}
    </div>
  );
}
