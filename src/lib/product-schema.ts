import { z } from "zod";

export type ApiVariant = {
  id: string; size: string; color: string; sku: string; stock: number; position: number;
};
export type ApiImage = {
  id: string; url: string; path: string; position: number;
};
export type ApiProduct = {
  id: string; name: string; category: string; sku: string; description: string;
  priceCents: number; hue: string; imageUrl: string | null; active: boolean; position: number;
  variants: ApiVariant[]; images: ApiImage[];
};

const variantSchema = z.object({
  id: z.string().optional(),
  size:  z.string().trim().max(20).default(""),
  color: z.string().trim().max(30).default(""),
  sku:   z.string().trim().max(40).default(""),
  stock: z.number().int().min(0).max(100_000).default(0),
});

const imageSchema = z.object({
  id:   z.string().optional(),
  url:  z.string().trim().min(1).max(600),
  path: z.string().trim().max(300).default(""),
});

export const productSchema = z.object({
  name:        z.string().trim().min(1, "Dê um nome ao produto").max(80),
  category:    z.string().trim().max(40).default(""),
  sku:         z.string().trim().max(40).default(""),
  description: z.string().trim().max(600).default(""),
  priceCents:  z.number().int().min(0).max(100_000_000),
  hue:         z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#7c3fed"),
  active:      z.boolean().default(true),
  position:    z.number().int().min(0).max(10_000).default(0),
  variants:    z.array(variantSchema).min(1, "Cadastre ao menos uma grade").max(40),
  images:      z.array(imageSchema).max(8, "No máximo 8 fotos por peça").default([]),
});

export const PRODUCT_SELECT = {
  id: true, name: true, category: true, sku: true, description: true,
  priceCents: true, hue: true, imageUrl: true, active: true, position: true,
  variants: {
    select: { id: true, size: true, color: true, sku: true, stock: true, position: true },
    orderBy: { position: "asc" },
  },
  images: {
    select: { id: true, url: true, path: true, position: true },
    orderBy: { position: "asc" },
  },
} as const;
