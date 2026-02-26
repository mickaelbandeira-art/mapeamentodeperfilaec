-- ==============================================================
-- MIGRAÇÃO: Suporte Multi-Praça + Criação de Usuário Kelciane
-- Aplicar no SQL Editor do Supabase em 2 passos
-- ==============================================================

-- ============================================================
-- PASSO 1: Criar tabela de praças permitidas por usuário
-- (Necessário para usuários que gerenciam mais de uma praça)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_allowed_sites (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, site)
);

-- Ativar RLS nesta tabela
ALTER TABLE public.user_allowed_sites ENABLE ROW LEVEL SECURITY;

-- Admin pode gerenciar tudo; usuário pode ver suas próprias entradas
CREATE POLICY "user_allowed_sites_select"
ON public.user_allowed_sites FOR SELECT
USING (auth.uid() = user_id OR public.is_global_admin());

CREATE POLICY "user_allowed_sites_all_admin"
ON public.user_allowed_sites FOR ALL
USING (public.is_global_admin());

-- ============================================================
-- PASSO 2: Atualizar funções RLS para suportar múltiplas praças
-- ============================================================

-- get_current_user_site() agora retorna a PRIMEIRA praça do usuário
-- (mantida para compatibilidade com o RLS de participants/training_classes)
CREATE OR REPLACE FUNCTION public.get_current_user_sites()
RETURNS TEXT[]
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    -- Primeiro, verifica user_allowed_sites (multi-praça)
    ARRAY(SELECT site FROM public.user_allowed_sites WHERE user_id = auth.uid()),
    -- Fallback: praça do profile (compatibilidade)
    ARRAY(SELECT site FROM public.profiles WHERE id = auth.uid() AND site IS NOT NULL AND site != '')
  );
$$;

-- Atualizar políticas de participants para suportar multi-praça
DROP POLICY IF EXISTS "participants_select_by_site" ON public.participants;
CREATE POLICY "participants_select_by_site"
ON public.participants FOR SELECT
USING (
  public.is_global_admin()
  OR site = ANY(public.get_current_user_sites())
);

DROP POLICY IF EXISTS "participants_update_by_site" ON public.participants;
CREATE POLICY "participants_update_by_site"
ON public.participants FOR UPDATE
USING (
  public.is_global_admin()
  OR site = ANY(public.get_current_user_sites())
);

-- Atualizar políticas de training_classes para suportar multi-praça
DROP POLICY IF EXISTS "training_classes_select_by_site" ON public.training_classes;
CREATE POLICY "training_classes_select_by_site"
ON public.training_classes FOR SELECT
USING (
  public.is_global_admin()
  OR site = ANY(public.get_current_user_sites())
  OR site = ''
);

DROP POLICY IF EXISTS "training_classes_insert_by_site" ON public.training_classes;
CREATE POLICY "training_classes_insert_by_site"
ON public.training_classes FOR INSERT
WITH CHECK (
  public.is_global_admin()
  OR site = ANY(public.get_current_user_sites())
);

DROP POLICY IF EXISTS "training_classes_update_by_site" ON public.training_classes;
CREATE POLICY "training_classes_update_by_site"
ON public.training_classes FOR UPDATE
USING (
  public.is_global_admin()
  OR site = ANY(public.get_current_user_sites())
);

DROP POLICY IF EXISTS "training_classes_delete_by_site" ON public.training_classes;
CREATE POLICY "training_classes_delete_by_site"
ON public.training_classes FOR DELETE
USING (
  public.is_global_admin()
  OR site = ANY(public.get_current_user_sites())
);

-- Atualizar RPC search_participants para multi-praça
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
  IF public.is_global_admin() THEN
    -- Admin: se filter_site passado, filtra por ele; caso contrário, vê tudo
    effective_sites := CASE WHEN filter_site IS NOT NULL THEN ARRAY[filter_site] ELSE NULL END;
  ELSE
    -- Não-admin: usa as praças permitidas do usuário logado
    effective_sites := public.get_current_user_sites();
  END IF;

  RETURN QUERY
  SELECT
    p.id, p.name, p.registration, p.email, p.cargo,
    p.has_completed_test, p.dominant_profile,
    p.score_d, p.score_i, p.score_s, p.score_c,
    p.site, tc.name AS class_name,
    p.instructor_name, p.mindset_tipo, p.vac_dominante, p.insights_consultivos
  FROM public.participants p
  LEFT JOIN public.training_classes tc ON p.class_id = tc.id
  WHERE
    (effective_sites IS NULL OR p.site = ANY(effective_sites))
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
