import { z } from "zod";
import { INTEGRATION_IDS } from "./integrations";

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida");
const hexLoose = z.string().regex(/^#[0-9a-fA-F]{6}$/);

// Só raster: SVG pode carregar script e a logo é exibida na loja pública.
const LOGO_RE = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/;

export const INTEGRATION_STATUS = ["pendente", "andamento", "pronto"] as const;
export type IntegrationStatus = (typeof INTEGRATION_STATUS)[number];

/** Produto da vitrine. Mora no JSON do tenant — sem tabela própria por enquanto. */
export const productSchema = z.object({
  id:       z.string().min(1).max(40),
  name:     z.string().trim().min(1, "Dê um nome ao produto").max(80),
  category: z.string().trim().max(40).default(""),
  price:    z.number().min(0).max(1_000_000),
  stock:    z.number().int().min(0).max(100_000).default(0),
  sku:      z.string().trim().max(40).default(""),
  description: z.string().trim().max(600).default(""),
  hue:      hexLoose.default("#7c3fed"),
  active:   z.boolean().default(true),
});

export type StoreProduct = z.infer<typeof productSchema>;

export const PRODUCT_HUES = [
  "#ec4899", "#8b5cf6", "#3b82f6", "#06b6d4",
  "#10b981", "#f59e0b", "#d97706", "#64748b",
];

export const settingsSchema = z.object({
  brand: z.object({
    storeName: z.string().trim().max(60).default(""),
    tagline:   z.string().trim().max(120).default(""),
    logo:      z.string().max(400_000).regex(LOGO_RE, "Logo inválida").nullable().default(null),
    primary:   hex.default("#7c3fed"),
    accent:    hex.default("#06b6d4"),
    theme:     z.enum(["light", "dark"]).default("light"),
    font:      z.enum(["moderna", "elegante", "classica"]).default("moderna"),
    radius:    z.enum(["reto", "suave", "redondo"]).default("suave"),
  }).default({}),
  store: z.object({
    published:    z.boolean().default(false),
    announcement: z.string().trim().max(100).default(""),
    about:        z.string().trim().max(600).default(""),
    whatsapp:     z.string().trim().max(20).default(""),
    email:        z.union([z.literal(""), z.string().trim().email("Email inválido").max(120)]).default(""),
    instagram:    z.string().trim().max(40).default(""),
    city:         z.string().trim().max(80).default(""),
    document:     z.string().trim().max(20).default(""),
  }).default({}),
  integrations: z.record(z.enum(INTEGRATION_IDS), z.enum(INTEGRATION_STATUS)).default({}),
  products: z.array(productSchema).max(60).default([]),
});

export type TenantSettings = z.infer<typeof settingsSchema>;
export type BrandSettings = TenantSettings["brand"];
export type StoreSettings = TenantSettings["store"];

export const DEFAULT_SETTINGS: TenantSettings = settingsSchema.parse({});

/** Lê o JSON do banco sem nunca quebrar a tela: o que não validar volta ao padrão. */
export function parseSettings(raw: unknown): TenantSettings {
  const r = settingsSchema.safeParse(raw ?? {});
  return r.success ? r.data : DEFAULT_SETTINGS;
}

const RESERVED_HANDLES = new Set([
  "admin", "api", "app", "demo", "loja", "lojas", "tec", "www", "apresentacao", "login",
]);

export const handleSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/, "Use de 3 a 40 letras minúsculas, números ou hífen")
  .refine(h => !RESERVED_HANDLES.has(h), "Esse endereço é reservado");

export function suggestHandle(name: string) {
  return name
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export const FONT_STACKS: Record<BrandSettings["font"], string> = {
  moderna:  "var(--font-space), var(--font-geist-sans), system-ui, sans-serif",
  elegante: "var(--font-serif), Georgia, 'Times New Roman', serif",
  classica: "var(--font-geist-sans), system-ui, sans-serif",
};

export const RADIUS: Record<BrandSettings["radius"], { card: number; button: number }> = {
  reto:    { card: 2,  button: 2 },
  suave:   { card: 12, button: 10 },
  redondo: { card: 22, button: 999 },
};

/** Texto branco ou quase-preto, o que tiver mais contraste sobre a cor. */
export function readableOn(hexColor: string) {
  const n = parseInt(hexColor.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const L = 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  return L > 0.4 ? "#141414" : "#ffffff";
}

export const PALETTES = [
  { name: "Violeta",        primary: "#7c3fed", accent: "#06b6d4" },
  { name: "Espresso & Ouro", primary: "#1a1310", accent: "#c9a96e" },
  { name: "Rosé",           primary: "#be185d", accent: "#f9a8d4" },
  { name: "Oliva",          primary: "#4d5b2f", accent: "#d9c9a3" },
  { name: "Oceano",         primary: "#0e7490", accent: "#fbbf24" },
  { name: "Grafite",        primary: "#27272a", accent: "#e4e4e7" },
];
