"use client";

import { useEffect, useRef, useState } from "react";
import { ImageIcon, Loader2, Trash2, Upload, Star, ArrowLeft, ArrowRight } from "lucide-react";
import { apiUrl } from "@/lib/base-path";
import type { ApiImage } from "@/lib/product-schema";
import { PHOTO_ASPECT, PHOTO_RATIO, PHOTO_MAX_W } from "@/lib/photo";

const UI = "var(--font-space), var(--font-geist-sans), sans-serif";

const MAX_PHOTOS = 8;

/**
 * Corta no centro na proporção da vitrine e comprime, tudo no navegador.
 * Foto de celular tem 4 MB; depois disto sobra uma fração, que é o que a
 * cliente final baixa.
 */
function prepare(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      let sw = img.naturalWidth, sh = img.naturalHeight;
      if (!sw || !sh) return reject(new Error("Imagem inválida."));

      if (sw / sh > PHOTO_RATIO) sw = Math.round(sh * PHOTO_RATIO);
      else sh = Math.round(sw / PHOTO_RATIO);
      const sx = (img.naturalWidth - sw) / 2;
      const sy = (img.naturalHeight - sh) / 2;

      const w = Math.min(sw, PHOTO_MAX_W);
      const h = Math.round(w / PHOTO_RATIO);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Navegador sem suporte a canvas."));
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);

      canvas.toBlob(
        b => (b ? resolve(b) : reject(new Error("Não consegui processar a imagem."))),
        "image/webp", 0.82);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Não consegui abrir esse arquivo como imagem.")); };
    img.src = url;
  });
}

type Draft = Pick<ApiImage, "url" | "path"> & { id?: string };

type Props = {
  value: Draft[];
  onChange: (images: Draft[]) => void;
};

