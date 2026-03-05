-- 1. DROPPAR PARA PERMITIR MUDANÇA DE NOMES DE PARÂMETROS E EVITAR ERRO 42P13
DROP FUNCTION IF EXISTS public.search_participants(text, text, text, text, text, text, text);

-- 2. RE-CRIAR FUNÇÃO COM PREFIXO EXPLÍCITO E VARIAVEIS UNICAS
CREATE OR REPLACE FUNCTION public.search_participants(
  p_search_text TEXT DEFAULT NULL,
  p_filter_status TEXT DEFAULT NULL,
  p_filter_cargo TEXT DEFAULT NULL,
  p_filter_coordinator TEXT DEFAULT NULL,
  p_filter_turma TEXT DEFAULT NULL,
  p_filter_instructor_email TEXT DEFAULT NULL,
  p_filter_site TEXT DEFAULT NULL
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
  -- 1. Identificar usuário logado com segurança
  SELECT u.email INTO v_user_email FROM auth.users u WHERE u.id = auth.uid();
  v_is_admin := public.is_global_admin();
  v_is_manager := EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'manager');
  v_allowed_sites := public.get_current_user_sites();

  RETURN QUERY
  SELECT
    par.id, 
    par.name, 
    par.registration, 
    par.email, 
    par.cargo,
    (res.id IS NOT NULL) AS has_completed_test,
    res.dominant_profile, 
    res.score_d, 
    res.score_i, 
    res.score_s, 
    res.score_c,
    par.site, 
    cls.name AS class_name,
    cls.instructor_name,
    res.mindset_tipo,
    res.vac_dominante,
    res.insights_consultivos
  FROM public.participants par
  LEFT JOIN public.training_classes cls ON par.class_id = cls.id
  LEFT JOIN public.test_results res ON par.registration = res.registration
  WHERE
    -- A) ISOLAMENTO POR PRAÇA
    (v_is_admin OR par.site = ANY(v_allowed_sites))
    
    -- B) ISOLAMENTO POR INSTRUTOR/CRIADOR (Multi-tenant)
    AND (
      v_is_admin 
      OR v_is_manager 
      OR cls.created_by = auth.uid() 
      OR cls.instructor_email = v_user_email
      OR par.email = v_user_email -- Próprio perfil se for o caso
      OR par.coordinator = (SELECT prof.full_name FROM public.profiles prof WHERE prof.id = auth.uid())
    )

    -- C) FILTROS DINÂMICOS (Com prefixos para evitar ambiguidade)
    AND (p_search_text IS NULL OR (
          par.name ILIKE '%' || p_search_text || '%' OR 
          par.registration ILIKE '%' || p_search_text || '%' OR
          par.email ILIKE '%' || p_search_text || '%'
        ))
    AND (p_filter_status IS NULL OR
         CASE p_filter_status
           WHEN 'completed' THEN res.id IS NOT NULL
           WHEN 'pending' THEN res.id IS NULL
           ELSE true
         END)
    AND (p_filter_cargo IS NULL OR par.cargo ILIKE p_filter_cargo)
    AND (p_filter_turma IS NULL OR cls.name ILIKE '%' || p_filter_turma || '%')
    AND (p_filter_instructor_email IS NULL OR cls.instructor_email = p_filter_instructor_email)
  ORDER BY par.created_at DESC;
END;
$$;
