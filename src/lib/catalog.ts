export const CHANNELS = {
  shopee: { label: "Shopee",        color: "#EE4D2D" },
  ml:     { label: "Mercado Livre", color: "#c9a800" },
  amazon: { label: "Amazon",        color: "#e08600" },
  magalu: { label: "Magalu",        color: "#0086FF" },
  loja:   { label: "Loja própria",  color: "#7c3fed" },
};
export type ChannelKey = keyof typeof CHANNELS;

export type Variant = { size: string; color: string; stock: number };

/** Catálogo de demonstração — o mesmo para todos os tenants até o cadastro real de produtos. */
export const MOCK_PRODUCTS = [
  {
    id: "1",
    name: "Vestido Floral Verão",
    sku: "VFV-001",
    category: "Vestidos",
    cost: 48.00, price: 189.90,
    active: true,
    hue: "#ec4899",
    description: "Vestido midi em viscose com estampa floral exclusiva. Alças ajustáveis e forro interno.",
    channels: ["shopee", "ml", "loja"] as ChannelKey[],
    variants: [
      { size: "PP", color: "Rosa", stock: 12 },
      { size: "P",  color: "Rosa", stock: 8  },
      { size: "M",  color: "Rosa", stock: 15 },
      { size: "G",  color: "Rosa", stock: 10 },
      { size: "P",  color: "Azul", stock: 0  },
      { size: "M",  color: "Azul", stock: 5  },
    ] as Variant[],
  },
  {
    id: "2",
    name: "Blusa Básica Algodão",
    sku: "BBA-002",
    category: "Blusas",
    cost: 22.00, price: 79.90,
    active: true,
    hue: "#06b6d4",
    description: "Blusa básica 100% algodão penteado. Modelagem reta, gola redonda.",
    channels: ["shopee", "loja"] as ChannelKey[],
    variants: [
      { size: "P", color: "Branco", stock: 6 },
      { size: "M", color: "Branco", stock: 3 },
      { size: "M", color: "Preto",  stock: 4 },
      { size: "G", color: "Preto",  stock: 0 },
    ] as Variant[],
  },
  {
    id: "3",
    name: "Calça Jeans Skinny",
    sku: "CJS-003",
    category: "Calças",
    cost: 65.00, price: 199.90,
    active: false,
    hue: "#3b82f6",
    description: "Calça jeans skinny com elastano. Cintura alta e lavagem média.",
    channels: ["loja"] as ChannelKey[],
    variants: [
      { size: "36", color: "Azul", stock: 15 },
      { size: "38", color: "Azul", stock: 9  },
      { size: "40", color: "Azul", stock: 0  },
    ] as Variant[],
  },
  {
    id: "4",
    name: "Saia Midi Plissada",
    sku: "SMP-004",
    category: "Saias",
    cost: 38.00, price: 129.90,
    active: true,
    hue: "#10b981",
    description: "Saia midi plissada em tecido acetinado. Cós elástico confortável.",
    channels: ["shopee", "ml", "amazon", "loja"] as ChannelKey[],
    variants: [
      { size: "Único", color: "Verde", stock: 4  },
      { size: "Único", color: "Preto", stock: 11 },
    ] as Variant[],
  },
  {
    id: "5",
    name: "Camisa Linho Manga Longa",
    sku: "CLM-005",
    category: "Camisas",
    cost: 54.00, price: 179.90,
    active: true,
    hue: "#d97706",
    description: "Camisa em linho misto, manga longa com punho abotoado. Caimento solto.",
    channels: ["amazon", "ml", "loja"] as ChannelKey[],
    variants: [
      { size: "P", color: "Bege", stock: 8  },
      { size: "M", color: "Bege", stock: 22 },
      { size: "G", color: "Bege", stock: 6  },
    ] as Variant[],
  },
  {
    id: "6",
    name: "Cropped Canelado",
    sku: "CRC-006",
    category: "Blusas",
    cost: 18.00, price: 69.90,
    active: true,
    hue: "#8b5cf6",
    description: "Cropped canelado com alça média. Tecido com boa elasticidade.",
    channels: ["shopee", "loja"] as ChannelKey[],
    variants: [
      { size: "P", color: "Preto",  stock: 2 },
      { size: "M", color: "Preto",  stock: 7 },
      { size: "P", color: "Branco", stock: 9 },
    ] as Variant[],
  },
  {
    id: "7",
    name: "Short Alfaiataria",
    sku: "SHA-007",
    category: "Shorts",
    cost: 41.00, price: 139.90,
    active: true,
    hue: "#f59e0b",
    description: "Short de alfaiataria com pregas frontais e bolso faca. Forro parcial.",
    channels: ["shopee", "magalu", "loja"] as ChannelKey[],
    variants: [
      { size: "36", color: "Caqui", stock: 0 },
      { size: "38", color: "Caqui", stock: 0 },
      { size: "40", color: "Caqui", stock: 3 },
    ] as Variant[],
  },
  {
    id: "8",
    name: "Conjunto Tricot",
    sku: "CTR-008",
    category: "Conjuntos",
    cost: 72.00, price: 249.90,
    active: true,
    hue: "#64748b",
    description: "Conjunto de tricot leve — blusa e calça pantalona. Peça de maior valor agregado.",
    channels: ["ml", "amazon", "loja"] as ChannelKey[],
    variants: [
      { size: "P", color: "Off-white", stock: 5 },
      { size: "M", color: "Off-white", stock: 9 },
      { size: "G", color: "Off-white", stock: 4 },
    ] as Variant[],
  },
];

export type Product = typeof MOCK_PRODUCTS[0];

export const totalStock = (p: Product) => p.variants.reduce((a, v) => a + v.stock, 0);
export const margin     = (p: Product) => Math.round((1 - p.cost / p.price) * 100);
