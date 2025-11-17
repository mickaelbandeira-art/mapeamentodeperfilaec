-- =====================================================
-- SEED DATA - Sistema DISC AeC
-- =====================================================
-- Este arquivo contém dados iniciais para popular ambientes
-- de desenvolvimento, staging ou novos projetos.
--
-- USO:
-- psql -h db.SEU_PROJETO.supabase.co -U postgres -d postgres -f seed.sql
--
-- IMPORTANTE:
-- - NÃO executar em produção (dados de teste)
-- - Usar apenas em ambientes de dev/staging
-- - Todos os inserts usam ON CONFLICT para evitar duplicatas
-- =====================================================

-- =====================================================
-- 1. ROLES ADMINISTRATIVOS
-- =====================================================
-- Criar role de admin para o email autorizado
-- (apenas se o usuário já existir no auth.users)

DO $$
BEGIN
  -- Verificar se existe um usuário admin autorizado e criar role
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'mickael.bandeira@aec.com.br') THEN
    INSERT INTO public.user_roles (user_id, role)
    SELECT id, 'admin'::app_role
    FROM auth.users
    WHERE email = 'mickael.bandeira@aec.com.br'
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Role admin criada para mickael.bandeira@aec.com.br';
  ELSE
    RAISE NOTICE 'Usuário mickael.bandeira@aec.com.br não encontrado - role não criada';
  END IF;
END $$;

-- =====================================================
-- 2. PARTICIPANTES DE EXEMPLO (5 amostras)
-- =====================================================
-- Inserir participantes fictícios para testes

INSERT INTO public.participants 
  (registration, name, email, network_login, cargo, supervisor, coordinator, manager, hierarchy_level, is_active)
VALUES
  -- Colaboradores
  ('DEV001', 'Exemplo Colaborador Alpha', 'exemplo.alpha@test.com', 'exemplo.alpha', 'INSTRUTOR DE TREINAMENTO', 'Supervisor Teste', 'Coordenador Teste', 'Jonathan Lins da Silva', 'colaborador', true),
  ('DEV002', 'Exemplo Colaborador Beta', 'exemplo.beta@test.com', 'exemplo.beta', 'ANALISTA DE CONTEUDO JUNIOR', 'Supervisor Teste', 'Coordenador Teste', 'Jonathan Lins da Silva', 'colaborador', true),
  
  -- Supervisor
  ('DEV003', 'Exemplo Supervisor Gamma', 'exemplo.gamma@test.com', 'exemplo.gamma', 'SUPERVISOR DE PESSOAS JUNIOR', NULL, 'Coordenador Teste', 'Jonathan Lins da Silva', 'supervisor', true),
  
  -- Coordenador
  ('DEV004', 'Exemplo Coordenador Delta', 'exemplo.delta@test.com', 'exemplo.delta', 'COORDENADOR DE PESSOAS I', NULL, 'Coordenador Teste', 'Jonathan Lins da Silva', 'coordenador', true),
  
  -- Gerente
  ('DEV005', 'Exemplo Gerente Epsilon', 'exemplo.epsilon@test.com', 'exemplo.epsilon', 'GERENTE DE PESSOAS III', NULL, 'JONATHAN LINS DA SILVA', 'Jonathan Lins da Silva', 'gerente', true)
ON CONFLICT (registration) DO UPDATE
SET 
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  network_login = EXCLUDED.network_login,
  cargo = EXCLUDED.cargo,
  updated_at = now();

-- =====================================================
-- 3. RESULTADOS DE TESTE DE EXEMPLO (3 completados)
-- =====================================================
-- Inserir resultados fictícios de testes DISC

INSERT INTO public.test_results
  (registration, name, email, score_d, score_i, score_s, score_c, dominant_profile, completed_at)
VALUES
  -- Perfil I (Influência) - DEV001
  ('DEV001', 'Exemplo Colaborador Alpha', 'exemplo.alpha@test.com', 8, 15, 5, 2, 'I', NOW() - INTERVAL '5 days'),
  
  -- Perfil S (Estabilidade) - DEV002
  ('DEV002', 'Exemplo Colaborador Beta', 'exemplo.beta@test.com', 5, 7, 13, 5, 'S', NOW() - INTERVAL '4 days'),
  
  -- Perfil D (Dominância) - DEV003
  ('DEV003', 'Exemplo Supervisor Gamma', 'exemplo.gamma@test.com', 16, 6, 4, 4, 'D', NOW() - INTERVAL '3 days')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. PARTICIPANTES PENDENTES (para testes de dashboard)
-- =====================================================
-- DEV004 e DEV005 não têm resultados de teste propositalmente
-- para simular testes pendentes no dashboard

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Mostrar estatísticas após seed
DO $$
DECLARE
  total_parts INTEGER;
  total_results INTEGER;
  pending_tests INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_parts FROM public.participants WHERE registration LIKE 'DEV%';
  SELECT COUNT(*) INTO total_results FROM public.test_results WHERE registration LIKE 'DEV%';
  pending_tests := total_parts - total_results;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SEED DATA APLICADO COM SUCESSO!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Participantes criados: %', total_parts;
  RAISE NOTICE 'Testes completados: %', total_results;
  RAISE NOTICE 'Testes pendentes: %', pending_tests;
  RAISE NOTICE '';
  RAISE NOTICE '📊 Distribuição de perfis DISC:';
  RAISE NOTICE '   - D (Dominância): 1';
  RAISE NOTICE '   - I (Influência): 1';
  RAISE NOTICE '   - S (Estabilidade): 1';
  RAISE NOTICE '   - C (Conformidade): 0';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Role admin configurada para:';
  RAISE NOTICE '   mickael.bandeira@aec.com.br';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Próximos passos:';
  RAISE NOTICE '   1. Testar login com usuário admin';
  RAISE NOTICE '   2. Verificar dashboard com dados de teste';
  RAISE NOTICE '   3. Testar auto-completar com matrícula DEV001-DEV005';
  RAISE NOTICE '   4. Completar teste para DEV004 ou DEV005 no frontend';
  RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- LIMPEZA (caso queira remover dados de seed)
-- =====================================================
-- Para remover todos os dados de desenvolvimento criados por este seed:
-- 
-- DELETE FROM public.test_results WHERE registration LIKE 'DEV%';
-- DELETE FROM public.participants WHERE registration LIKE 'DEV%';
-- 
-- Para remover role de teste:
-- DELETE FROM public.user_roles WHERE user_id IN (
--   SELECT id FROM auth.users WHERE email LIKE '%@test.com'
-- );
-- =====================================================
