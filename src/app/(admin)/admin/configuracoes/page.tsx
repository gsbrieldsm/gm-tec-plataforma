"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Palette, Store, CreditCard, Truck, Settings2, Upload, Trash2, X,
  ExternalLink, Smartphone, Monitor, ShieldCheck, BookOpen, Check,
  CircleDashed, Loader2, CheckCircle2, Sparkles, Globe,
} from "lucide-react";
import { apiUrl, BASE_PATH } from "@/lib/base-path";
import { MOCK_PRODUCTS } from "@/lib/catalog";
import {
  CATEGORY_META, INTEGRATIONS,
  type Integration, type IntegrationCategory, type IntegrationId,
} from "@/lib/integrations";
import {
  PALETTES, FONT_STACKS, readableOn, suggestHandle,
  type TenantSettings, type BrandSettings, type StoreSettings, type IntegrationStatus,
} from "@/lib/tenant-settings";
import { StorefrontView } from "@/components/storefront/storefront-view";

const UI   = "var(--font-space), var(--font-geist-sans), sans-serif";
const MONO = "var(--font-space-mono), var(--font-geist-mono), monospace";

const LIST: readonly Integration[] = INTEGRATIONS;

type Tab = "identidade" | "loja" | IntegrationCategory;
const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "identidade", label: "Identidade visual", icon: Palette },
  { id: "loja",       label: "Loja online",       icon: Store },
  { id: "pagamentos", label: "Pagamentos",        icon: CreditCard },
  { id: "logistica",  label: "Logística",         icon: Truck },
  { id: "operacao",   label: "Operação",          icon: Settings2 },
];

const STATUS_META: Record<IntegrationStatus, { label: string; color: string; icon: React.ElementType }> = {
  pendente:  { label: "A fazer",           color: "#64748b", icon: CircleDashed },
  andamento: { label: "Em andamento",      color: "#d97706", icon: Loader2 },
  pronto:    { label: "Pronto para ativar", color: "#059669", icon: CheckCircle2 },
};

type Saved = { name: string; handle: string | null; settings: TenantSettings };
type Draft = { handle: string; settings: TenantSettings };

const toDraft = (s: Saved): Draft => ({ handle: s.handle ?? "", settings: s.settings });

