-- ==============================================================
-- DIAGNÓSTICO E CORREÇÃO FINAL: FILA DE APROVAÇÃO (V4 - NUCLEAR)
-- ==============================================================

-- 1. SINCRONIZAÇÃO TOTAL (Mickael)
DO $$ 
DECLARE
    target_id UUID;
BEGIN
    SELECT id INTO target_id FROM auth.users WHERE email = 'mickael.bandeira@aec.com.br';
    IF target_id IS NOT NULL THEN
        -- Perfil
        UPDATE public.profiles SET role = 'admin', status = 'approved' WHERE id = target_id;
        -- Seguranca
        INSERT INTO public.user_roles (user_id, role) VALUES (target_id, 'admin') ON CONFLICT DO NOTHING;
        RAISE NOTICE 'Admin Mickael sincronizado com ID: %', target_id;
    END IF;
END $$;

-- 2. FUNÇÃO DE VERIFICAÇÃO ROBUSTA (SECURITY DEFINER)
-- Esta função ignora RLS interno, permitindo checar o perfil sem recursão.
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  is_admin_ur BOOLEAN;
  is_admin_pr BOOLEAN;
BEGIN
  -- Checa na tabela de permissões
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ) INTO is_admin_ur;
  
  IF is_admin_ur THEN RETURN TRUE; END IF;

  -- Checa na tabela de perfis (Bypassing RLS because of SECURITY DEFINER)
  SELECT (role = 'admin') INTO is_admin_pr FROM public.profiles WHERE id = auth.uid();
  
  RETURN COALESCE(is_admin_pr, FALSE);
END;
$$;

-- 3. REINICIAR POLÍTICAS DO PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Qualquer usuário logado pode ver o próprio perfil
CREATE POLICY "profiles_select_own" ON public.profiles 
FOR SELECT USING (auth.uid() = id);

-- Admins (validados pela função robusta) podem ver e fazer TUDO
CREATE POLICY "profiles_admin_all" ON public.profiles 
FOR ALL USING (public.check_is_admin());

-- 4. VERIFICAÇÃO DE DADOS (Verifique se as 3 linhas da Karolayne aparecem aqui)
SELECT 'MINHAS_PERMISSÕES' as info, public.check_is_admin() as sou_admin;
SELECT 'FILA_PENDENTE' as info, email, role, status FROM public.profiles WHERE status = 'pending';
