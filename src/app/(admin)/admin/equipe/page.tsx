"use client";

import { useEffect, useState } from "react";
import { Users, UserPlus, Loader2, Trash2, Shield, User as UserIcon } from "lucide-react";
import { apiUrl } from "@/lib/base-path";

const UI   = "var(--font-space), var(--font-geist-sans), sans-serif";
const MONO = "var(--font-space-mono), var(--font-geist-mono), monospace";

type Member = {
  id: string; name: string; email: string;
  role: "SUPERADMIN" | "ADMIN" | "STAFF"; createdAt: string;
};

const ROLES = {
  SUPERADMIN: { label: "Operador da plataforma", color: "#7c3fed", icon: Shield },
  ADMIN:      { label: "Admin",                  color: "#059669", icon: Shield },
  STAFF:      { label: "Equipe",                 color: "#64748b", icon: UserIcon },
} as const;

export default function EquipePage() {
  const [members, setMembers] = useState<Member[] | null>(null);
  const [meId, setMeId] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", email: "", password: "", role: "STAFF" as "ADMIN" | "STAFF" });

  async function load() {
    try {
      const r = await fetch(apiUrl("/api/tenant/team"));
      if (!r.ok) throw new Error();
      const d = await r.json();
      setMembers(d.members ?? []);
      setMeId(d.meId ?? "");
    } catch {
      setMembers([]);
      setError("Só quem é admin da loja pode ver a equipe.");
    }
  }
  useEffect(() => { void load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy("novo");
    setError("");
    try {
      const r = await fetch(apiUrl("/api/tenant/team"), {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Erro ao adicionar.");
      setMembers(m => [...(m ?? []), d.member]);
      setF({ name: "", email: "", password: "", role: "STAFF" });
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao adicionar.");
    } finally {
      setBusy(null);
    }
  }

  async function remove(m: Member) {
    if (!confirm(`Remover ${m.name} da loja? A pessoa perde o acesso ao painel.`)) return;
    setBusy(m.id);
    setError("");
    try {
      const r = await fetch(apiUrl(`/api/tenant/team?id=${encodeURIComponent(m.id)}`), { method: "DELETE" });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error ?? "Não consegui remover.");
      setMembers(l => (l ?? []).filter(x => x.id !== m.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não consegui remover.");
    } finally {
      setBusy(null);
    }
  }

  const input: React.CSSProperties = {
    width: "100%", boxSizing: "border-box", fontFamily: UI, fontSize: 13.5,
    padding: "10px 12px", borderRadius: 9, background: "var(--surface-2)",
    color: "var(--text-1)", border: "1px solid var(--border)", outline: "none",
  };

  return (
    <>
      <style>{`
        .eq-spin { animation: eq-spin 1s linear infinite; }
        @keyframes eq-spin { to { transform: rotate(360deg); } }
        .eq-form { display: grid; gap: 10px; grid-template-columns: 1fr; }
        @media (min-width: 680px) { .eq-form { grid-template-columns: 1fr 1fr; } }
      `}</style>

      <div className="admin-hero" style={{
        position: "relative", borderRadius: 20, overflow: "hidden",
        background: "linear-gradient(135deg,#0c0420 0%,#190a58 35%,#0b1e66 65%,#062244 100%)",
        padding: "32px 32px 28px", marginBottom: 24,
      }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{
            position: "absolute", width: 240, height: 240, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(124,63,237,0.22) 0%,transparent 70%)",
            top: -70, right: 70, animation: "drift-1 8s ease-in-out infinite",
          }} />
        </div>
        <div style={{ position: "relative" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 7, fontFamily: UI,
            fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase",
            color: "#a5b4fc", marginBottom: 12,
          }}><Users size={13} /> Acessos</span>
          <h1 style={{ fontFamily: UI, fontSize: 30, fontWeight: 700, color: "#fff",
            margin: "0 0 8px", letterSpacing: "-.025em", lineHeight: 1.15 }}>Equipe</h1>
          <p style={{ fontSize: 14.5, color: "rgba(255,255,255,.72)", margin: 0, maxWidth: 540, lineHeight: 1.6 }}>
            Todo mundo aqui entra no mesmo painel e vê a mesma loja. Admin configura e
            mexe na equipe; Equipe usa o dia a dia.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <p style={{ fontFamily: UI, fontSize: 14, fontWeight: 600, color: "var(--text-2)", margin: 0 }}>
          {members === null ? "Carregando…" : `${members.length} ${members.length === 1 ? "pessoa" : "pessoas"} com acesso`}
        </p>
        <button type="button" onClick={() => setOpen(o => !o)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            fontFamily: UI, fontSize: 13, fontWeight: 600, cursor: "pointer",
            padding: "9px 15px", borderRadius: 9,
            background: "var(--accent)", color: "#fff", border: "none",
          }}>
          <UserPlus size={14} /> Adicionar pessoa
        </button>
      </div>

      {open && (
        <form onSubmit={add} style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 14, padding: 18, marginBottom: 16,
          display: "flex", flexDirection: "column", gap: 11,
        }}>
          <div className="eq-form">
            <input style={input} placeholder="Nome" value={f.name} required maxLength={80}
              onChange={e => setF(s => ({ ...s, name: e.target.value }))} />
            <input style={input} type="email" placeholder="Email" value={f.email} required maxLength={120}
              onChange={e => setF(s => ({ ...s, email: e.target.value }))} />
            <input style={input} type="password" placeholder="Senha provisória (mínimo 6)"
              value={f.password} required minLength={6} maxLength={72} autoComplete="new-password"
              onChange={e => setF(s => ({ ...s, password: e.target.value }))} />
            <select style={input} value={f.role}
              onChange={e => setF(s => ({ ...s, role: e.target.value as "ADMIN" | "STAFF" }))}>
              <option value="STAFF">Equipe — usa o painel</option>
              <option value="ADMIN">Admin — configura e gerencia acessos</option>
            </select>
          </div>
          <p style={{ fontSize: 11.5, color: "var(--text-3)", margin: 0, lineHeight: 1.5 }}>
            Combine a senha provisória com a pessoa por fora. Ainda não existe tela para
            ela trocar a senha sozinha.
          </p>
          <div>
            <button type="submit" disabled={busy === "novo"}
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                fontFamily: UI, fontSize: 13, fontWeight: 600,
                cursor: busy === "novo" ? "default" : "pointer", opacity: busy === "novo" ? .6 : 1,
                padding: "9px 16px", borderRadius: 9,
                background: "var(--accent)", color: "#fff", border: "none",
              }}>
              {busy === "novo" && <Loader2 size={13} className="eq-spin" />} Criar acesso
            </button>
          </div>
        </form>
      )}

      {error && <p style={{ fontSize: 13, color: "var(--red)", margin: "0 0 14px" }}>{error}</p>}

      {members === null ? (
        <p style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 14, color: "var(--text-3)" }}>
          <Loader2 size={16} className="eq-spin" /> Carregando equipe…
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {members.map(m => {
            const role = ROLES[m.role];
            const Icon = role.icon;
            return (
              <div key={m.id} style={{
                background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 13,
                padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
              }}>
                <span style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: `${role.color}1a`, color: role.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}><Icon size={16} /></span>

                <div style={{ flex: 1, minWidth: 150 }}>
                  <p style={{ fontFamily: UI, fontSize: 14.5, fontWeight: 600, margin: 0, color: "var(--text-1)" }}>
                    {m.name}
                    {m.id === meId && (
                      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", marginLeft: 8 }}>
                        você
                      </span>
                    )}
                  </p>
                  <p style={{ fontFamily: MONO, fontSize: 12, color: "var(--text-3)", margin: "3px 0 0" }}>
                    {m.email}
                  </p>
                </div>

                <span style={{
                  fontFamily: UI, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999,
                  background: `${role.color}1a`, color: role.color,
                }}>{role.label}</span>

                {m.id !== meId && m.role !== "SUPERADMIN" && (
                  <button type="button" disabled={busy === m.id} onClick={() => void remove(m)}
                    aria-label={`Remover ${m.name}`}
                    style={{
                      width: 32, height: 32, borderRadius: 9, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "transparent", border: "1px solid var(--border)",
                    }}>
                    {busy === m.id
                      ? <Loader2 size={13} className="eq-spin" color="var(--text-3)" />
                      : <Trash2 size={13} color="var(--red)" />}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
