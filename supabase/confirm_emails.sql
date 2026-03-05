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

-- 2. GARANTIR STATUS APPROVED NO PROFILE
UPDATE public.profiles 
SET status = 'approved' 
WHERE email = 'karolayne.asilva@aec.com.br';
