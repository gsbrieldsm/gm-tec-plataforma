-- Multi-tenant V1: uma conta = um tenant, identificado pelo email.
-- Aditivo e idempotente: cria public.tenants, adiciona public.users."tenantId"
-- e faz backfill de um tenant para cada usuário que já existe.
-- O schema é qualificado de propósito: o Supabase mantém uma auth.users separada.

BEGIN;

CREATE TABLE IF NOT EXISTS public.tenants (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS tenants_slug_key ON public.tenants (slug);

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "tenantId" TEXT;

-- Um tenant por usuário existente, com o email como slug.
INSERT INTO public.tenants (id, name, slug)
SELECT
  'tn_' || u.id,
  COALESCE(NULLIF(u.name, ''), split_part(u.email, '@', 1)),
  u.email
FROM public.users u
WHERE u."tenantId" IS NULL
ON CONFLICT (slug) DO NOTHING;

UPDATE public.users u
SET "tenantId" = t.id
FROM public.tenants t
WHERE u."tenantId" IS NULL
  AND t.slug = u.email;

ALTER TABLE public.users ALTER COLUMN "tenantId" SET NOT NULL;

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS "users_tenantId_fkey";
ALTER TABLE public.users ADD CONSTRAINT "users_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES public.tenants (id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS "users_tenantId_idx" ON public.users ("tenantId");

COMMIT;