export default function ConfiguracoesPage() {
  const [saved, setSaved]     = useState<Saved | null>(null);
  const [draft, setDraft]     = useState<Draft | null>(null);
  const [loadError, setLoadError] = useState("");
  const [tab, setTab]         = useState<Tab>("identidade");
  const [saving, setSaving]   = useState(false);
  const [saveError, setSaveError] = useState("");
  const [justSaved, setJustSaved] = useState(false);
  const [openId, setOpenId]   = useState<IntegrationId | null>(null);
  const [origin, setOrigin]   = useState("");

  useEffect(() => {
    setOrigin(window.location.host);
    fetch(apiUrl("/api/tenant/settings"))
      .then(async r => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? "Erro ao carregar.");
        return r.json() as Promise<Saved>;
      })
      .then(data => { setSaved(data); setDraft(toDraft(data)); })
      .catch(e => setLoadError(e.message));
  }, []);

  const dirty = useMemo(
    () => !!saved && !!draft && JSON.stringify(draft) !== JSON.stringify(toDraft(saved)),
    [saved, draft],
  );

  if (loadError) {
    return <p style={{ fontFamily: UI, color: "var(--red)", fontSize: 14 }}>{loadError}</p>;
  }
  if (!saved || !draft) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: UI, color: "var(--text-2)", fontSize: 13, padding: 24 }}>
        <Loader2 size={16} className="cfg-spin" /> Carregando configurações…
      </div>
    );
  }

  const s = draft.settings;
  const setBrand = (patch: Partial<BrandSettings>) =>
    setDraft(d => d && ({ ...d, settings: { ...d.settings, brand: { ...d.settings.brand, ...patch } } }));
  const setStore = (patch: Partial<StoreSettings>) =>
    setDraft(d => d && ({ ...d, settings: { ...d.settings, store: { ...d.settings.store, ...patch } } }));
  const setStatus = (id: IntegrationId, status: IntegrationStatus) =>
    setDraft(d => d && ({ ...d, settings: { ...d.settings, integrations: { ...d.settings.integrations, [id]: status } } }));
  const statusOf = (id: string): IntegrationStatus => s.integrations[id as IntegrationId] ?? "pendente";

  async function save() {
    if (!draft) return;
    setSaving(true);
    setSaveError("");
    try {
      const r = await fetch(apiUrl("/api/tenant/settings"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Erro ao salvar.");
      setSaved(data);
      setDraft(toDraft(data));
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
    } catch (e) {
      setSaveError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const storeName  = s.brand.storeName || saved.name;
  const readyCount = LIST.filter(i => statusOf(i.id) === "pronto").length;
  const liveHandle = saved.handle;
  const opened     = openId ? LIST.find(i => i.id === openId) ?? null : null;

  return (
    <>
      <style>{`
        .cfg-split { display: grid; grid-template-columns: minmax(0, 1fr) 400px; gap: 20px; align-items: start; }
        .cfg-preview { position: sticky; top: 16px; }
        .cfg-tabs { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; margin-bottom: 18px; }
        .cfg-tabs::-webkit-scrollbar { display: none; }
        .cfg-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .cfg-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
        .cfg-input:focus, .cfg-input:focus-visible { border-color: var(--accent) !important; box-shadow: 0 0 0 3px var(--accent-bg); outline: none; }
        .cfg-spin { animation: cfg-spin 1s linear infinite; }
        @keyframes cfg-spin { to { transform: rotate(360deg); } }
        @media (max-width: 1180px) {
          .cfg-split { grid-template-columns: minmax(0, 1fr); }
          .cfg-preview { position: static; }
        }
        @media (max-width: 560px) { .cfg-grid-2 { grid-template-columns: 1fr; } }
      `}</style>

      {/* ── Hero ──────────────────────────────────── */}
      <div className="admin-hero" style={{
        position: "relative", borderRadius: 20, overflow: "hidden",
        background: "linear-gradient(135deg,#0c0420 0%,#190a58 35%,#0b1e66 65%,#062244 100%)",
        padding: "28px 32px 24px", marginBottom: 20,
      }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{
            position: "absolute", width: 240, height: 240, borderRadius: "50%",
            background: `radial-gradient(circle, ${s.brand.primary}55 0%, transparent 70%)`,
            top: -90, right: 80, animation: "drift-1 9s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", width: 180, height: 180, borderRadius: "50%",
            background: `radial-gradient(circle, ${s.brand.accent}40 0%, transparent 70%)`,
            bottom: -70, left: 140, animation: "drift-2 11s ease-in-out infinite",
          }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            background: s.brand.logo ? "#fff" : s.brand.primary,
            border: "1px solid rgba(255,255,255,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
            fontFamily: FONT_STACKS[s.brand.font], fontSize: 22, fontWeight: 700,
            color: readableOn(s.brand.primary),
          }}>
            {s.brand.logo
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={s.brand.logo} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 6, boxSizing: "border-box" }} />
              : storeName.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{
              fontFamily: UI, fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.16em", textTransform: "uppercase", margin: "0 0 6px",
            }}>Configurações · sua loja</p>
            <h1 style={{ fontFamily: UI, fontSize: 24, fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1.15 }}>
              {storeName}
            </h1>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <HeroChip
              color={saved.settings.store.published ? "#34d399" : "#fbbf24"}
              label={saved.settings.store.published ? "Loja publicada" : "Rascunho"}
            />
            <HeroChip color="#93c5fd" label={`${readyCount} de ${LIST.length} integrações prontas`} />
            {liveHandle && (
              <Link href={`/loja/${liveHandle}`} target="_blank" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontFamily: UI, fontSize: 12, fontWeight: 700, color: "#fff",
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 10, padding: "8px 14px", textDecoration: "none",
              }}>
                Ver minha loja <ExternalLink size={12} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────── */}
      <div className="cfg-tabs" role="tablist">
        {TABS.map(({ id, label, icon: Icon }) => {
          const on = tab === id;
          return (
            <button key={id} role="tab" aria-selected={on} onClick={() => setTab(id)} style={{
              display: "inline-flex", alignItems: "center", gap: 7, flexShrink: 0,
              fontFamily: UI, fontSize: 12.5, fontWeight: 600,
              padding: "10px 15px", borderRadius: 10, cursor: "pointer",
              background: on ? "var(--accent-bg)" : "var(--surface)",
              border: `1px solid ${on ? "var(--accent)" : "var(--border)"}`,
              color: on ? "var(--accent)" : "var(--text-2)",
            }}>
              <Icon size={14} /> {label}
            </button>
          );
        })}
      </div>

      {(tab === "identidade" || tab === "loja") && (
        <div className="cfg-split">
          <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
            {tab === "identidade"
              ? <IdentityForm brand={s.brand} fallbackName={saved.name} onChange={setBrand} />
              : <StoreForm
                  store={s.store}
                  handle={draft.handle}
                  onHandle={h => setDraft(d => d && ({ ...d, handle: h }))}
                  onChange={setStore}
                  host={origin}
                  suggestion={suggestHandle(storeName)}
                />}
          </div>
          <PreviewPanel settings={s} fallbackName={saved.name} />
        </div>
      )}

      {(tab === "pagamentos" || tab === "logistica" || tab === "operacao") && (
        <IntegrationsTab category={tab} statusOf={statusOf} onOpen={id => setOpenId(id)} />
      )}

      {/* ── Save bar ──────────────────────────────── */}
      {(dirty || saveError || justSaved) && (
        <div style={{
          position: "sticky", bottom: 16, zIndex: 20, marginTop: 20,
          display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
          background: "var(--text-1)", color: "var(--bg)",
          borderRadius: 14, padding: "12px 14px 12px 18px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.22)",
          fontFamily: UI,
        }}>
          <span style={{ flex: 1, minWidth: 160, fontSize: 13, fontWeight: 500 }}>
            {saveError
              ? <span style={{ color: "#fca5a5" }}>{saveError}</span>
              : justSaved && !dirty
                ? <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Check size={15} /> Alterações salvas</span>
                : "Você tem alterações não salvas"}
          </span>
          {dirty && (
            <>
              <button onClick={() => { setDraft(toDraft(saved)); setSaveError(""); }} disabled={saving} style={{
                fontFamily: UI, fontSize: 13, fontWeight: 600, cursor: "pointer",
                background: "transparent", color: "inherit", opacity: 0.75,
                border: "1px solid rgba(255,255,255,0.25)", borderRadius: 10, padding: "10px 16px",
              }}>Descartar</button>
              <button onClick={save} disabled={saving} style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                fontFamily: UI, fontSize: 13, fontWeight: 700, cursor: "pointer",
                background: "var(--accent)", color: "#fff", border: "none",
                borderRadius: 10, padding: "10px 20px", minHeight: 40,
              }}>
                {saving && <Loader2 size={14} className="cfg-spin" />} Salvar
              </button>
            </>
          )}
        </div>
      )}

      {opened && (
        <IntegrationDrawer
          integration={opened}
          status={statusOf(opened.id)}
          onStatus={st => setStatus(opened.id as IntegrationId, st)}
          onClose={() => setOpenId(null)}
        />
      )}
    </>
  );
}

