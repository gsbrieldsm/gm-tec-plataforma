"use client";

import { useEffect, useRef, useState } from "react";
import { ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { apiUrl } from "@/lib/base-path";

const UI = "var(--font-space), var(--font-geist-sans), sans-serif";

/** Vitrine mostra a foto em pé; cortar aqui evita peça esticada na loja. */
const ASPECT = 4 / 5;
const MAX_W = 1200;

/**
 * Corta no centro em 4:5 e comprime, tudo no navegador. Foto de celular tem
 * 4 MB; depois disto tem ~200 KB, que é o que a cliente final baixa.
 */
function prepare(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);

      let sw = img.naturalWidth;
      let sh = img.naturalHeight;
      if (!sw || !sh) return reject(new Error("Imagem inválida."));

      // Maior retângulo 4:5 que cabe na foto original.
      if (sw / sh > ASPECT) sw = Math.round(sh * ASPECT);
      else sh = Math.round(sw / ASPECT);
      const sx = (img.naturalWidth - sw) / 2;
      const sy = (img.naturalHeight - sh) / 2;

      const w = Math.min(sw, MAX_W);
      const h = Math.round(w / ASPECT);

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Navegador sem suporte a canvas."));
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);

      canvas.toBlob(
        b => (b ? resolve(b) : reject(new Error("Não consegui processar a imagem."))),
        "image/webp",
        0.82,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não consegui abrir esse arquivo como imagem."));
    };
    img.src = url;
  });
}

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
};

export function ImageField({ value, onChange }: Props) {
  const [ready, setReady] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let alive = true;
    fetch(apiUrl("/api/tenant/products/image"))
      .then(r => (r.ok ? r.json() : { ready: false }))
      .then(d => alive && setReady(!!d.ready))
      .catch(() => alive && setReady(false));
    return () => { alive = false; };
  }, []);

  async function send(file: File) {
    setError(null);
    setBusy(true);
    try {
      const blob = await prepare(file);
      const body = new FormData();
      body.append("file", new File([blob], "foto.webp", { type: "image/webp" }));
      const res = await fetch(apiUrl("/api/tenant/products/image"), { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Falha ao enviar.");
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao enviar.");
    } finally {
      setBusy(false);
    }
  }

  function pick(files: FileList | null) {
    const f = files?.[0];
    if (f) void send(f);
  }

  const label = { fontFamily: UI, fontSize: 11, fontWeight: 600, letterSpacing: ".06em",
    textTransform: "uppercase" as const, color: "var(--text-3)", marginBottom: 7, display: "block" };

  return (
    <div>
      <style>{`
        .imgf-spin { animation: imgf-spin 1s linear infinite; }
        @keyframes imgf-spin { to { transform: rotate(360deg); } }
      `}</style>
      <span style={label}>Foto do produto</span>

      <div
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files); }}
        style={{ display: "flex", gap: 12, alignItems: "stretch" }}
      >
        <div style={{
          width: 88, aspectRatio: "4 / 5", borderRadius: 10, overflow: "hidden", flexShrink: 0,
          background: "var(--surface-2)", border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {value
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={value} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <ImageIcon size={20} color="var(--text-3)" />}
        </div>

        <div style={{
          flex: 1, borderRadius: 10, padding: "14px 16px",
          border: `1px dashed ${drag ? "var(--accent)" : "var(--border-hi)"}`,
          background: drag ? "var(--surface-2)" : "transparent",
          display: "flex", flexDirection: "column", justifyContent: "center", gap: 8,
        }}>
          {ready === false ? (
            <p style={{ fontSize: 11.5, color: "var(--text-3)", margin: 0, lineHeight: 1.5 }}>
              Envio de foto ainda não configurado. Avise o suporte.
            </p>
          ) : (
            <>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button type="button" disabled={busy || ready === null}
                  onClick={() => input.current?.click()}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    fontFamily: UI, fontSize: 12, fontWeight: 600,
                    cursor: busy ? "default" : "pointer", opacity: busy ? .6 : 1,
                    color: "var(--accent)", background: "transparent",
                    border: "1px solid var(--border-hi)", borderRadius: 8, padding: "8px 13px",
                  }}>
                  {busy ? <Loader2 size={13} className="imgf-spin" /> : <Upload size={13} />}
                  {busy ? "Enviando…" : value ? "Trocar foto" : "Escolher foto"}
                </button>

                {value && !busy && (
                  <button type="button" onClick={() => { onChange(null); setError(null); }}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 7,
                      fontFamily: UI, fontSize: 12, fontWeight: 600, cursor: "pointer",
                      color: "var(--text-3)", background: "transparent",
                      border: "1px solid var(--border)", borderRadius: 8, padding: "8px 13px",
                    }}>
                    <Trash2 size={13} /> Remover
                  </button>
                )}
              </div>
              <p style={{ fontSize: 11, color: "var(--text-3)", margin: 0, lineHeight: 1.5 }}>
                Arraste aqui ou escolha do computador. Corto em 4:5 e comprimo sozinho —
                pode mandar a foto do celular do jeito que está.
              </p>
            </>
          )}

          {error && (
            <p style={{ fontSize: 11.5, color: "var(--red)", margin: 0, lineHeight: 1.5 }}>{error}</p>
          )}
        </div>
      </div>

      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden
        onChange={e => { pick(e.target.files); e.target.value = ""; }} />
    </div>
  );
}
