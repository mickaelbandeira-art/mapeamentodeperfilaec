-- ============================================
-- ESTRUTURA DO BANCO DE DADOS
-- ============================================

-- Criar tabela profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  matricula text UNIQUE,
  cargo text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Criar trigger para auto-criar profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, matricula)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    new.raw_user_meta_data->>'matricula'
  );
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_participants_registration ON participants(registration);
CREATE INDEX IF NOT EXISTS idx_participants_email ON participants(email);
CREATE INDEX IF NOT EXISTS idx_participants_coordinator ON participants(coordinator);

-- Ajustar tabela test_results
ALTER TABLE public.test_results 
  ADD COLUMN IF NOT EXISTS answers jsonb;

CREATE INDEX IF NOT EXISTS idx_test_results_registration ON test_results(registration);
CREATE INDEX IF NOT EXISTS idx_test_results_participant_id ON test_results(participant_id);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Profiles policies
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON public.profiles;
CREATE POLICY "Admins podem ver todos os perfis"
  ON public.profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Hierarchical policies for participants
DROP POLICY IF EXISTS "Coordenadores veem seus subordinados" ON public.participants;
CREATE POLICY "Coordenadores veem seus subordinados"
  ON public.participants FOR SELECT
  USING (
    has_role(auth.uid(), 'coordinator'::app_role) 
    AND coordinator IN (
      SELECT profiles.full_name 
      FROM profiles 
      WHERE profiles.id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Gerente vê todos os participantes" ON public.participants;
CREATE POLICY "Gerente vê todos os participantes"
  ON public.participants FOR SELECT
  USING (has_role(auth.uid(), 'manager'::app_role));

-- Hierarchical policies for test_results
DROP POLICY IF EXISTS "Coordenadores veem resultados de subordinados" ON public.test_results;
CREATE POLICY "Coordenadores veem resultados de subordinados"
  ON public.test_results FOR SELECT
  USING (
    has_role(auth.uid(), 'coordinator'::app_role)
    AND registration IN (
      SELECT p.registration
      FROM participants p
      JOIN profiles prof ON prof.full_name = p.coordinator
      WHERE prof.id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Gerente vê todos os resultados" ON public.test_results;
CREATE POLICY "Gerente vê todos os resultados"
  ON public.test_results FOR SELECT
  USING (has_role(auth.uid(), 'manager'::app_role));

-- ============================================
-- VIEWS E FUNÇÕES
-- ============================================

-- View para estatísticas
DROP VIEW IF EXISTS dashboard_stats CASCADE;
CREATE VIEW dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM participants WHERE is_active = true) as total_participants,
  (SELECT COUNT(*) FROM test_results) as total_completed_tests,
  (SELECT COUNT(*) FROM participants WHERE is_active = true 
   AND registration NOT IN (SELECT registration FROM test_results)) as pending_tests,
  ROUND(
    (SELECT COUNT(*)::numeric FROM test_results) / 
    NULLIF((SELECT COUNT(*) FROM participants WHERE is_active = true), 0) * 100,
    1
  ) as completion_rate;

GRANT SELECT ON dashboard_stats TO authenticated;

-- Função de busca
CREATE OR REPLACE FUNCTION search_participants(
  search_text text DEFAULT NULL,
  filter_status text DEFAULT NULL,
  filter_cargo text DEFAULT NULL,
  filter_coordinator text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  registration text,
  name text,
  email text,
  cargo text,
  coordinator text,
  has_completed_test boolean,
  dominant_profile text,
  score_d integer,
  score_i integer,
  score_s integer,
  score_c integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.registration,
    p.name,
    p.email,
    p.cargo,
    p.coordinator,
    (tr.id IS NOT NULL) as has_completed_test,
    tr.dominant_profile,
    tr.score_d,
    tr.score_i,
    tr.score_s,
    tr.score_c
  FROM participants p
  LEFT JOIN test_results tr ON p.registration = tr.registration
  WHERE 
    p.is_active = true
    AND (search_text IS NULL OR 
         p.name ILIKE '%' || search_text || '%' OR
         p.email ILIKE '%' || search_text || '%' OR
         p.registration ILIKE '%' || search_text || '%')
    AND (filter_status IS NULL OR
         (filter_status = 'Completado' AND tr.id IS NOT NULL) OR
         (filter_status = 'Pendente' AND tr.id IS NULL))
    AND (filter_cargo IS NULL OR p.cargo = filter_cargo)
    AND (filter_coordinator IS NULL OR p.coordinator = filter_coordinator)
  ORDER BY p.name;
END;
$$;