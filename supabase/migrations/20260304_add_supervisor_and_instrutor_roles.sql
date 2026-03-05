-- ==============================================================
-- MIGRAÇÃO: Suporte aos papéis Supervisor e Instrutor
-- Aplicar no SQL Editor do Supabase
-- ==============================================================

DO $$ BEGIN
    ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'supervisor';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'instrutor';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Atualizar metadados para garantir consistência
COMMENT ON TYPE public.app_role IS 'Papéis de acesso ao sistema AeC';
