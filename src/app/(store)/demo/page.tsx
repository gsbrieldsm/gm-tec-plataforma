"use client";

import { useState } from "react";
import { SessionProvider, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AUTH_BASE_PATH, apiUrl } from "@/lib/base-path";

const C = {
  bg: "#07070f",
  bg2: "#0d0d1c",
  surface: "#12122a",
  card: "#17173a",
  border: "rgba(99,102,241,0.18)",
  border2: "rgba(99,102,241,0.35)",
  indigo: "#6366f1",
  violet: "#8b5cf6",
  sky: "#38bdf8",
  text: "#f1f5f9",
  text2: "#94a3b8",
  text3: "#475569",
  green: "#34d399",
  red: "#f87171",
};

export default function DemoPage() {
  return (
    <SessionProvider basePath={AUTH_BASE_PATH}>
      <DemoForm />
    </SessionProvider>
  );
}

function DemoForm() {
  const router = useRouter();
  const [step, setStep] = useState<"register" | "login">("register");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setStep("login");
          setError("Esse email já tem conta. Entre abaixo.");
          return;
        }
        setError(data.error ?? "Erro ao criar conta.");
        return;
      }
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (result?.ok) {
        router.push("/admin");
      } else {
        setError("Conta criada! Faça login para continuar.");
        setStep("login");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (result?.ok) {
        router.push("/admin");
      } else {
        setError("Email ou senha incorretos.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .demo-root {
          min-height: 100vh;
          background: ${C.bg};
          font-family: 'DM Sans', system-ui, sans-serif;
          color: ${C.text};
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          position: relative;
          overflow: hidden;
        }

        .display { font-family: var(--font-univia, 'DM Sans', system-ui); font-style: italic; }

        .blob-demo {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          animation: demo-drift 14s ease-in-out infinite alternate;
        }
        @keyframes demo-drift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(40px, -30px) scale(1.1); }
        }

        .demo-card {
          position: relative;
          width: 100%;
          max-width: 420px;
          background: ${C.card};
          border: 1px solid ${C.border2};
          border-radius: 20px;
          padding: 40px 36px;
          backdrop-filter: blur(20px);
          box-shadow: 0 0 60px rgba(99,102,241,0.08);
        }

        .demo-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 32px;
          text-decoration: none;
        }
        .demo-logo-mark {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, ${C.indigo}, ${C.sky});
          border-radius: 8px;
        }
        .demo-logo-text {
          font-size: 16px;
          font-weight: 600;
          color: ${C.text};
        }

        .demo-title {
          font-size: 26px;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 6px;
        }
        .demo-subtitle {
          font-size: 14px;
          color: ${C.text2};
          margin-bottom: 28px;
          line-height: 1.5;
        }

        .field-group { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }

        .field-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: ${C.text2};
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 6px;
        }

        .field-input {
          width: 100%;
          background: ${C.surface};
          border: 1px solid ${C.border};
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 14px;
          color: ${C.text};
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s;
        }
        .field-input:focus { border-color: ${C.indigo}; }
        .field-input::placeholder { color: ${C.text3}; }

        .btn-primary {
          width: 100%;
          background: linear-gradient(90deg, ${C.indigo}, ${C.violet});
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 14px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
          font-family: inherit;
        }
        .btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

        .error-msg {
          background: rgba(248,113,113,0.1);
          border: 1px solid rgba(248,113,113,0.25);
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
          color: ${C.red};
          margin-bottom: 18px;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
          color: ${C.text3};
          font-size: 12px;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: ${C.border};
        }

        .toggle-link {
          text-align: center;
          font-size: 13px;
          color: ${C.text2};
        }
        .toggle-link button {
          background: none;
          border: none;
          color: ${C.sky};
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          text-decoration: underline;
          font-family: inherit;
        }

        .badge-free {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(52,211,153,0.1);
          border: 1px solid rgba(52,211,153,0.25);
          color: ${C.green};
          border-radius: 6px;
          padding: 3px 9px;
          font-size: 11px;
          font-weight: 600;
          margin-bottom: 12px;
        }
      `}</style>

      <div className="demo-root">
        {/* blobs */}
        <div className="blob-demo" style={{ width:360, height:360, background:`radial-gradient(circle, ${C.indigo}30, transparent 70%)`, top:-80, right:-80, animationDelay:"0s" }} />
        <div className="blob-demo" style={{ width:280, height:280, background:`radial-gradient(circle, ${C.violet}25, transparent 70%)`, bottom:-60, left:-60, animationDelay:"5s", animationDirection:"alternate-reverse" }} />

        <div className="demo-card">
          <Link href="/apresentacao" className="demo-logo">
            <div className="demo-logo-mark" />
            <span className="demo-logo-text display">GM & Co Tec</span>
          </Link>

          {step === "register" ? (
            <>
              <div className="badge-free">✦ Gratuito · Sem cartão</div>
              <h1 className="demo-title display">
                Crie sua conta<br />e comece agora
              </h1>
              <p className="demo-subtitle">
                Configure seu painel em menos de 2 minutos e conecte seus canais de venda.
              </p>

              {error && <div className="error-msg">{error}</div>}

              <form onSubmit={handleRegister}>
                <div className="field-group">
                  <div>
                    <label className="field-label">Seu nome</label>
                    <input
                      className="field-input"
                      type="text"
                      placeholder="João Silva"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="field-label">Email</label>
                    <input
                      className="field-input"
                      type="email"
                      placeholder="joao@empresa.com"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="field-label">Senha</label>
                    <input
                      className="field-input"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <button className="btn-primary" type="submit" disabled={loading}>
                  {loading ? "Criando conta…" : "Criar conta grátis →"}
                </button>
              </form>

              <div className="divider">ou</div>
              <div className="toggle-link">
                Já tem conta?{" "}
                <button onClick={() => { setStep("login"); setError(""); }}>
                  Entrar
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="demo-title display">
                Bem-vindo de volta
              </h1>
              <p className="demo-subtitle">
                Entre na sua conta para acessar o painel.
              </p>

              {error && <div className="error-msg">{error}</div>}

              <form onSubmit={handleLogin}>
                <div className="field-group">
                  <div>
                    <label className="field-label">Email</label>
                    <input
                      className="field-input"
                      type="email"
                      placeholder="joao@empresa.com"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="field-label">Senha</label>
                    <input
                      className="field-input"
                      type="password"
                      placeholder="Sua senha"
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button className="btn-primary" type="submit" disabled={loading}>
                  {loading ? "Entrando…" : "Entrar →"}
                </button>
              </form>

              <div className="divider">ou</div>
              <div className="toggle-link">
                Não tem conta?{" "}
                <button onClick={() => { setStep("register"); setError(""); }}>
                  Criar conta grátis
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
