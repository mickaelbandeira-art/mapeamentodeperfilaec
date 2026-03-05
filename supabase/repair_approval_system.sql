-- ==============================================================
-- REPAIR_APPROVAL_SYSTEM: Sincronização e Correção de Permissões
-- Aplicar no SQL Editor do Supabase (supabase.com/dashboard)
-- ==============================================================

-- 1. Garantir que os papéis (Enums) estão corretos
DO $$ BEGIN
    ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'supervisor';
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'instrutor';
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. Garantir que a estrutura da tabela profiles está completa
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS site text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS matricula text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cargo text;

-- 3. Atualizar a lógica do Gatilho (Trigger) para ser mais robusta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    email, 
    matricula, 
    cargo,
    site, 
    role, 
    status
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'matricula',
    new.raw_user_meta_data->>'cargo',
    new.raw_user_meta_data->>'site',
    COALESCE(new.raw_user_meta_data->>'role', 'visitor'),
    COALESCE(new.raw_user_meta_data->>'status', 'pending')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    matricula = EXCLUDED.matricula,
    cargo = EXCLUDED.cargo,
    site = EXCLUDED.site,
    role = EXCLUDED.role,
    status = EXCLUDED.status; -- Crucial: atualiza status para 'pending' se tentar registrar novamente
  
  -- Sincroniza tb em user_roles
  IF new.raw_user_meta_data->>'role' IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, (LOWER(new.raw_user_meta_data->>'role'))::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN new;
END;
$$;

-- 4. FORÇAR ACESSO ADMIN PARA OS RESPONSÁVEIS
-- Isso corrige o problema de "Fila Vazia" se o seu RLS estiver bloqueando a visualização.
DO $$ 
DECLARE
    target_email TEXT;
    admin_emails TEXT[] := ARRAY[
        'mickael.bandeira@aec.com.br',
        'jonathan.silva@aec.com.br',
        'kelciane.lima@aec.com.br'
    ];
BEGIN
    FOREACH target_email IN ARRAY admin_emails
    LOOP
        -- Atualiza no Profile
        UPDATE public.profiles 
        SET role = 'admin', status = 'approved' 
        WHERE LOWER(email) = LOWER(target_email);
        
        -- Garante entrada no user_roles (o que o RLS realmente usa)
        INSERT INTO public.user_roles (user_id, role)
        SELECT id, 'admin' 
        FROM auth.users 
        WHERE LOWER(email) = LOWER(target_email)
        ON CONFLICT DO NOTHING;
    END LOOP;
END $$;

-- 5. Sincronizar usuários que podem estar no Auth mas não no Profile
INSERT INTO public.profiles (id, full_name, email, status, role)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)), 
  email,
  'pending',
  'visitor'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- Notificar recarregamento
NOTIFY pgrst, 'reload config';
