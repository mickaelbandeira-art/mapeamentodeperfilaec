-- ==============================================================
-- NOVO RPC: get_dashboard_stats
-- Isola as estatísticas do dashboard (Cards de Total, Concluídos, etc)
-- ==============================================================

CREATE OR REPLACE FUNCTION public.get_dashboard_stats(
  p_site TEXT DEFAULT NULL
)
RETURNS TABLE (
  total_participants BIGINT,
  total_completed_tests BIGINT,
  pending_tests BIGINT,
  completion_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_email TEXT;
  v_user_name TEXT;
  v_is_admin BOOLEAN;
  v_is_manager BOOLEAN;
  v_allowed_sites TEXT[];
BEGIN
  -- 1. Identificar usuário logado com prefixos para evitar ambiguidade
  SELECT prof.email, prof.full_name 
  INTO v_user_email, v_user_name 
  FROM public.profiles prof 
  WHERE prof.id = auth.uid();

  v_is_admin := public.is_global_admin();
  v_is_manager := EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'manager');
  v_allowed_sites := public.get_current_user_sites();

  RETURN QUERY
  WITH filtered_participants AS (
    SELECT 
      p.id,
      (tr.id IS NOT NULL) as has_completed
    FROM public.participants p
    LEFT JOIN public.test_results tr ON p.registration = tr.registration
    LEFT JOIN public.training_classes tc ON tr.class_name = tc.name
    WHERE
      -- A) ISOLAMENTO POR PRAÇA
      (v_is_admin OR p.site = ANY(v_allowed_sites))
      
      -- B) ISOLAMENTO POR INSTRUTOR/COORDENADOR (Mesma lógica do search_participants)
      AND (
        v_is_admin 
        OR v_is_manager 
        OR tc.created_by = auth.uid() 
        OR tr.instructor_email = v_user_email
        OR p.coordinator = v_user_name
        OR p.email = v_user_email
      )
      -- C) FILTRO POR SITE ESPECÍFICO (Se passado)
      AND (p_site IS NULL OR p.site = p_site)
  )
  SELECT 
    COUNT(*)::BIGINT as total_participants,
    COUNT(*) FILTER (WHERE has_completed)::BIGINT as total_completed_tests,
    COUNT(*) FILTER (WHERE NOT has_completed)::BIGINT as pending_tests,
    CASE 
      WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE has_completed)::NUMERIC / COUNT(*)::NUMERIC) * 100
      ELSE 0 
    END as completion_rate
  FROM filtered_participants;
END;
$$;
