-- ==============================================================
-- MIGRAÇÃO: Isolamento Multi-Tenant por Praça (Site)
-- Versão corrigida - sem recriar a view dashboard_stats
-- Aplicar no Editor SQL do Supabase (supabase.com/dashboard)
-- ==============================================================

-- ============================================================
-- PASSO 1: Adicionar 'site' à tabela training_classes
-- ============================================================
ALTER TABLE public.training_classes
ADD COLUMN IF NOT EXISTS site TEXT NOT NULL DEFAULT '';

-- ============================================================
-- PASSO 2: Habilitar RLS nas tabelas principais
-- ============================================================
ALTER TABLE public.training_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PASSO 3: Função auxiliar - retorna a praça do usuário logado
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_current_user_site()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT site FROM public.profiles WHERE id = auth.uid();
$$;

-- ============================================================
-- PASSO 4: Função auxiliar - verifica se é admin global
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_global_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- ============================================================
-- PASSO 5: Políticas RLS para training_classes
-- ============================================================
DROP POLICY IF EXISTS "training_classes_select_by_site" ON public.training_classes;
DROP POLICY IF EXISTS "training_classes_insert_by_site" ON public.training_classes;
DROP POLICY IF EXISTS "training_classes_update_by_site" ON public.training_classes;
DROP POLICY IF EXISTS "training_classes_delete_by_site" ON public.training_classes;

-- SELECT: admin vê tudo; outros veem apenas sua praça (ou turmas sem praça = legado)
CREATE POLICY "training_classes_select_by_site"
ON public.training_classes FOR SELECT
USING (
  public.is_global_admin()
  OR site = public.get_current_user_site()
  OR site = ''
);

-- INSERT: apenas sua própria praça (ou admin pode qualquer)
CREATE POLICY "training_classes_insert_by_site"
ON public.training_classes FOR INSERT
WITH CHECK (
  public.is_global_admin()
  OR site = public.get_current_user_site()
);

-- UPDATE: mesma lógica de INSERT
CREATE POLICY "training_classes_update_by_site"
ON public.training_classes FOR UPDATE
USING (
  public.is_global_admin()
  OR site = public.get_current_user_site()
);

-- DELETE: mesma lógica
CREATE POLICY "training_classes_delete_by_site"
ON public.training_classes FOR DELETE
USING (
  public.is_global_admin()
  OR site = public.get_current_user_site()
);

-- ============================================================
-- PASSO 6: Políticas RLS para participants
-- ============================================================
DROP POLICY IF EXISTS "participants_select_by_site" ON public.participants;
DROP POLICY IF EXISTS "participants_insert_by_site" ON public.participants;
DROP POLICY IF EXISTS "participants_update_by_site" ON public.participants;

-- SELECT: admin vê tudo; outros veem apenas sua praça
CREATE POLICY "participants_select_by_site"
ON public.participants FOR SELECT
USING (
  public.is_global_admin()
  OR site = public.get_current_user_site()
);

-- INSERT: participantes se cadastram livremente (o teste é público)
CREATE POLICY "participants_insert_by_site"
ON public.participants FOR INSERT
WITH CHECK (true);

-- UPDATE: apenas admin ou da mesma praça
CREATE POLICY "participants_update_by_site"
ON public.participants FOR UPDATE
USING (
  public.is_global_admin()
  OR site = public.get_current_user_site()
);

-- ============================================================
-- PASSO 7: Atualizar RPC search_participants para forçar
--          isolamento por praça via auth.uid()
-- ============================================================

-- Necessário para alterar o tipo de retorno da função existente
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
  effective_site TEXT;
BEGIN
  -- Admin global pode filtrar por qualquer praça (ou ver tudo com NULL)
  -- Não-admin sempre vê apenas sua praça, independente do parâmetro
  IF public.is_global_admin() THEN
    effective_site := filter_site;
  ELSE
    effective_site := public.get_current_user_site();
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.registration,
    p.email,
    p.cargo,
    p.has_completed_test,
    p.dominant_profile,
    p.score_d,
    p.score_i,
    p.score_s,
    p.score_c,
    p.site,
    tc.name AS class_name,
    p.instructor_name,
    p.mindset_tipo,
    p.vac_dominante,
    p.insights_consultivos
  FROM public.participants p
  LEFT JOIN public.training_classes tc ON p.class_id = tc.id
  WHERE
    (effective_site IS NULL OR p.site = effective_site)
    AND (search_text IS NULL OR
         p.name ILIKE '%' || search_text || '%' OR
         p.registration ILIKE '%' || search_text || '%' OR
         p.email ILIKE '%' || search_text || '%')
    AND (filter_status IS NULL OR
         CASE filter_status
           WHEN 'completed' THEN p.has_completed_test = true
           WHEN 'pending' THEN p.has_completed_test = false
           ELSE true
         END)
    AND (filter_cargo IS NULL OR p.cargo ILIKE filter_cargo)
    AND (filter_turma IS NULL OR tc.name ILIKE '%' || filter_turma || '%')
    AND (filter_instructor_email IS NULL OR p.instructor_email = filter_instructor_email)
  ORDER BY p.created_at DESC;
END;
$$;

-- ============================================================
-- FIM DA MIGRAÇÃO
-- Verifique: training_classes agora tem coluna 'site'
-- RLS está ativo em training_classes e participants
-- search_participants agora usa auth.uid() para isolamento
-- ============================================================