/* ═══ Identidade visual ═══════════════════════════════════════════ */

function IdentityForm({ brand, fallbackName, onChange }: {
  brand: BrandSettings; fallbackName: string; onChange: (p: Partial<BrandSettings>) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [logoError, setLogoError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setLogoError("");
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
      setLogoError("Envie PNG, JPG ou WebP. SVG não é aceito por segurança.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setLogoError("Arquivo acima de 5 MB. Use uma versão menor da logo.");
      return;
    }
    setBusy(true);
    try {
      onChange({ logo: await resizeLogo(file) });
    } catch (e) {
      setLogoError((e as Error).message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const activePalette = PALETTES.find(p => p.primary === brand.primary && p.accent === brand.accent)?.name;

  return (
    <>
      <Section title="Nome e mensagem" hint="Aparecem no topo da loja e no título da página.">
        <div className="cfg-grid-2">
          <Field id="cfg-name" label="Nome da loja">
            <input id="cfg-name" className="cfg-input" value={brand.storeName} maxLength={60}
              placeholder={fallbackName} onChange={e => onChange({ storeName: e.target.value })} style={inputStyle} />
          </Field>
          <Field id="cfg-tagline" label="Frase de destaque" counter={`${brand.tagline.length}/120`}>
            <input id="cfg-tagline" className="cfg-input" value={brand.tagline} maxLength={120}
              placeholder="Ex.: Moda autoral feita em pequenos lotes"
              onChange={e => onChange({ tagline: e.target.value })} style={inputStyle} />
          </Field>
        </div>
      </Section>

      <Section title="Logo" hint="PNG com fundo transparente fica melhor. Redimensionamos para até 320 px.">
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{
            width: 96, height: 96, borderRadius: 14, flexShrink: 0,
            background: "repeating-conic-gradient(var(--surface-3) 0% 25%, var(--surface) 0% 50%) 50% / 14px 14px",
            border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
          }}>
            {brand.logo
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={brand.logo} alt="Logo atual" style={{ maxWidth: "86%", maxHeight: "86%", objectFit: "contain" }} />
              : <span style={{ fontFamily: UI, fontSize: 11, color: "var(--text-3)" }}>sem logo</span>}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input ref={fileRef} id="cfg-logo" type="file" accept="image/png,image/jpeg,image/webp" hidden
              onChange={e => onFile(e.target.files?.[0])} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} style={secondaryBtn}>
              {busy ? <Loader2 size={14} className="cfg-spin" /> : <Upload size={14} />}
              {brand.logo ? "Trocar logo" : "Enviar logo"}
            </button>
            {brand.logo && (
              <button type="button" onClick={() => onChange({ logo: null })} style={{ ...secondaryBtn, color: "var(--red)" }}>
                <Trash2 size={14} /> Remover
              </button>
            )}
          </div>
        </div>
        {logoError && <p style={{ fontFamily: UI, fontSize: 12, color: "var(--red)", margin: "10px 0 0" }}>{logoError}</p>}
      </Section>

      <Section title="Cores" hint="A principal vai nos botões e na faixa de anúncio; a de destaque colore o fundo do topo.">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {PALETTES.map(p => {
            const on = activePalette === p.name;
            return (
              <button key={p.name} type="button" onClick={() => onChange({ primary: p.primary, accent: p.accent })}
                aria-pressed={on}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  fontFamily: UI, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  padding: "7px 12px 7px 8px", borderRadius: 999,
                  background: on ? "var(--accent-bg)" : "var(--surface)",
                  border: `1px solid ${on ? "var(--accent)" : "var(--border)"}`,
                  color: on ? "var(--accent)" : "var(--text-2)",
                }}>
                <span style={{ display: "flex" }}>
                  <span style={{ width: 16, height: 16, borderRadius: "50%", background: p.primary, border: "1px solid rgba(0,0,0,0.1)" }} />
                  <span style={{ width: 16, height: 16, borderRadius: "50%", background: p.accent, border: "1px solid rgba(0,0,0,0.1)", marginLeft: -5 }} />
                </span>
                {p.name}
              </button>
            );
          })}
        </div>
        <div className="cfg-grid-2">
          <ColorField id="cfg-primary" label="Cor principal" value={brand.primary} onChange={v => onChange({ primary: v })} />
          <ColorField id="cfg-accent" label="Cor de destaque" value={brand.accent} onChange={v => onChange({ accent: v })} />
        </div>
        <p style={{ fontFamily: UI, fontSize: 11.5, color: "var(--text-3)", margin: "10px 0 0" }}>
          Texto sobre a cor principal: <strong style={{ color: "var(--text-2)" }}>
            {readableOn(brand.primary) === "#ffffff" ? "branco" : "escuro"}
          </strong> — escolhido automaticamente para manter a leitura.
        </p>
      </Section>

      <Section title="Estilo" hint="Define o clima da vitrine.">
        <Label>Tema</Label>
        <Segmented
          value={brand.theme}
          onChange={v => onChange({ theme: v })}
          options={[{ value: "light", label: "Claro" }, { value: "dark", label: "Escuro" }]}
        />

        <Label style={{ marginTop: 16 }}>Tipografia</Label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
          {([
            ["moderna", "Moderna"], ["elegante", "Elegante"], ["classica", "Clássica"],
          ] as const).map(([v, label]) => {
            const on = brand.font === v;
            return (
              <button key={v} type="button" onClick={() => onChange({ font: v })} aria-pressed={on} style={{
                padding: "12px 8px", borderRadius: 10, cursor: "pointer", textAlign: "center",
                background: on ? "var(--accent-bg)" : "var(--surface)",
                border: `1px solid ${on ? "var(--accent)" : "var(--border)"}`,
                color: on ? "var(--accent)" : "var(--text-1)",
              }}>
                <span style={{ display: "block", fontFamily: FONT_STACKS[v], fontSize: 24, fontWeight: v === "elegante" ? 500 : 700, lineHeight: 1 }}>Aa</span>
                <span style={{ display: "block", fontFamily: UI, fontSize: 11, fontWeight: 600, marginTop: 6, color: on ? "var(--accent)" : "var(--text-2)" }}>{label}</span>
              </button>
            );
          })}
        </div>

        <Label style={{ marginTop: 16 }}>Cantos</Label>
        <Segmented
          value={brand.radius}
          onChange={v => onChange({ radius: v })}
          options={[{ value: "reto", label: "Retos" }, { value: "suave", label: "Suaves" }, { value: "redondo", label: "Redondos" }]}
        />
      </Section>
    </>
  );
}

