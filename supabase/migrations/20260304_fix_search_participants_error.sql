-- ==============================================================
-- CORREÇÃO: Função search_participants (Erro class_id)
-- Aplicar no SQL Editor do Supabase
-- ==============================================================

DROP FUNCTION IF EXISTS public.search_participants(text, text, text, text, text, text, text);

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
  effective_sites TEXT[];
BEGIN
  -- Determina as praças que o usuário pode ver
  IF public.is_global_admin() THEN
    -- Admin: se filter_site passado, filtra por ele; caso contrário, vê tudo
    effective_sites := CASE WHEN filter_site IS NOT NULL THEN ARRAY[filter_site] ELSE NULL END;
  ELSE
    -- Não-admin: usa as praças permitidas do usuário logado
    effective_sites := public.get_current_user_sites();
  END IF;

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
    tr.class_name, -- Pegando de test_results
    tr.instructor_name, -- Pegando de test_results
    tr.mindset_tipo,
    tr.vac_dominante,
    tr.insights_consultivos
  FROM public.participants p
  LEFT JOIN public.test_results tr ON p.registration = tr.registration
  WHERE
    (effective_sites IS NULL OR p.site = ANY(effective_sites))
    AND (search_text IS NULL OR
         p.name ILIKE '%' || search_text || '%' OR
         p.registration ILIKE '%' || search_text || '%' OR
         p.email ILIKE '%' || search_text || '%')
    AND (filter_status IS NULL OR
         CASE filter_status
           WHEN 'completed' THEN tr.id IS NOT NULL
           WHEN 'pending' THEN tr.id IS NULL
           ELSE true
         END)
    AND (filter_cargo IS NULL OR p.cargo ILIKE filter_cargo)
    -- Ajuste do filtro de turma para usar o campo de test_results
    AND (filter_turma IS NULL OR tr.class_name ILIKE '%' || filter_turma || '%')
    AND (filter_instructor_email IS NULL OR tr.instructor_email = filter_instructor_email)
  ORDER BY p.created_at DESC;
END;
$$;
