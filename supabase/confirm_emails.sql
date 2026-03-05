-- ==============================================================
-- CORREÇÃO: CONFIRMAÇÃO DE EMAIL (ERRO: Email not confirmed)
-- RODAR NO SQL EDITOR DO SUPABASE
-- ==============================================================

-- 1. FORÇAR CONFIRMAÇÃO (Unblock)
UPDATE auth.users 
SET 
    email_confirmed_at = NOW(),
    updated_at = NOW(),
    last_sign_in_at = NULL -- Reset session to force fresh login
WHERE email IN (
    'karolayne.asilva@aec.com.br',
    'mickael.bandeira@aec.com.br',
    'test@aec.com.br',
    'test.user@aec.com.br'
);

-- 2. SINCRONIZAR ROLES (Profiles -> User_Roles)
-- Garante que o sistema de permissões veja o cargo correto
INSERT INTO public.user_roles (user_id, role)
SELECT id, role::public.app_role FROM public.profiles 
WHERE email IN (
    'karolayne.asilva@aec.com.br',
    'test@aec.com.br',
    'test.user@aec.com.br'
)
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. GARANTIR STATUS APPROVED
UPDATE public.profiles 
SET status = 'approved' 
WHERE email IN (
    'karolayne.asilva@aec.com.br',
    'test@aec.com.br',
    'test.user@aec.com.br'
);