async function resizeLogo(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("Não conseguimos ler essa imagem."));
      i.src = url;
    });
    const scale = Math.min(1, 320 / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    let data = canvas.toDataURL("image/png");
    if (data.length > 400_000) data = canvas.toDataURL("image/webp", 0.9);
    if (data.length > 400_000) throw new Error("A logo ficou pesada demais mesmo reduzida. Tente uma versão mais simples.");
    return data;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/* ═══ Loja online ═════════════════════════════════════════════════ */

function StoreForm({ store, handle, onHandle, onChange, host, suggestion }: {
  store: StoreSettings; handle: string; onHandle: (h: string) => void;
  onChange: (p: Partial<StoreSettings>) => void; host: string; suggestion: string;
}) {
  const publicUrl = `${host}${BASE_PATH}/loja/${handle || "seu-endereco"}`;

  return (
    <>
      <Section title="Endereço e publicação" hint="O endereço é o link que você divulga. Dá pra trocar depois, mas links antigos param de funcionar.">
        <Field id="cfg-handle" label="Endereço da loja">
          <div style={{
            display: "flex", alignItems: "stretch", borderRadius: 8, overflow: "hidden",
            border: "1px solid var(--border)", background: "var(--surface)",
          }}>
            <span style={{
              display: "flex", alignItems: "center", padding: "0 10px",
              fontFamily: MONO, fontSize: 11.5, color: "var(--text-3)",
              background: "var(--surface-2)", borderRight: "1px solid var(--border)", whiteSpace: "nowrap",
            }}>/loja/</span>
            <input id="cfg-handle" className="cfg-input" value={handle} maxLength={40}
              placeholder={suggestion || "minha-loja"}
              onChange={e => onHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              style={{ ...inputStyle, border: "none", borderRadius: 0, fontFamily: MONO, fontSize: 12.5 }} />
          </div>
        </Field>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: MONO, fontSize: 11, color: "var(--text-2)", wordBreak: "break-all" }}>
            <Globe size={12} /> {publicUrl}
          </span>
          {!handle && suggestion.length >= 3 && (
            <button type="button" onClick={() => onHandle(suggestion)} style={{ ...linkBtn }}>
              Usar “{suggestion}”
            </button>
          )}
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: 14, marginTop: 18,
          padding: "14px 16px", borderRadius: 12,
          background: store.published ? "rgba(5,150,105,0.07)" : "var(--surface-2)",
          border: `1px solid ${store.published ? "rgba(5,150,105,0.25)" : "var(--border)"}`,
        }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: UI, fontSize: 13, fontWeight: 700, color: "var(--text-1)", margin: 0 }}>
              {store.published ? "Loja visível para todos" : "Loja em rascunho"}
            </p>
            <p style={{ fontFamily: UI, fontSize: 11.5, color: "var(--text-2)", margin: "3px 0 0" }}>
              {store.published
                ? "Qualquer pessoa com o link vê a vitrine."
                : "Só você, logado, consegue abrir o link."}
            </p>
          </div>
          <Toggle checked={store.published} onChange={v => onChange({ published: v })} label="Publicar loja" />
        </div>
      </Section>

      <Section title="Vitrine" hint="Textos que aparecem para o cliente.">
        <Field id="cfg-announce" label="Faixa de anúncio" counter={`${store.announcement.length}/100`}>
          <input id="cfg-announce" className="cfg-input" value={store.announcement} maxLength={100}
            placeholder="Ex.: Frete grátis acima de R$ 299"
            onChange={e => onChange({ announcement: e.target.value })} style={inputStyle} />
        </Field>
        <Field id="cfg-about" label="Sobre a loja" counter={`${store.about.length}/600`} style={{ marginTop: 12 }}>
          <textarea id="cfg-about" className="cfg-input" value={store.about} maxLength={600} rows={4}
            placeholder="Conte a história da marca, como as peças são feitas, o que a torna diferente."
            onChange={e => onChange({ about: e.target.value })} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} />
        </Field>
      </Section>

      <Section title="Contato" hint="Vão para o rodapé da loja.">
        <div className="cfg-grid-2">
          <Field id="cfg-wa" label="WhatsApp">
            <input id="cfg-wa" className="cfg-input" inputMode="tel" value={store.whatsapp} maxLength={20}
              placeholder="(11) 99999-0000" onChange={e => onChange({ whatsapp: e.target.value })} style={inputStyle} />
          </Field>
          <Field id="cfg-email" label="E-mail">
            <input id="cfg-email" className="cfg-input" type="email" value={store.email} maxLength={120}
              placeholder="contato@sualoja.com.br" onChange={e => onChange({ email: e.target.value })} style={inputStyle} />
          </Field>
          <Field id="cfg-ig" label="Instagram">
            <input id="cfg-ig" className="cfg-input" value={store.instagram} maxLength={40}
              placeholder="@sualoja" onChange={e => onChange({ instagram: e.target.value })} style={inputStyle} />
          </Field>
          <Field id="cfg-city" label="Cidade">
            <input id="cfg-city" className="cfg-input" value={store.city} maxLength={80}
              placeholder="São Paulo, SP" onChange={e => onChange({ city: e.target.value })} style={inputStyle} />
          </Field>
          <Field id="cfg-doc" label="CNPJ ou CPF">
            <input id="cfg-doc" className="cfg-input" value={store.document} maxLength={20}
              placeholder="00.000.000/0001-00" onChange={e => onChange({ document: e.target.value })} style={inputStyle} />
          </Field>
        </div>
      </Section>

      <div style={{
        display: "flex", gap: 10, padding: "14px 16px", borderRadius: 12,
        background: "var(--accent-bg)", border: "1px solid var(--border-hi)",
      }}>
        <Sparkles size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontFamily: UI, fontSize: 12, lineHeight: 1.55, color: "var(--text-2)", margin: 0 }}>
          Enquanto o pagamento online não está ativo, o botão de cada peça abre uma conversa no WhatsApp da loja
          já com o nome do produto. Quando você ativar um provedor em <strong>Pagamentos</strong>, ele vira o checkout.
        </p>
      </div>
    </>
  );
}