export function ImageField({ value, onChange }: Props) {
  const [ready, setReady] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(0);
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

  async function send(files: File[]) {
    setError(null);
    const room = MAX_PHOTOS - value.length;
    if (room <= 0) { setError(`Máximo de ${MAX_PHOTOS} fotos por peça.`); return; }
    const batch = files.slice(0, room);
    if (files.length > room) setError(`Couberam só ${room}: o limite é ${MAX_PHOTOS} fotos.`);

    setBusy(batch.length);
    const novas: Draft[] = [];
    for (const file of batch) {
      try {
        const blob = await prepare(file);
        const body = new FormData();
        body.append("file", new File([blob], "foto.webp", { type: "image/webp" }));
        const res = await fetch(apiUrl("/api/tenant/products/image"), { method: "POST", body });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? "Falha ao enviar.");
        novas.push({ url: data.url, path: data.path ?? "" });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Falha ao enviar.");
      } finally {
        setBusy(n => n - 1);
      }
    }
    if (novas.length) onChange([...value, ...novas]);
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  const label = { fontFamily: UI, fontSize: 11, fontWeight: 600, letterSpacing: ".06em",
    textTransform: "uppercase" as const, color: "var(--text-3)", marginBottom: 7, display: "block" };

  return (
    <div>
      <style>{`
        .imgf-spin { animation: imgf-spin 1s linear infinite; }
        @keyframes imgf-spin { to { transform: rotate(360deg); } }
        .imgf-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(72px, 1fr)); gap: 9px; }
        .imgf-tile .imgf-tools { opacity: 0; transition: opacity .15s ease; }
        .imgf-tile:hover .imgf-tools, .imgf-tile:focus-within .imgf-tools { opacity: 1; }
      `}</style>

      <span style={label}>
        Fotos do produto
        <span style={{ textTransform: "none", letterSpacing: 0, fontWeight: 500, marginLeft: 8, color: "var(--text-3)" }}>
          {value.length}/{MAX_PHOTOS} — a primeira é a capa
        </span>
      </span>

      <div
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); void send(Array.from(e.dataTransfer.files)); }}
        style={{
          borderRadius: 10, padding: 12,
          border: `1px dashed ${drag ? "var(--accent)" : "var(--border-hi)"}`,
          background: drag ? "var(--surface-2)" : "transparent",
          display: "flex", flexDirection: "column", gap: 11,
        }}
      >
        {value.length > 0 && (
          <div className="imgf-grid">
            {value.map((im, i) => (
              <div key={(im.id ?? "") + im.url} className="imgf-tile" style={{
                position: "relative", aspectRatio: PHOTO_ASPECT, borderRadius: 9, overflow: "hidden",
                background: "var(--surface-2)", border: i === 0 ? "2px solid var(--accent)" : "1px solid var(--border)",
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={im.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />

                {i === 0 && (
                  <span style={{
                    position: "absolute", top: 4, left: 4, display: "inline-flex", alignItems: "center", gap: 3,
                    fontFamily: UI, fontSize: 9, fontWeight: 700, padding: "3px 6px", borderRadius: 999,
                    background: "var(--accent)", color: "#fff",
                  }}><Star size={8} /> CAPA</span>
                )}

                <div className="imgf-tools" style={{
                  position: "absolute", inset: "auto 0 0 0", display: "flex", gap: 2, padding: 4,
                  background: "linear-gradient(transparent, rgba(0,0,0,.72))", justifyContent: "center",
                }}>
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                    aria-label="Mover para a esquerda" style={tool(i === 0)}><ArrowLeft size={11} /></button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1}
                    aria-label="Mover para a direita" style={tool(i === value.length - 1)}><ArrowRight size={11} /></button>
                  <button type="button" onClick={() => onChange(value.filter((_, k) => k !== i))}
                    aria-label="Remover foto" style={tool(false)}><Trash2 size={11} /></button>
                </div>
              </div>
            ))}

            {busy > 0 && Array.from({ length: busy }).map((_, i) => (
              <div key={`up${i}`} style={{
                aspectRatio: PHOTO_ASPECT, borderRadius: 9, border: "1px dashed var(--border-hi)",
                display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)",
              }}><Loader2 size={16} className="imgf-spin" /></div>
            ))}
          </div>
        )}

        {ready === false ? (
          <p style={{ fontSize: 11.5, color: "var(--text-3)", margin: 0, lineHeight: 1.5 }}>
            Envio de foto ainda não configurado nesta instalação.
          </p>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <button type="button" disabled={busy > 0 || ready === null || value.length >= MAX_PHOTOS}
              onClick={() => input.current?.click()}
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                fontFamily: UI, fontSize: 12, fontWeight: 600,
                cursor: busy > 0 ? "default" : "pointer",
                opacity: busy > 0 || value.length >= MAX_PHOTOS ? .55 : 1,
                color: "var(--accent)", background: "transparent",
                border: "1px solid var(--border-hi)", borderRadius: 8, padding: "8px 13px",
              }}>
              {busy > 0 ? <Loader2 size={13} className="imgf-spin" /> : value.length ? <Upload size={13} /> : <ImageIcon size={13} />}
              {busy > 0 ? `Enviando ${busy}…` : value.length ? "Adicionar fotos" : "Escolher fotos"}
            </button>
            <p style={{ fontSize: 11, color: "var(--text-3)", margin: 0, lineHeight: 1.5, flex: 1, minWidth: 180 }}>
              Arraste várias de uma vez. Corto no formato 9:16 e comprimo sozinho —
              é o mesmo enquadramento de Stories, então pode mandar a foto do celular
              do jeito que está.
            </p>
          </div>
        )}

        {error && <p style={{ fontSize: 11.5, color: "var(--red)", margin: 0, lineHeight: 1.5 }}>{error}</p>}
      </div>

      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden multiple
        onChange={e => { void send(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
    </div>
  );
}

const tool = (off: boolean): React.CSSProperties => ({
  width: 22, height: 22, borderRadius: 6, cursor: off ? "default" : "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
  background: "rgba(255,255,255,.16)", border: "none", color: "#fff",
  opacity: off ? .35 : 1, padding: 0,
});
