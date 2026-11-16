-- Catálogo, vendas e estoque em tabelas de verdade.
-- Dinheiro em centavos (Int). Aditivo: só cria tabelas novas e move para elas
-- os produtos que hoje vivem no JSON de configurações.

BEGIN;

CREATE TABLE IF NOT EXISTS public.products (
  id          TEXT PRIMARY KEY,
  "tenantId"  TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT '',
  sku         TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  "priceCents" INTEGER NOT NULL,
  "costCents"  INTEGER NOT NULL DEFAULT 0,
  hue         TEXT NOT NULL DEFAULT '#7c3fed',
  "imageUrl"  TEXT,
  active      BOOLEAN NOT NULL DEFAULT true,
  position    INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "products_tenantId_idx" ON public.products("tenantId");

CREATE TABLE IF NOT EXISTS public.product_variants (
  id          TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size        TEXT NOT NULL DEFAULT '',
  color       TEXT NOT NULL DEFAULT '',
  sku         TEXT NOT NULL DEFAULT '',
  stock       INTEGER NOT NULL DEFAULT 0,
  position    INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "product_variants_productId_idx" ON public.product_variants("productId");

CREATE TABLE IF NOT EXISTS public.customers (
  id          TEXT PRIMARY KEY,
  "tenantId"  TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL DEFAULT '',
  email       TEXT NOT NULL DEFAULT '',
  city        TEXT NOT NULL DEFAULT '',
  notes       TEXT NOT NULL DEFAULT '',
  tags        TEXT[] NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "customers_tenantId_idx" ON public.customers("tenantId");

CREATE TABLE IF NOT EXISTS public.orders (
  id           TEXT PRIMARY KEY,
  "tenantId"   TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  number       INTEGER NOT NULL,
  "customerId" TEXT REFERENCES public.customers(id) ON DELETE SET NULL,
  channel      TEXT NOT NULL DEFAULT 'whatsapp',
  status       TEXT NOT NULL DEFAULT 'novo',
  "totalCents" INTEGER NOT NULL DEFAULT 0,
  notes        TEXT NOT NULL DEFAULT '',
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "orders_tenantId_number_key" ON public.orders("tenantId", number);
CREATE INDEX IF NOT EXISTS "orders_tenantId_createdAt_idx" ON public.orders("tenantId", "createdAt");

CREATE TABLE IF NOT EXISTS public.order_items (
  id           TEXT PRIMARY KEY,
  "orderId"    TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  "variantId"  TEXT REFERENCES public.product_variants(id) ON DELETE SET NULL,
  name         TEXT NOT NULL,
  size         TEXT NOT NULL DEFAULT '',
  qty          INTEGER NOT NULL DEFAULT 1,
  "priceCents" INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS "order_items_orderId_idx" ON public.order_items("orderId");

CREATE TABLE IF NOT EXISTS public.stock_movements (
  id          TEXT PRIMARY KEY,
  "tenantId"  TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  "variantId" TEXT REFERENCES public.product_variants(id) ON DELETE SET NULL,
  type        TEXT NOT NULL,
  qty         INTEGER NOT NULL,
  reason      TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "stock_movements_tenantId_createdAt_idx"
  ON public.stock_movements("tenantId", "createdAt");

-- ── Move o catálogo que está no JSON para as tabelas ────────────────
-- Só roda para tenants que ainda não têm produto, então repetir é seguro.
INSERT INTO public.products (id, "tenantId", name, category, sku, description,
                             "priceCents", hue, active, position)
SELECT
  'mig_' || t.id || '_' || (p.ord - 1),
  t.id,
  COALESCE(NULLIF(p.item->>'name', ''), 'Produto sem nome'),
  COALESCE(p.item->>'category', ''),
  COALESCE(p.item->>'sku', ''),
  COALESCE(p.item->>'description', ''),
  ROUND(COALESCE((p.item->>'price')::numeric, 0) * 100)::int,
  COALESCE(p.item->>'hue', '#7c3fed'),
  COALESCE((p.item->>'active')::boolean, true),
  (p.ord - 1)
FROM public.tenants t
CROSS JOIN LATERAL jsonb_array_elements(
  CASE WHEN jsonb_typeof(t.settings->'products') = 'array'
       THEN t.settings->'products' ELSE '[]'::jsonb END
) WITH ORDINALITY AS p(item, ord)
WHERE NOT EXISTS (SELECT 1 FROM public.products x WHERE x."tenantId" = t.id)
ON CONFLICT (id) DO NOTHING;

-- Uma variação única por produto migrado, carregando o estoque que havia.
INSERT INTO public.product_variants (id, "productId", size, color, sku, stock, position)
SELECT
  'migv_' || t.id || '_' || (p.ord - 1),
  'mig_' || t.id || '_' || (p.ord - 1),
  '', '',
  COALESCE(p.item->>'sku', ''),
  COALESCE((p.item->>'stock')::int, 0),
  0
FROM public.tenants t
CROSS JOIN LATERAL jsonb_array_elements(
  CASE WHEN jsonb_typeof(t.settings->'products') = 'array'
       THEN t.settings->'products' ELSE '[]'::jsonb END
) WITH ORDINALITY AS p(item, ord)
WHERE EXISTS (SELECT 1 FROM public.products x WHERE x.id = 'mig_' || t.id || '_' || (p.ord - 1))
ON CONFLICT (id) DO NOTHING;

COMMIT;