/* ═══ Prévia ══════════════════════════════════════════════════════ */

function PreviewPanel({ settings, fallbackName }: { settings: TenantSettings; fallbackName: string }) {
  const [mode, setMode] = useState<"mobile" | "desktop">("mobile");
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.38);

  useEffect(() => {
    if (mode !== "desktop" || !boxRef.current) return;
    const el = boxRef.current;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / 1100));
    ro.observe(el);
    return () => ro.disconnect();
  }, [mode]);

  const view = (
    <StorefrontView brand={settings.brand} store={settings.store} fallbackName={fallbackName} products={MOCK_PRODUCTS} preview />
  );

  return (
    <aside className="cfg-preview" style={{
      background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 14,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 12 }}>
        <span style={{ fontFamily: UI, fontSize: 9.5, fontWeight: 700, color: "var(--text-3)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
          Prévia ao vivo
        </span>
        <div style={{ display: "flex", gap: 4, background: "var(--surface-2)", borderRadius: 8, padding: 3 }}>
          {([["mobile", Smartphone, "Celular"], ["desktop", Monitor, "Computador"]] as const).map(([m, Icon, label]) => (
            <button key={m} type="button" onClick={() => setMode(m)} aria-label={label} aria-pressed={mode === m} style={{
              width: 30, height: 26, borderRadius: 6, border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: mode === m ? "var(--surface)" : "transparent",
              color: mode === m ? "var(--text-1)" : "var(--text-3)",
              boxShadow: mode === m ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}>
              <Icon size={14} />
            </button>
          ))}
        </div>
      </div>

      {mode === "mobile" ? (
        <div style={{
          width: "100%", maxWidth: 360, height: 620, margin: "0 auto",
          borderRadius: 26, border: "7px solid #16161c", overflowY: "auto", overflowX: "hidden",
          background: "#fff", boxSizing: "border-box",
        }}>
          {view}
        </div>
      ) : (
        <div ref={boxRef} style={{
          width: "100%", aspectRatio: "1100 / 760", overflow: "hidden",
          borderRadius: 10, border: "1px solid var(--border)", position: "relative",
        }}>
          <div style={{
            width: 1100, height: 760, overflowY: "auto",
            transform: `scale(${scale})`, transformOrigin: "0 0",
          }}>
            {view}
          </div>
        </div>
      )}
      <p style={{ fontFamily: UI, fontSize: 11, color: "var(--text-3)", margin: "10px 2px 0", lineHeight: 1.5 }}>
        Produtos de demonstração. A prévia mostra o que ainda não foi salvo.
      </p>
    </aside>
  );
}

/* ═══ Integrações ═════════════════════════════════════════════════ */

function IntegrationsTab({ category, statusOf, onOpen }: {
  category: IntegrationCategory;
  statusOf: (id: string) => IntegrationStatus;
  onOpen: (id: IntegrationId) => void;
}) {
  const items = LIST.filter(i => i.category === category);
  const ready = items.filter(i => statusOf(i.id) === "pronto").length;
  const meta = CATEGORY_META[category];
  const rec = items.find(i => i.recommended);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
        background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px 18px",
      }}>
        <p style={{ flex: 1, minWidth: 240, fontFamily: UI, fontSize: 13, lineHeight: 1.55, color: "var(--text-2)", margin: 0 }}>
          {meta.intro}
        </p>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontFamily: MONO, fontSize: 20, fontWeight: 700, color: "var(--text-1)", margin: 0 }}>
            {ready}<span style={{ color: "var(--text-3)", fontSize: 14 }}>/{items.length}</span>
          </p>
          <p style={{ fontFamily: UI, fontSize: 10.5, color: "var(--text-3)", margin: "2px 0 0" }}>prontos para ativar</p>
        </div>
      </div>

      {rec && statusOf(rec.id) === "pendente" && (
        <button type="button" onClick={() => onOpen(rec.id as IntegrationId)} style={{
          display: "flex", alignItems: "center", gap: 12, textAlign: "left", cursor: "pointer",
          background: "var(--accent-bg)", border: "1px solid var(--border-hi)", borderRadius: 14, padding: "14px 16px",
        }}>
          <Sparkles size={18} color="var(--accent)" style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, fontFamily: UI, fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.5 }}>
            <strong style={{ color: "var(--text-1)" }}>Por onde começar: {rec.name}.</strong> {rec.bestFor}
          </span>
          <span style={{ fontFamily: UI, fontSize: 12, fontWeight: 700, color: "var(--accent)", whiteSpace: "nowrap" }}>Ver manual →</span>
        </button>
      )}

      <div className="cfg-cards">
        {items.map(i => {
          const st = STATUS_META[statusOf(i.id)];
          return (
            <button key={i.id} type="button" onClick={() => onOpen(i.id as IntegrationId)} style={{
              display: "flex", flexDirection: "column", gap: 10, textAlign: "left", cursor: "pointer",
              background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 16,
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
                <ProviderMark integration={i} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: UI, fontSize: 13.5, fontWeight: 700, color: "var(--text-1)", margin: 0 }}>{i.name}</p>
                  {(i.recommended || i.native) && (
                    <span style={{ fontFamily: UI, fontSize: 10, fontWeight: 700, color: "var(--accent)" }}>
                      {i.native ? "Sem integração externa" : "Recomendado para começar"}
                    </span>
                  )}
                </div>
              </div>
              <p style={{ fontFamily: UI, fontSize: 12, lineHeight: 1.5, color: "var(--text-2)", margin: 0 }}>{i.summary}</p>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
                borderTop: "1px solid var(--border)", paddingTop: 10, marginTop: "auto",
              }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 11, fontWeight: 700, color: st.color }}>
                  <st.icon size={12} /> {st.label}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: UI, fontSize: 11, fontWeight: 600, color: "var(--text-3)" }}>
                  <BookOpen size={12} /> Manual
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function IntegrationDrawer({ integration: i, status, onStatus, onClose }: {
  integration: Integration; status: IntegrationStatus;
  onStatus: (s: IntegrationStatus) => void; onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.25)", backdropFilter: "blur(3px)" }} />
      <div role="dialog" aria-label={`Manual ${i.name}`} style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "min(500px, 100vw)", zIndex: 50,
        background: "var(--bg)", borderLeft: "1px solid var(--border)",
        boxShadow: "-8px 0 48px rgba(0,0,0,0.14)", overflowY: "auto", fontFamily: UI,
      }}>
        <div style={{
          background: "linear-gradient(135deg,#0c0420 0%,#190a58 60%,#0b1e66 100%)",
          padding: "24px 24px 20px", position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", width: 160, height: 160, borderRadius: "50%", pointerEvents: "none",
            background: `radial-gradient(circle, ${i.color}45 0%, transparent 70%)`, top: -40, right: 30,
          }} />
          <button onClick={onClose} aria-label="Fechar" style={{
            position: "absolute", top: 16, right: 16, width: 32, height: 32, borderRadius: 8,
            background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <X size={15} color="rgba(255,255,255,0.75)" />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative", paddingRight: 40 }}>
            <ProviderMark integration={i} size={48} />
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "0.14em", textTransform: "uppercase", margin: 0 }}>
                {CATEGORY_META[i.category].label}
              </p>
              <p style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: "3px 0 0" }}>{i.name}</p>
            </div>
          </div>
          <p style={{ position: "relative", fontSize: 13, lineHeight: 1.55, color: "rgba(255,255,255,0.65)", margin: "16px 0 0" }}>
            {i.summary} <span style={{ color: "rgba(255,255,255,0.9)" }}>Indicado para: {i.bestFor.charAt(0).toLowerCase() + i.bestFor.slice(1)}</span>
          </p>
        </div>

        <div style={{ padding: "22px 24px 28px", display: "flex", flexDirection: "column", gap: 22 }}>
          <div>
            <DrawerLabel>Status da sua configuração</DrawerLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {(Object.keys(STATUS_META) as IntegrationStatus[]).map(k => {
                const m = STATUS_META[k];
                const on = status === k;
                return (
                  <button key={k} type="button" onClick={() => onStatus(k)} aria-pressed={on} style={{
                    display: "flex", alignItems: "center", gap: 10, cursor: "pointer", textAlign: "left",
                    padding: "11px 14px", borderRadius: 10, minHeight: 44,
                    background: on ? `${m.color}12` : "var(--surface)",
                    border: `1px solid ${on ? m.color : "var(--border)"}`,
                    color: on ? m.color : "var(--text-2)", fontFamily: UI, fontSize: 13, fontWeight: 600,
                  }}>
                    <m.icon size={15} /> {m.label}
                    {on && <Check size={15} style={{ marginLeft: "auto" }} />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <DrawerLabel>O que você vai precisar</DrawerLabel>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 7 }}>
              {i.needs.map(n => (
                <li key={n} style={{ display: "flex", gap: 9, fontSize: 13, lineHeight: 1.45, color: "var(--text-1)" }}>
                  <CheckCircle2 size={15} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} /> {n}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <DrawerLabel>Passo a passo</DrawerLabel>
            <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {i.steps.map((st, idx) => (
                <li key={idx} style={{ display: "flex", gap: 12, fontSize: 13, lineHeight: 1.5, color: "var(--text-1)" }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                    background: "var(--accent-bg)", color: "var(--accent)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: MONO, fontSize: 10.5, fontWeight: 700,
                  }}>{idx + 1}</span>
                  {st}
                </li>
              ))}
            </ol>
          </div>

          {i.docs && (
            <a href={i.docs} target="_blank" rel="noreferrer" style={{
              display: "flex", alignItems: "center", gap: 8, textDecoration: "none",
              padding: "12px 14px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)",
              fontSize: 13, fontWeight: 600, color: "var(--text-1)",
            }}>
              <BookOpen size={15} color="var(--accent)" /> Documentação oficial do {i.name}
              <ExternalLink size={13} color="var(--text-3)" style={{ marginLeft: "auto" }} />
            </a>
          )}

          {!i.native && (
            <div style={{
              display: "flex", gap: 10, padding: "14px 16px", borderRadius: 12,
              background: "rgba(5,150,105,0.06)", border: "1px solid rgba(5,150,105,0.2)",
            }}>
              <ShieldCheck size={17} color="#059669" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12, lineHeight: 1.55, color: "var(--text-2)", margin: 0 }}>
                <strong style={{ color: "var(--text-1)" }}>Não cole chaves secretas aqui</strong> nem envie por chat ou e-mail.
                Quando marcar como pronto, a equipe GM &amp; Co Tec combina com você um canal seguro para concluir a ativação.
              </p>
            </div>
          )}

          <p style={{ fontSize: 11.5, color: "var(--text-3)", margin: 0 }}>
            Lembre de salvar depois de mudar o status.
          </p>
        </div>
      </div>
    </>
  );
}

