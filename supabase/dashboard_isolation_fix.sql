-- ==============================================================
-- FIX: ISOLAMENTO DE DADOS (DASHBOARD POR INSTRUTOR)
-- Garante que instrutores vejam apenas suas turmas e alunos
-- ==============================================================

-- 1. ATUALIZAR FUNÇÃO DE BUSCA PARA FILTRAR POR CRIADOR
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
  current_user_email TEXT;
  user_is_admin BOOLEAN;
  user_is_manager BOOLEAN;
BEGIN
  -- Identificar usuário e permissões
  SELECT email INTO current_user_email FROM auth.users WHERE id = auth.uid();
  user_is_admin := public.is_global_admin();
  user_is_manager := EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'manager');

  RETURN QUERY
  SELECT
    p.id, p.name, p.registration, p.email, p.cargo,
    (tr.id IS NOT NULL) AS has_completed_test,
    tr.dominant_profile, tr.score_d, tr.score_i, tr.score_s, tr.score_c,
    p.site, 
    tc.name AS class_name,
    tc.instructor_name,
    tr.mindset_tipo,
    tr.vac_dominante,
    tr.insights_consultivos
  FROM public.participants p
  LEFT JOIN public.training_classes tc ON p.class_id = tc.id
  LEFT JOIN public.test_results tr ON p.registration = tr.registration
  WHERE
    -- Isolamento por Praça (Existente)
    (user_is_admin OR p.site = public.get_current_user_site())
    
    -- NOVO: Isolamento por Instrutor (Se não for Admin/Manager)
    AND (
      user_is_admin 
      OR user_is_manager 
      OR tc.created_by = auth.uid() 
      OR tc.instructor_email = current_user_email
    )

    -- Filtros Dinâmicos
    AND (search_text IS NULL OR p.name ILIKE '%' || search_text || '%')
    AND (filter_status IS NULL OR
         CASE filter_status
           WHEN 'completed' THEN tr.id IS NOT NULL
           WHEN 'pending' THEN tr.id IS NULL
           ELSE true
         END)
    AND (filter_cargo IS NULL OR p.cargo ILIKE filter_cargo)
    AND (filter_turma IS NULL OR tc.name ILIKE '%' || filter_turma || '%')
  ORDER BY p.created_at DESC;
END;
$$;

-- 2. AJUSTAR RLS EM TRAINING_CLASSES (Se houver)
ALTER TABLE public.training_classes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Instrutores veem suas turmas" ON public.training_classes;
CREATE POLICY "Instrutores veem suas turmas"
ON public.training_classes
FOR SELECT
USING (
  public.is_global_admin()
  OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'manager')
  OR created_by = auth.uid()
  OR site = public.get_current_user_site()
);

-- 3. REGENERAR DASHBOARD STATS PARA RESPEITAR O CRIADOR (OPCIONAL/SIMPLIFICADO)
-- Nota: Como o Dashboard Stats é uma View, ele herda as restrições de RLS se as tabelas base tiverem.
