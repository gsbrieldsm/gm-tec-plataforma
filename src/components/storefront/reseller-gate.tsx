"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Clock, Store } from "lucide-react";
import { apiUrl } from "@/lib/base-path";
import { FONT_STACKS, RADIUS, readableOn, type BrandSettings } from "@/lib/tenant-settings";

const THEMES = {
  light: { bg: "#faf9f7", surface: "#ffffff", text: "#161616", muted: "#6b6b6b", border: "rgba(0,0,0,0.08)" },
  dark:  { bg: "#0e0e11", surface: "#17171b", text: "#f3f3f3", muted: "#9a9aa2", border: "rgba(255,255,255,0.09)" },
};

type Props = {
  handle: string;
  brand: BrandSettings;
  storeName: string;
  /** Nome do lojista cujo cadastro está aguardando aprovação. */
  pending: string | null;
};

export function ResellerGate({ handle, brand, storeName, pending }: Props) {
  const router = useRouter();
  const t = THEMES[brand.theme];
  const r = RADIUS[brand.radius];
  const heading = FONT_STACKS[brand.font];
  const body = brand.font === "elegante" ? FONT_STACKS.classica : heading;
  const onPrimary = readableOn(brand.primary);

  const [tab, setTab] = useState<"entrar" | "cadastrar">(pending ? "entrar" : "cadastrar");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const [f, setF] = useState({
    name: "", email: "", phone: "", company: "", document: "", city: "", password: "",
  });
  const on = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF(s => ({ ...s, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const url = tab === "entrar" ? "/api/lojista/entrar" : "/api/lojista/registrar";
      const payload = tab === "entrar"
        ? { handle, email: f.email, password: f.password }
        : { handle, ...f };
      const res = await fetch(apiUrl(url), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Não deu certo. Tente de novo.");

      if (tab === "cadastrar") setDone(true);
      else if (data.status === "ativo") router.push(`/loja/${handle}`);
      else router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não deu certo.");
    } finally {
      setBusy(false);
    }
  }

  const input: React.CSSProperties = {
    width: "100%", boxSizing: "border-box", fontFamily: body, fontSize: 14,
    padding: "11px 13px", borderRadius: r.button === 999 ? 12 : r.button,
    background: t.bg, color: t.text, border: `1px solid ${t.border}`, outline: "none",
  };
  const btn: React.CSSProperties = {
    width: "100%", boxSizing: "border-box", display: "inline-flex", alignItems: "center",
    justifyContent: "center", gap: 8, fontFamily: body, fontSize: 14.5, fontWeight: 600,
    padding: "13px 22px", borderRadius: r.button, cursor: busy ? "default" : "pointer",
    background: brand.primary, color: onPrimary, border: "none", opacity: busy ? .7 : 1,
  };

  return (
    <div style={{
      background: t.bg, color: t.text, fontFamily: body, minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px",
    }}>
      <style>{`
        .rg-spin { animation: rg-spin 1s linear infinite; }
        @keyframes rg-spin { to { transform: rotate(360deg); } }
        .rg-row { display: grid; gap: 10px; grid-template-columns: 1fr; }
        @media (min-width: 560px) { .rg-row { grid-template-columns: 1fr 1fr; } }
        .rg-input:focus { border-color: ${brand.primary} !important; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 480 }}>
        <Link href={`/loja/${handle}`} style={{
          display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13.5,
          color: t.muted, textDecoration: "none", marginBottom: 18,
        }}>
          <ArrowLeft size={14} /> Voltar para a loja
        </Link>

        <div style={{
          background: t.surface, border: `1px solid ${t.border}`,
          borderRadius: r.card, padding: "30px 26px 26px",
        }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 7, fontSize: 11.5, fontWeight: 700,
            letterSpacing: ".08em", textTransform: "uppercase", color: brand.primary, marginBottom: 12,
          }}>
            <Store size={13} /> Atacado
          </span>

          {done ? (
            <>
              <h1 style={{ fontFamily: heading, fontSize: 25, fontWeight: 700, margin: "0 0 12px",
                lineHeight: 1.2, letterSpacing: "-.02em" }}>Cadastro enviado</h1>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: t.muted, margin: 0 }}>
                A {storeName} vai analisar seu cadastro e liberar o seu acesso. Assim que
                aprovarem, você entra aqui com o mesmo email e senha e a loja passa a
                mostrar os preços de atacado com o seu desconto.
              </p>
              <Link href={`/loja/${handle}`} style={{ ...btn, marginTop: 22, textDecoration: "none" }}>
                Ver a coleção
              </Link>
            </>
          ) : pending ? (
            <>
              <h1 style={{ fontFamily: heading, fontSize: 25, fontWeight: 700, margin: "0 0 12px",
                lineHeight: 1.2, letterSpacing: "-.02em" }}>Cadastro em análise</h1>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: t.muted, margin: "0 0 20px" }}>
                Oi, {pending}. Seu cadastro de lojista ainda está esperando a aprovação
                da {storeName}. Enquanto isso você navega pela loja com o preço normal.
              </p>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13,
                padding: "10px 14px", borderRadius: r.button,
                background: `${brand.primary}14`, color: t.text, border: `1px solid ${t.border}`,
              }}>
                <Clock size={14} /> Aguardando liberação
              </span>
              <Link href={`/loja/${handle}`} style={{ ...btn, marginTop: 22, textDecoration: "none" }}>
                Ver a coleção
              </Link>
            </>
          ) : (
            <>
              <h1 style={{ fontFamily: heading, fontSize: 25, fontWeight: 700, margin: "0 0 8px",
                lineHeight: 1.2, letterSpacing: "-.02em", textWrap: "balance" }}>
                {tab === "entrar" ? "Entrar como lojista" : "Comprar no atacado"}
              </h1>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: t.muted, margin: "0 0 22px" }}>
                {tab === "entrar"
                  ? `Acesse com o email que você cadastrou na ${storeName}.`
                  : `Faça seu cadastro de revenda. A ${storeName} aprova e você passa a ver o preço de atacado na loja.`}
              </p>

              <div style={{ display: "flex", gap: 4, padding: 4, marginBottom: 20,
                background: t.bg, borderRadius: r.button === 999 ? 999 : 10 }}>
                {(["cadastrar", "entrar"] as const).map(k => (
                  <button key={k} type="button" onClick={() => { setTab(k); setError(""); }}
                    style={{
                      flex: 1, fontFamily: body, fontSize: 13, fontWeight: 600, padding: "9px 10px",
                      borderRadius: r.button === 999 ? 999 : 7, cursor: "pointer", border: "none",
                      background: tab === k ? t.surface : "transparent",
                      color: tab === k ? t.text : t.muted,
                      boxShadow: tab === k ? "0 1px 3px rgba(0,0,0,.08)" : "none",
                    }}>
                    {k === "cadastrar" ? "Quero me cadastrar" : "Já tenho acesso"}
                  </button>
                ))}
              </div>

              <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {tab === "cadastrar" && (
                  <>
                    <input className="rg-input" style={input} placeholder="Seu nome completo"
                      value={f.name} onChange={on("name")} required maxLength={80} autoComplete="name" />
                    <div className="rg-row">
                      <input className="rg-input" style={input} placeholder="Loja / empresa"
                        value={f.company} onChange={on("company")} maxLength={80} autoComplete="organization" />
                      <input className="rg-input" style={input} placeholder="CNPJ ou CPF"
                        value={f.document} onChange={on("document")} maxLength={20} />
                    </div>
                    <div className="rg-row">
                      <input className="rg-input" style={input} placeholder="WhatsApp com DDD"
                        value={f.phone} onChange={on("phone")} required maxLength={20} autoComplete="tel" />
                      <input className="rg-input" style={input} placeholder="Cidade"
                        value={f.city} onChange={on("city")} maxLength={80} autoComplete="address-level2" />
                    </div>
                  </>
                )}
                <input className="rg-input" style={input} type="email" placeholder="Email"
                  value={f.email} onChange={on("email")} required maxLength={120} autoComplete="email" />
                <input className="rg-input" style={input} type="password"
                  placeholder={tab === "entrar" ? "Senha" : "Crie uma senha (mínimo 6)"}
                  value={f.password} onChange={on("password")} required minLength={tab === "entrar" ? 1 : 6}
                  maxLength={72} autoComplete={tab === "entrar" ? "current-password" : "new-password"} />

                {error && (
                  <p style={{ fontSize: 13, color: "#dc2626", margin: "2px 0 0", lineHeight: 1.5 }}>{error}</p>
                )}

                <button type="submit" disabled={busy} style={{ ...btn, marginTop: 8 }}>
                  {busy && <Loader2 size={15} className="rg-spin" />}
                  {tab === "entrar" ? "Entrar" : "Enviar cadastro"}
                </button>
              </form>
            </>
          )}
        </div>

        <p style={{ fontSize: 12, color: t.muted, textAlign: "center", marginTop: 18 }}>
          {storeName} · atacado para lojistas
        </p>
      </div>
    </div>
  );
}
