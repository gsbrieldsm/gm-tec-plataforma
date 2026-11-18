-- Galeria de fotos por peça e área de lojista (atacado).
-- Só cria tabelas novas e copia a foto única que já existia. Nada é apagado.

BEGIN;

-- ---------------------------------------------------------------- fotos
CREATE TABLE IF NOT EXISTS public.product_images (
  id          TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  -- caminho dentro do bucket: guardado pra conseguir apagar o arquivo depois
  path        TEXT NOT NULL DEFAULT '',
  position    INT  NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS product_images_product_idx ON public.product_images("productId");

-- A foto que já estava em products.imageUrl vira a primeira da galeria.
-- products.imageUrl continua existindo como capa, preenchida pela aplicação.
INSERT INTO public.product_images (id, "productId", url, position)
SELECT 'img_' || p.id, p.id, p."imageUrl", 0
FROM public.products p
WHERE p."imageUrl" IS NOT NULL
  AND p."imageUrl" <> ''
  AND NOT EXISTS (SELECT 1 FROM public.product_images i WHERE i."productId" = p.id);

-- ------------------------------------------------------------- lojistas
CREATE TABLE IF NOT EXISTS public.resellers (
  id            TEXT PRIMARY KEY,
  "tenantId"    TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT NOT NULL DEFAULT '',
  company       TEXT NOT NULL DEFAULT '',
  document      TEXT NOT NULL DEFAULT '',
  city          TEXT NOT NULL DEFAULT '',
  password      TEXT NOT NULL,
  -- pendente: cadastrou e espera aprovação | ativo: vê atacado | inativo: barrado
  status        TEXT NOT NULL DEFAULT 'pendente',
  "discountPct" INT  NOT NULL DEFAULT 0,
  notes         TEXT NOT NULL DEFAULT '',
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- Mesmo email pode ser lojista de duas lojas diferentes; não da mesma duas vezes.
CREATE UNIQUE INDEX IF NOT EXISTS resellers_tenant_email_key ON public.resellers("tenantId", lower(email));
CREATE INDEX IF NOT EXISTS resellers_tenant_idx ON public.resellers("tenantId");

ALTER TABLE public.resellers
  ADD CONSTRAINT resellers_status_check CHECK (status IN ('pendente','ativo','inativo'));
ALTER TABLE public.resellers
  ADD CONSTRAINT resellers_discount_check CHECK ("discountPct" BETWEEN 0 AND 90);

COMMIT;
