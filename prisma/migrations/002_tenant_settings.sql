-- Configurações por tenant: endereço público da loja e um JSON com identidade
-- visual, dados da loja e status das integrações. Aditivo e idempotente.

BEGIN;

ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS handle TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS settings JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Único, mas várias linhas sem endereço (NULL) continuam permitidas.
CREATE UNIQUE INDEX IF NOT EXISTS tenants_handle_key ON public.tenants (handle);

COMMIT;
