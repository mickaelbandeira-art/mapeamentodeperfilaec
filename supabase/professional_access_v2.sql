-- ==============================================================
-- SISTEMA PROFISSIONAL DE ACESSO AEC (V2)
-- AUTOMATIZAÇÃO DE APROVAÇÃO, CONFIRMAÇÃO E SINCRONIA
-- ==============================================================

-- 1. LIMPEZA PREVENTIVA (Evitar conflitos de cache/assinatura)
DROP FUNCTION IF EXISTS public.search_participants(text, text, text, text, text, text, text);

-- 2. FUNÇÃO DE BUSCA OTIMIZADA (Corrigindo Ambiguidade e Nomes de Parâmetros)
-- Nota: Os nomes dos parâmetros devem bater exatamente com o que o Frontend envia no .rpc()
CREATE OR REPLACE FUNCTION public.search_participants(
  search_text TEXT DEFAULT NULL,
  filter_status TEXT DEFAULT NULL,
  filter_cargo TEXT DEFAULT NULL,
  filter_coordinator TEXT DEFAULT NULL,
  filter_turma TEXT DEFAULT NULL,
  filter_instructor_email TEXT DEFAULT NULL,
  filter_site TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  registration TEXT,
  email TEXT,
  cargo TEXT,
  has_completed_test BOOLEAN,
  dominant_profile TEXT,
  score_d INTEGER,
  score_i INTEGER,
  score_s INTEGER,
  score_c INTEGER,
  site TEXT,
  class_name TEXT,
  instructor_name TEXT,
  mindset_tipo TEXT,
  vac_dominante TEXT,
  insights_consultivos TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_email TEXT;
  v_is_admin BOOLEAN;
  v_is_manager BOOLEAN;
  v_allowed_sites TEXT[];
BEGIN
  -- Identificar usuário logado
  v_user_email := (SELECT u.email FROM auth.users u WHERE u.id = auth.uid());
  v_is_admin := public.is_global_admin();
  v_is_manager := EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'manager');
  v_allowed_sites := public.get_current_user_sites();

  RETURN QUERY
  SELECT
    p.id, 
    p.name, 
    p.registration, 
    p.email, 
    p.cargo,
    (tr.id IS NOT NULL) AS has_completed_test,
    tr.dominant_profile, 
    tr.score_d, 
    tr.score_i, 
    tr.score_s, 
    tr.score_c,
    p.site, 
    COALESCE(tc.name, tr.class_name) AS class_name,
    COALESCE(tc.instructor_name, tr.instructor_name) AS instructor_name,
    tr.mindset_tipo,
    tr.vac_dominante,
    tr.insights_consultivos
  FROM public.participants p
  -- Link via registration for test results
  LEFT JOIN public.test_results tr ON p.registration = tr.registration
  -- Link via instructor email as a fallback since class_id is missing in participants
  LEFT JOIN public.training_classes tc ON (tr.class_name = tc.name OR tr.instructor_name = tc.instructor_name)
  WHERE
    -- A) ISOLAMENTO POR PRAÇA
    (v_is_admin OR p.site = ANY(v_allowed_sites))
    
    -- B) ISOLAMENTO POR INSTRUTOR (Multi-tenant)
    AND (
      v_is_admin 
      OR v_is_manager 
      OR tc.created_by = auth.uid() 
      OR tc.instructor_email = v_user_email
      OR tr.instructor_email = v_user_email
      OR p.email = v_user_email
    )

    -- C) FILTROS DINÂMICOS
    AND (search_text IS NULL OR (
          p.name ILIKE '%' || search_text || '%' OR 
          p.registration ILIKE '%' || search_text || '%' OR
          p.email ILIKE '%' || search_text || '%'
        ))
    AND (filter_status IS NULL OR
         CASE filter_status
           WHEN 'completed' THEN tr.id IS NOT NULL
           WHEN 'pending' THEN tr.id IS NULL
           ELSE true
         END)
    AND (filter_cargo IS NULL OR p.cargo ILIKE filter_cargo)
    AND (filter_turma IS NULL OR COALESCE(tc.name, tr.class_name) ILIKE '%' || filter_turma || '%')
    AND (filter_instructor_email IS NULL OR COALESCE(tc.instructor_email, tr.instructor_email) = filter_instructor_email)
    AND (filter_site IS NULL OR p.site = filter_site)
  ORDER BY p.created_at DESC;
END;
$$;

-- 3. GATILHO DE AUTOMAÇÃO DE APROVAÇÃO (O "CÉREBRO" DO SISTEMA)
CREATE OR REPLACE FUNCTION public.handle_profile_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Só age quando o status muda para 'approved'
  IF (NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved')) THEN
    
    -- A) Ativar Email instantaneamente (Unblock Login)
    UPDATE auth.users 
    SET email_confirmed_at = NOW(),
        updated_at = NOW()
    WHERE id = NEW.id AND email_confirmed_at IS NULL;

    -- B) Sincronizar Cargo na tabela de segurança (Apenas se não for visitor)
    IF (NEW.role IS NOT NULL AND NEW.role != 'visitor' AND NEW.role != '') THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, NEW.role::public.app_role)
      ON CONFLICT (user_id, role) DO NOTHING;
    END IF;

    -- C) Marcar data de aprovação caso não esteja preenchida
    NEW.approved_at = COALESCE(NEW.approved_at, NOW());
    
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar o gatilho na tabela profiles
DROP TRIGGER IF EXISTS tr_on_profile_approval ON public.profiles;
CREATE TRIGGER tr_on_profile_approval
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_profile_approval();

-- 4. SINCRONIZAÇÃO EM MASSA (Corrigir quem já foi aprovado mas está bloqueado)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id, role FROM public.profiles WHERE status = 'approved' LOOP
        -- Confirmar email
        UPDATE auth.users SET email_confirmed_at = NOW() WHERE id = r.id AND email_confirmed_at IS NULL;
        -- Garantir role (Apenas se não for visitor)
        IF (r.role IS NOT NULL AND r.role != 'visitor' AND r.role != '') THEN
            INSERT INTO public.user_roles (user_id, role) 
            VALUES (r.id, r.role::public.app_role) 
            ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;
END $$;

-- 5. NOTIFICAÇÃO DE RELOAD DE CACHE (Forçar PostgREST)
NOTIFY pgrst, 'reload schema';
