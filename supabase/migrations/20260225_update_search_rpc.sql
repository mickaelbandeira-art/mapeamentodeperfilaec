-- Atualizar função de busca de participantes para incluir novos campos
DROP FUNCTION IF EXISTS search_participants(text,text,text,text,text,text,text);

CREATE OR REPLACE FUNCTION search_participants(
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
  insights_consultivos TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.registration,
    p.email,
    p.cargo,
    (tr.id IS NOT NULL) as has_completed_test, -- Determinar pelo resultado existente
    tr.dominant_profile,
    tr.score_d,
    tr.score_i,
    tr.score_s,
    tr.score_c,
    tr.site,
    tc.name as class_name,
    tr.instructor_name,
    tr.mindset_tipo,
    tr.vac_dominante,
    tr.insights_consultivos,
    p.created_at
  FROM participants p
  LEFT JOIN test_results tr ON p.registration = tr.registration
  LEFT JOIN training_classes tc ON tr.class_id = tc.id
  WHERE 
    p.is_active = true
    AND (search_text IS NULL OR 
         p.name ILIKE '%' || search_text || '%' OR 
         p.registration ILIKE '%' || search_text || '%' OR
         p.email ILIKE '%' || search_text || '%')
    AND (filter_status IS NULL OR 
         (filter_status = 'completed' AND tr.id IS NOT NULL) OR
         (filter_status = 'pending' AND tr.id IS NULL))
    AND (filter_cargo IS NULL OR p.cargo = filter_cargo)
    AND (filter_turma IS NULL OR tc.name = filter_turma)
    AND (filter_instructor_email IS NULL OR tr.instructor_email = filter_instructor_email)
    AND (filter_site IS NULL OR tr.site = filter_site)
  ORDER BY p.created_at DESC;
END;
$$;