function ProviderMark({ integration: i, size = 36 }: { integration: Integration; size?: number }) {
  return (
    <span aria-hidden style={{
      width: size, height: size, borderRadius: size * 0.28, flexShrink: 0,
      background: `${i.color}1f`, border: `1px solid ${i.color}40`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: UI, fontSize: size * 0.38, fontWeight: 800, color: i.color,
    }}>
      {i.name.charAt(0)}
    </span>
  );
}

/* ═══ Peças de formulário ═════════════════════════════════════════ */

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box",
  fontFamily: UI, fontSize: 13, color: "var(--text-1)",
  background: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: 8, padding: "10px 12px", outline: "none",
};

const secondaryBtn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 7,
  fontFamily: UI, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
  color: "var(--text-1)", background: "var(--surface)",
  border: "1px solid var(--border)", borderRadius: 9, padding: "9px 14px", minHeight: 38,
};

const linkBtn: React.CSSProperties = {
  fontFamily: UI, fontSize: 11.5, fontWeight: 700, color: "var(--accent)",
  background: "none", border: "none", padding: 0, cursor: "pointer",
};

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
    }}>
      <h2 style={{ fontFamily: UI, fontSize: 14, fontWeight: 700, color: "var(--text-1)", margin: 0 }}>{title}</h2>
      {hint && <p style={{ fontFamily: UI, fontSize: 12, color: "var(--text-2)", margin: "4px 0 14px", lineHeight: 1.5 }}>{hint}</p>}
      {!hint && <div style={{ height: 14 }} />}
      {children}
    </section>
  );
}

