-- Papel de operador da plataforma e suspensão de loja.
-- ALTER TYPE ... ADD VALUE não pode rodar dentro de transação, então aqui
-- não há BEGIN/COMMIT — cada comando é idempotente por conta própria.

ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPERADMIN';

ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS suspended BOOLEAN NOT NULL DEFAULT false;
