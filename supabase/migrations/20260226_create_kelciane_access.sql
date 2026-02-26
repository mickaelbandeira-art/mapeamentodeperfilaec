-- ==============================================================
-- PASSO 2: Criar conta e permissões para Kelciane Lima
-- Executar DEPOIS de aplicar 20260226_multi_site_access.sql
-- e DEPOIS de criar a conta via Supabase Dashboard → Auth → Users
-- ==============================================================

-- INSTRUÇÕES:
-- 1. Vá em: https://supabase.com/dashboard/project/jxlvqsoudlcsbbntmtsr/auth/users
-- 2. Clique em "Add User" → "Create New User"
-- 3. Email: kelciane.lima@aec.com.br
-- 4. Password: 227625
-- 5. Marque "Auto Confirm User" (para não precisar de verificação de e-mail)
-- 6. Clique em "Create User"
-- 7. Copie o UUID do usuário criado
-- 8. Substitua 'COLE_O_UUID_AQUI' abaixo pelo UUID copiado
-- 9. Execute este script

DO $$
DECLARE
  kelciane_id UUID;
BEGIN
  -- Busca o ID pelo e-mail (funciona após criar o usuário no painel)
  SELECT id INTO kelciane_id
  FROM auth.users
  WHERE email = 'kelciane.lima@aec.com.br';

  IF kelciane_id IS NULL THEN
    RAISE EXCEPTION 'Usuário kelciane.lima@aec.com.br não encontrado. Crie a conta primeiro no painel do Supabase.';
  END IF;

  -- Cria / atualiza o perfil
  INSERT INTO public.profiles (id, full_name, email, site, status)
  VALUES (
    kelciane_id,
    'Kelciane Lima',
    'kelciane.lima@aec.com.br',
    'ARP1',        -- Praça principal
    'approved'     -- Acesso já aprovado
  )
  ON CONFLICT (id) DO UPDATE
    SET full_name = 'Kelciane Lima',
        site      = 'ARP1',
        status    = 'approved';

  -- Define a role como manager (gerente de praça)
  DELETE FROM public.user_roles WHERE user_id = kelciane_id;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (kelciane_id, 'manager');

  -- Concede acesso às praças ARP1 e ARP3
  INSERT INTO public.user_allowed_sites (user_id, site)
  VALUES
    (kelciane_id, 'ARP1'),
    (kelciane_id, 'ARP3')
  ON CONFLICT (user_id, site) DO NOTHING;

  RAISE NOTICE '✅ Acesso configurado com sucesso para kelciane.lima@aec.com.br';
  RAISE NOTICE '   Praças liberadas: ARP1, ARP3';
  RAISE NOTICE '   Role: manager';
  RAISE NOTICE '   Status: approved';
END;
$$;