function Label({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p style={{ fontFamily: UI, fontSize: 11, fontWeight: 600, color: "var(--text-2)", margin: "0 0 7px", ...style }}>{children}</p>
  );
}

function DrawerLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: UI, fontSize: 9.5, fontWeight: 700, color: "var(--text-3)",
      letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 10px",
    }}>{children}</p>
  );
}

function Field({ id, label, counter, children, style }: {
  id: string; label: string; counter?: string; children: React.ReactNode; style?: React.CSSProperties;
}) {
  return (
    <div style={style}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <label htmlFor={id} style={{ fontFamily: UI, fontSize: 11, fontWeight: 600, color: "var(--text-2)" }}>{label}</label>
        {counter && <span style={{ fontFamily: MONO, fontSize: 10, color: "var(--text-3)" }}>{counter}</span>}
      </div>
      {children}
    </div>
  );
}

function ColorField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  const [text, setText] = useState(value);
  useEffect(() => { setText(value); }, [value]);

  return (
    <Field id={id} label={label}>
      <div style={{ display: "flex", gap: 8 }}>
        <input type="color" aria-label={`${label} (seletor)`} value={value} onChange={e => onChange(e.target.value)} style={{
          width: 44, height: 40, padding: 3, borderRadius: 8, cursor: "pointer",
          border: "1px solid var(--border)", background: "var(--surface)", flexShrink: 0,
        }} />
        <input id={id} className="cfg-input" value={text} maxLength={7}
          onChange={e => {
            const v = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`;
            setText(v);
            if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v.toLowerCase());
          }}
          onBlur={() => setText(value)}
          style={{ ...inputStyle, fontFamily: MONO, fontSize: 12.5, textTransform: "lowercase" }} />
      </div>
    </Field>
  );
}

function Segmented<T extends string>({ value, onChange, options }: {
  value: T; onChange: (v: T) => void; options: { value: T; label: string }[];
}) {
  return (
    <div style={{ display: "inline-flex", gap: 4, padding: 4, borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--border)" }}>
      {options.map(o => {
        const on = o.value === value;
        return (
          <button key={o.value} type="button" onClick={() => onChange(o.value)} aria-pressed={on} style={{
            fontFamily: UI, fontSize: 12, fontWeight: 600, cursor: "pointer",
            padding: "8px 14px", borderRadius: 7, border: "none", minHeight: 34,
            background: on ? "var(--surface)" : "transparent",
            color: on ? "var(--text-1)" : "var(--text-2)",
            boxShadow: on ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
          }}>{o.label}</button>
        );
      })}
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} style={{
      width: 48, height: 28, borderRadius: 999, border: "none", cursor: "pointer", flexShrink: 0,
      background: checked ? "#059669" : "var(--surface-3)", position: "relative", transition: "background 0.15s",
    }}>
      <span style={{
        position: "absolute", top: 3, left: checked ? 23 : 3, width: 22, height: 22, borderRadius: "50%",
        background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.15s",
      }} />
    </button>
  );
}

function HeroChip({ color, label }: { color: string; label: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontFamily: UI, fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.8)",
      background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)",
      borderRadius: 999, padding: "6px 11px",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color }} /> {label}
    </span>
  );
}
