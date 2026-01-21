-- FULL MIGRATION SCRIPT
-- Generated automatically

-- ========================
-- MIGRATION: 20251114185000_7a8b63d2-0d31-4cff-ab04-3ce9b1780c41.sql
-- ========================
-- Adicionar novos valores ao enum app_role
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'manager';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'coordinator';

-- ========================
-- MIGRATION: 20251114185106_5be61870-5710-42a9-8a26-6c7f44a838ff.sql
-- ========================
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

-- Ajustar tabela participants
ALTER TABLE public.participants 
  RENAME COLUMN role TO cargo;

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

-- Profiles
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins podem ver todos os perfis"
  ON public.profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Hierarchical policies for participants
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

CREATE POLICY "Gerente vê todos os participantes"
  ON public.participants FOR SELECT
  USING (has_role(auth.uid(), 'manager'::app_role));

-- Hierarchical policies for test_results
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

CREATE POLICY "Gerente vê todos os resultados"
  ON public.test_results FOR SELECT
  USING (has_role(auth.uid(), 'manager'::app_role));

-- ============================================
-- VIEWS E FUNÇÕES
-- ============================================

-- View para estatísticas
CREATE OR REPLACE VIEW dashboard_stats AS
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

-- ========================
-- MIGRATION: 20251114185416_62737921-e0d5-4cab-9aa3-ca57f72a54cd.sql
-- ========================
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

-- ========================
-- MIGRATION: 20251114185440_38a1ea44-7afe-4660-8cdb-cb4c7d2bc423.sql
-- ========================
-- Recriar view sem SECURITY DEFINER para resolver warning de segurança
DROP VIEW IF EXISTS dashboard_stats CASCADE;

CREATE VIEW dashboard_stats 
WITH (security_invoker = true)
AS
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

-- ========================
-- MIGRATION: 20251114200153_50792ef0-f9d2-44dc-9719-5eca1baf4085.sql
-- ========================
-- Inserir roles para os usuários administrativos
INSERT INTO public.user_roles (user_id, role) VALUES
  ('78326efa-baa0-45d8-a8ce-334c2675745d', 'admin'),    -- mickael.bandeira@aec.com.br
  ('24a4e4ba-598a-433d-9f84-2d87eab3b283', 'manager'),  -- jonathan.silva@aec.com.br
  ('6431f2f5-7f28-4af9-b194-67de0f23854c', 'manager'),  -- a.izaura.bezerra@aec.com.br
  ('3338eb8d-e42f-442d-8997-cdc62eb7b7e6', 'coordinator') -- kelciane.lima@aec.com.br
ON CONFLICT (user_id, role) DO NOTHING;

-- Criar profiles automáticos se não existirem
INSERT INTO public.profiles (id, email, full_name)
SELECT 
  u.id, 
  u.email, 
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1))
FROM auth.users u
WHERE u.id IN (
  '78326efa-baa0-45d8-a8ce-334c2675745d',
  '24a4e4ba-598a-433d-9f84-2d87eab3b283',
  '6431f2f5-7f28-4af9-b194-67de0f23854c',
  '3338eb8d-e42f-442d-8997-cdc62eb7b7e6'
)
ON CONFLICT (id) DO NOTHING;

-- Inserir participantes de exemplo para testar auto-preenchimento
INSERT INTO public.participants (registration, name, email, cargo, coordinator, hierarchy_level, manager, is_active) VALUES
  ('12345', 'João Silva', 'joao.silva@aec.com.br', 'Analista de Sistemas', 'Kelciane Lima', 'colaborador', 'Jonathan Lins da Silva', true),
  ('12346', 'Maria Santos', 'maria.santos@aec.com.br', 'Coordenadora de TI', 'Jonathan Lins da Silva', 'coordenador', 'Jonathan Lins da Silva', true),
  ('12347', 'Pedro Oliveira', 'pedro.oliveira@aec.com.br', 'Assistente Administrativo', 'Kelciane Lima', 'colaborador', 'Izaura Bezerra', true),
  ('12348', 'Ana Costa', 'ana.costa@aec.com.br', 'Gerente de Projetos', 'Izaura Bezerra', 'gerente', 'Jonathan Lins da Silva', true),
  ('12349', 'Carlos Mendes', 'carlos.mendes@aec.com.br', 'Desenvolvedor Senior', 'Maria Santos', 'colaborador', 'Jonathan Lins da Silva', true)
ON CONFLICT (registration) DO NOTHING;

-- ========================
-- MIGRATION: 20251117230502_db9c4000-62a5-43c7-8fc4-eb6918415322.sql
-- ========================
-- =====================================================
-- POPULAR BANCO DE DADOS - Sistema DISC AeC
-- Total: 71 participantes + 67 resultados de testes
-- =====================================================

-- 1. Limpar dados de exemplo anteriores
DELETE FROM public.test_results WHERE registration IN ('12345', '12346', '12347', '12348', '12349');
DELETE FROM public.participants WHERE registration IN ('12345', '12346', '12347', '12348', '12349');

-- 2. Inserir todos os 71 participantes (SEM DUPLICATAS)
INSERT INTO public.participants 
  (registration, name, email, network_login, cargo, supervisor, coordinator, manager, hierarchy_level, is_active)
VALUES
  -- NÍVEL 1: GERENTE
  ('134187', 'JONATHAN LINS DA SILVA', 'jonathan.silva@aec.com.br', 'jonathan.silva', 'GERENTE DE PESSOAS III', NULL, 'JONATHAN LINS DA SILVA', 'Jonathan Lins da Silva', 'gerente', true),
  
  -- NÍVEL 2: COORDENADORES
  ('241064', 'IZAURA DE ARAUJO BEZERRA', 'a.izaura.bezerra@aec.com.br', 'a.izaura.bezerra', 'COORDENADOR DE PESSOAS II', NULL, 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'coordenador', true),
  ('227625', 'KELCIANE CAVALCANTE DE LIMA', 'kelciane.lima@aec.com.br', 'kelciane.lima', 'COORDENADOR DE PESSOAS I', NULL, 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'coordenador', true),
  ('241033', 'WILLAMES VIEIRA DE OLIVEIRA JUNIOR', 'willames.junior@aec.com.br', 'willames.junior', 'COORDENADOR ACADEMICO DE ENSINO', NULL, 'WILLAMES VIEIRA DE OLIVEIRA JUNIOR', 'Jonathan Lins da Silva', 'coordenador', true),
  
  -- NÍVEL 3: SUPERVISORES
  ('268126', 'ELIELZA KAROLYNE DOS SANTOS', 'a.elielza.santos@aec.com.br', 'a.elielza.santos', 'SUPERVISOR DE PESSOAS JUNIOR', NULL, 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'supervisor', true),
  ('211199', 'JULIO CESAR ALVES DA SILVA SANTOS', 'a.julio.cesar@aec.com.br', 'a.julio.cesar', 'SUPERVISOR DE PESSOAS JUNIOR', NULL, 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'supervisor', true),
  ('225756', 'MARIA CLARA DA SILVA SANTOS', 'a.maria.clara@aec.com.br', 'a.maria.clara', 'SUPERVISOR DE PESSOAS JUNIOR', NULL, 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'supervisor', true),
  ('281726', 'MARIANA PEREIRA VERAS', 'a.mariana.veras@aec.com.br', 'a.mariana.veras', 'SUPERVISOR DE PESSOAS JUNIOR', NULL, 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'supervisor', true),
  ('333076', 'PAULO GUILHERME DOS ANJOS CASTILIANI', 'paulo.castiliani@aec.com.br', 'paulo.castiliani', 'SUPERVISOR DE OPERACAO', NULL, 'WILLAMES VIEIRA DE OLIVEIRA JUNIOR', 'Jonathan Lins da Silva', 'supervisor', true),
  ('287661', 'SILVIA RAFAELA SANTOS SILVA', 'a.silvia.santos@aec.com.br', 'a.silvia.santos', 'SUPERVISOR DE PESSOAS JUNIOR', NULL, 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'supervisor', true),
  
  -- NÍVEL 4: COLABORADORES (61 participantes)
  ('226610', 'AMANDA LIMA LINO', 'a.amanda.lino@aec.com.br', 'a.amanda.lino', 'INSTRUTOR DE TREINAMENTO', 'MARIA CLARA DA SILVA SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('355042', 'AMANDA MARIA LIMA PRAXEDES', 'amanda.praxedes@aec.com.br', 'amanda.praxedes', 'INSTRUTOR DE TREINAMENTO', 'MARIANA PEREIRA VERAS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('359193', 'ANA CAROLINA SILVA DOS SANTOS', 'ana.casantos@aec.com.br', 'ana.casantos', 'INSTRUTOR DE TREINAMENTO', 'MARIA CLARA DA SILVA SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('394527', 'ANA PAULA SANTOS FERREIRA', 'ana.psferreira@aec.com.br', 'ana.psferreira', 'INSTRUTOR DE TREINAMENTO', 'ELIELZA KAROLYNE DOS SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('328279', 'BRUNO DOMINGOS LEAO SILVA BARBOSA', 'bruno.barbosa@aec.com.br', 'bruno.barbosa', 'INSTRUTOR DE TREINAMENTO', 'MARIANA PEREIRA VERAS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('359254', 'BRUNO HENRIQUE MUNIZ DA SILVA', 'bruno.hmsilva@aec.com.br', 'bruno.hmsilva', 'INSTRUTOR DE TREINAMENTO', 'JULIO CESAR ALVES DA SILVA SANTOS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('296317', 'CAMILA VIEIRA DELGADO DE OLIVEIRA', 'camila.oliveira@aec.com.br', 'camila.oliveira', 'INSTRUTOR DE TREINAMENTO', 'MARIA CLARA DA SILVA SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('292530', 'CARLOS EDUARDO SILVA DE OLIVEIRA', 'carlos.eoliveira@aec.com.br', 'carlos.eoliveira', 'INSTRUTOR DE TREINAMENTO', 'ELIELZA KAROLYNE DOS SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('296216', 'CICERO JOSE DE SOUZA', 'a.cicero.souza@aec.com.br', 'a.cicero.souza', 'INSTRUTOR DE TREINAMENTO', 'MARIA CLARA DA SILVA SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('359117', 'CICERO PEREIRA LEITE', 'cicero.leite@aec.com.br', 'cicero.leite', 'INSTRUTOR DE TREINAMENTO', 'MARIANA PEREIRA VERAS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('359290', 'DAVI ALEXANDRE DANTAS SANTOS', 'davi.asantos@aec.com.br', 'davi.asantos', 'INSTRUTOR DE TREINAMENTO', 'MARIANA PEREIRA VERAS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('292448', 'EDNALDO CANDIDO DA SILVA', 'ednaldo.silva@aec.com.br', 'ednaldo.silva', 'INSTRUTOR DE TREINAMENTO', 'MARIANA PEREIRA VERAS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('359300', 'EDUARDA MARIA SILVA GOMES', 'eduarda.gomes@aec.com.br', 'eduarda.gomes', 'INSTRUTOR DE TREINAMENTO', 'JULIO CESAR ALVES DA SILVA SANTOS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('347160', 'FERNANDO HENRIQUE BARROS DA SILVA', 'fernando.hsilva@aec.com.br', 'fernando.hsilva', 'INSTRUTOR DE TREINAMENTO', 'MARIANA PEREIRA VERAS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('246095', 'FRANCIMERY XAVIER DA SILVA', 'a.francimery.silva@aec.com.br', 'a.francimery.silva', 'INSTRUTOR DE TREINAMENTO', 'ELIELZA KAROLYNE DOS SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('359245', 'GABRIEL VINICIUS MARQUES BARRETO', 'gabriel.barreto@aec.com.br', 'gabriel.barreto', 'INSTRUTOR DE TREINAMENTO', 'ELIELZA KAROLYNE DOS SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('267910', 'GUILHERME MELO DE SOUZA', 'a.guilherme.souza@aec.com.br', 'a.guilherme.souza', 'INSTRUTOR DE TREINAMENTO', 'MARIA CLARA DA SILVA SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('210515', 'IANNA DA COSTA ALMEIDA', 'ianna.almeida@aec.com.br', 'ianna.almeida', 'INSTRUTOR DE TREINAMENTO', 'MARIANA PEREIRA VERAS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('307399', 'JAINE DA SILVA SANTOS', 'jaine.santos@aec.com.br', 'jaine.santos', 'INSTRUTOR DE TREINAMENTO', 'JULIO CESAR ALVES DA SILVA SANTOS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('331058', 'JANDSON JUNIOR DA SILVA', 'jandson.silva@aec.com.br', 'jandson.silva', 'INSTRUTOR DE TREINAMENTO', 'MARIA CLARA DA SILVA SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('391860', 'JAQUELINE MARIA LAURINDO', 'jaqueline.laurindo@aec.com.br', 'jaqueline.laurindo', 'ANALISTA DE CONTEUDO JUNIOR', 'PAULO GUILHERME DOS ANJOS CASTILIANI', 'WILLAMES VIEIRA DE OLIVEIRA JUNIOR', 'Jonathan Lins da Silva', 'colaborador', true),
  ('274071', 'JESSICA BEATRIZ DA SILVA OLIVEIRA', 'jessica.boliveira@aec.com.br', 'jessica.boliveira', 'INSTRUTOR DE TREINAMENTO', 'MARIANA PEREIRA VERAS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('240745', 'JOAO PAULO SILVA DE OLIVEIRA', 'a.joao.paulo@aec.com.br', 'a.joao.paulo', 'INSTRUTOR DE TREINAMENTO', 'ELIELZA KAROLYNE DOS SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('359232', 'JOSE ANDERSON TEIXEIRA DA SILVA', 'anderson.tsilva@aec.com.br', 'anderson.tsilva', 'INSTRUTOR DE TREINAMENTO', 'ELIELZA KAROLYNE DOS SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('395270', 'JOSE GABRIEL INACIO SILVA', 'gabriel.isilva@aec.com.br', 'gabriel.isilva', 'INSTRUTOR DE TREINAMENTO', 'JULIO CESAR ALVES DA SILVA SANTOS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('359264', 'JOSE GIVALDO DA SILVA REGO', 'givaldo.rego@aec.com.br', 'givaldo.rego', 'INSTRUTOR DE TREINAMENTO', 'MARIANA PEREIRA VERAS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('155494', 'JOSE RODRIGO SANTOS SILVA', 'rodrigo.ssilva@aec.com.br', 'rodrigo.ssilva', 'ANALISTA DE CONTEUDO JUNIOR', 'PAULO GUILHERME DOS ANJOS CASTILIANI', 'WILLAMES VIEIRA DE OLIVEIRA JUNIOR', 'Jonathan Lins da Silva', 'colaborador', true),
  ('359279', 'JUAN PABLO OLIVEIRA DO NASCIMENTO', 'juan.nascimento@aec.com.br', 'juan.nascimento', 'INSTRUTOR DE TREINAMENTO', 'ELIELZA KAROLYNE DOS SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('359260', 'KAIO CESAR SANTOS DA SILVA', 'kaio.csilva@aec.com.br', 'kaio.csilva', 'INSTRUTOR DE TREINAMENTO', 'MARIA CLARA DA SILVA SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('230569', 'KAROLINNE MARIA SILVA DE OLIVEIRA', 'a.karolinne.oliveira@aec.com.br', 'a.karolinne.oliveira', 'ANALISTA DE CONTEUDO JUNIOR', 'PAULO GUILHERME DOS ANJOS CASTILIANI', 'WILLAMES VIEIRA DE OLIVEIRA JUNIOR', 'Jonathan Lins da Silva', 'colaborador', true),
  ('391941', 'LARA GUEDES DE ARAUJO', 'lara.araujo@aec.com.br', 'lara.araujo', 'INSTRUTOR DE TREINAMENTO', 'MARIA CLARA DA SILVA SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('316539', 'LARYSSA ALVES DE SA SILVA', 'laryssa.silva@aec.com.br', 'laryssa.silva', 'ANALISTA DE CONTEUDO JUNIOR', 'PAULO GUILHERME DOS ANJOS CASTILIANI', 'WILLAMES VIEIRA DE OLIVEIRA JUNIOR', 'Jonathan Lins da Silva', 'colaborador', true),
  ('313947', 'LEANDRO DE ABREU OLIVEIRA', 'leandro.oliveira@aec.com.br', 'leandro.oliveira', 'ANALISTA DE CONTEUDO JUNIOR', 'PAULO GUILHERME DOS ANJOS CASTILIANI', 'WILLAMES VIEIRA DE OLIVEIRA JUNIOR', 'Jonathan Lins da Silva', 'colaborador', true),
  ('280951', 'LUAN CARLOS SILVA BATISTA', 'luan.batista@aec.com.br', 'luan.batista', 'INSTRUTOR DE TREINAMENTO', 'MARIANA PEREIRA VERAS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('257923', 'MARCELO JOSE FERREIRA DA SILVA', 'a.marcelo.silva@aec.com.br', 'a.marcelo.silva', 'ANALISTA DE CONTEUDO JUNIOR', 'PAULO GUILHERME DOS ANJOS CASTILIANI', 'WILLAMES VIEIRA DE OLIVEIRA JUNIOR', 'Jonathan Lins da Silva', 'colaborador', true),
  ('418749', 'MARIA CLARA DOS SANTOS', 'maria.csantos@aec.com.br', 'maria.csantos', 'ANALISTA DE PESSOAS JUNIOR', 'SILVIA RAFAELA SANTOS SILVA', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('257931', 'MARIA LUIZA FURTADO BEZERRA', 'a.maria.luiza@aec.com.br', 'a.maria.luiza', 'ANALISTA DE CONTEUDO JUNIOR', 'PAULO GUILHERME DOS ANJOS CASTILIANI', 'WILLAMES VIEIRA DE OLIVEIRA JUNIOR', 'Jonathan Lins da Silva', 'colaborador', true),
  ('336920', 'MARIANA ALVES DE OLIVEIRA', 'mariana.aoliveira@aec.com.br', 'mariana.aoliveira', 'INSTRUTOR DE TREINAMENTO', 'JULIO CESAR ALVES DA SILVA SANTOS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('349518', 'MARIANNE OLIVEIRA RAMOS', 'marianne.ramos@aec.com.br', 'marianne.ramos', 'INSTRUTOR DE TREINAMENTO', 'ELIELZA KAROLYNE DOS SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('200972', 'MIKAEL DE SA FERREIRA', 'a.mikael.ferreira@aec.com.br', 'a.mikael.ferreira', 'INSTRUTOR DE TREINAMENTO', 'MARIA CLARA DA SILVA SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('316490', 'PEDRO DE ALBUQUERQUE LINS', 'pedro.lins@aec.com.br', 'pedro.lins', 'INSTRUTOR DE TREINAMENTO', 'JULIO CESAR ALVES DA SILVA SANTOS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('311634', 'PEDRO HENRIQUE SILVA SANTANA', 'pedro.santana@aec.com.br', 'pedro.santana', 'INSTRUTOR DE TREINAMENTO', 'ELIELZA KAROLYNE DOS SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('359225', 'PETERSON RODRIGUES DA SILVA', 'peterson.silva@aec.com.br', 'peterson.silva', 'INSTRUTOR DE TREINAMENTO', 'MARIANA PEREIRA VERAS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('273783', 'RAIANE DA SILVA MARQUES', 'a.raiane.marques@aec.com.br', 'a.raiane.marques', 'INSTRUTOR DE TREINAMENTO', 'JULIO CESAR ALVES DA SILVA SANTOS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('304166', 'RAPHAELA MARIA PINTO DE OLIVEIRA', 'raphaela.oliveira@aec.com.br', 'raphaela.oliveira', 'INSTRUTOR DE TREINAMENTO', 'MARIA CLARA DA SILVA SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('359315', 'RENAN BARBOSA SANTOS', 'renan.bsantos@aec.com.br', 'renan.bsantos', 'INSTRUTOR DE TREINAMENTO', 'ELIELZA KAROLYNE DOS SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('264886', 'RENATO ANTONIO VERAS DA SILVA', 'a.renato.silva@aec.com.br', 'a.renato.silva', 'INSTRUTOR DE TREINAMENTO', 'MARIA CLARA DA SILVA SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('284289', 'RICARDO JOSE DA SILVA', 'ricardo.jsilva@aec.com.br', 'ricardo.jsilva', 'INSTRUTOR DE TREINAMENTO', 'JULIO CESAR ALVES DA SILVA SANTOS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('292356', 'SANDRO JOSE DA SILVA', 'sandro.silva@aec.com.br', 'sandro.silva', 'INSTRUTOR DE TREINAMENTO', 'ELIELZA KAROLYNE DOS SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('359289', 'SARA GOMES VICENTE', 'sara.vicente@aec.com.br', 'sara.vicente', 'INSTRUTOR DE TREINAMENTO', 'JULIO CESAR ALVES DA SILVA SANTOS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('359152', 'SOFIA ISABEL DE MELO OLIVEIRA', 'sofia.oliveira@aec.com.br', 'sofia.oliveira', 'INSTRUTOR DE TREINAMENTO', 'JULIO CESAR ALVES DA SILVA SANTOS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('334715', 'STEPHANI MARIA LIMA DE ANDRADE', 'stephani.andrade@aec.com.br', 'stephani.andrade', 'INSTRUTOR DE TREINAMENTO', 'ELIELZA KAROLYNE DOS SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('261064', 'TARCILA RAYANE DIAS RODRIGUES', 'tarcila.rodrigues@aec.com.br', 'tarcila.rodrigues', 'INSTRUTOR DE TREINAMENTO', 'MARIANA PEREIRA VERAS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('402592', 'THAIS RODRIGUES CARVALHO', 'thais.carvalho@aec.com.br', 'thais.carvalho', 'ASSISTENTE DE PESSOAS', 'SILVIA RAFAELA SANTOS SILVA', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('316440', 'THAISA MARIA DOS SANTOS SILVA', 'thaisa.silva@aec.com.br', 'thaisa.silva', 'INSTRUTOR DE TREINAMENTO', 'MARIA CLARA DA SILVA SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('395548', 'THAYANNE TELES DE OLIVEIRA', 'thayanne.oliveira@aec.com.br', 'thayanne.oliveira', 'ANALISTA DE PESSOAS JUNIOR', 'SILVIA RAFAELA SANTOS SILVA', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('300373', 'VALDIANA DA SILVA SANTOS', 'valdiana.santos@aec.com.br', 'valdiana.santos', 'INSTRUTOR DE TREINAMENTO', 'MARIANA PEREIRA VERAS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('257961', 'VANDEBERG AURELIO DOS SANTOS', 'a.vandeberg.santos@aec.com.br', 'a.vandeberg.santos', 'INSTRUTOR DE TREINAMENTO', 'JULIO CESAR ALVES DA SILVA SANTOS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('284238', 'VITOR CORDEIRO DE OLIVEIRA', 'vitor.oliveira@aec.com.br', 'vitor.oliveira', 'INSTRUTOR DE TREINAMENTO', 'MARIA CLARA DA SILVA SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('395415', 'YASMIN MARIA SANTOS', 'yasmin.santos@aec.com.br', 'yasmin.santos', 'INSTRUTOR DE TREINAMENTO', 'ELIELZA KAROLYNE DOS SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('263044', 'YVSON VIEIRA SILVA', 'a.yvson.silva@aec.com.br', 'a.yvson.silva', 'AUXILIAR DE PESSOAS', 'SILVIA RAFAELA SANTOS SILVA', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('323093', 'YURI JONAS SILVA NUNES', 'yuri.nunes@aec.com.br', 'yuri.nunes', 'ANALISTA DE CONTEUDO JUNIOR', 'PAULO GUILHERME DOS ANJOS CASTILIANI', 'WILLAMES VIEIRA DE OLIVEIRA JUNIOR', 'Jonathan Lins da Silva', 'colaborador', true)
  
ON CONFLICT (registration) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  network_login = EXCLUDED.network_login,
  cargo = EXCLUDED.cargo,
  supervisor = EXCLUDED.supervisor,
  coordinator = EXCLUDED.coordinator,
  manager = EXCLUDED.manager,
  hierarchy_level = EXCLUDED.hierarchy_level,
  updated_at = now();

-- 3. Inserir os 67 resultados de testes completados
INSERT INTO public.test_results 
  (registration, name, email, score_d, score_i, score_s, score_c, dominant_profile, completed_at)
VALUES
  ('226610', 'AMANDA LIMA LINO', 'a.amanda.lino@aec.com.br', 9, 2, 10, 9, 'S', '2025-11-10 10:01:49'::timestamp),
  ('355042', 'AMANDA MARIA LIMA PRAXEDES', 'amanda.praxedes@aec.com.br', 9, 10, 8, 3, 'I', '2025-11-10 09:45:47'::timestamp),
  ('359193', 'ANA CAROLINA SILVA DOS SANTOS', 'ana.casantos@aec.com.br', 10, 3, 11, 6, 'S', '2025-11-10 10:08:14'::timestamp),
  ('394527', 'ANA PAULA SANTOS FERREIRA', 'ana.psferreira@aec.com.br', 5, 10, 8, 7, 'I', '2025-11-10 09:19:43'::timestamp),
  ('359254', 'BRUNO HENRIQUE MUNIZ DA SILVA', 'bruno.hmsilva@aec.com.br', 9, 8, 9, 4, 'D', '2025-11-10 09:28:45'::timestamp),
  ('296317', 'CAMILA VIEIRA DELGADO DE OLIVEIRA', 'camila.oliveira@aec.com.br', 10, 6, 8, 6, 'D', '2025-11-10 10:10:03'::timestamp),
  ('292530', 'CARLOS EDUARDO SILVA DE OLIVEIRA', 'carlos.eoliveira@aec.com.br', 6, 5, 10, 9, 'S', '2025-11-10 09:25:24'::timestamp),
  ('296216', 'CICERO JOSE DE SOUZA', 'a.cicero.souza@aec.com.br', 7, 9, 7, 7, 'I', '2025-11-10 09:25:51'::timestamp),
  ('359117', 'CICERO PEREIRA LEITE', 'cicero.leite@aec.com.br', 9, 7, 7, 7, 'D', '2025-11-10 10:09:48'::timestamp),
  ('359290', 'DAVI ALEXANDRE DANTAS SANTOS', 'davi.asantos@aec.com.br', 5, 11, 9, 5, 'I', '2025-11-10 09:56:27'::timestamp),
  ('292448', 'EDNALDO CANDIDO DA SILVA', 'ednaldo.silva@aec.com.br', 5, 9, 9, 7, 'I', '2025-11-10 10:10:24'::timestamp),
  ('359300', 'EDUARDA MARIA SILVA GOMES', 'eduarda.gomes@aec.com.br', 9, 8, 5, 8, 'D', '2025-11-10 10:26:06'::timestamp),
  ('268126', 'ELIELZA KAROLYNE DOS SANTOS', 'a.elielza.santos@aec.com.br', 5, 4, 11, 10, 'S', '2025-11-10 09:38:24'::timestamp),
  ('347160', 'FERNANDO HENRIQUE BARROS DA SILVA', 'fernando.hsilva@aec.com.br', 3, 6, 13, 8, 'S', '2025-11-10 09:56:41'::timestamp),
  ('246095', 'FRANCIMERY XAVIER DA SILVA', 'a.francimery.silva@aec.com.br', 7, 8, 7, 8, 'I', '2025-11-10 09:31:24'::timestamp),
  ('359245', 'GABRIEL VINICIUS MARQUES BARRETO', 'gabriel.barreto@aec.com.br', 5, 8, 10, 7, 'S', '2025-11-10 09:17:15'::timestamp),
  ('267910', 'GUILHERME MELO DE SOUZA', 'a.guilherme.souza@aec.com.br', 9, 10, 7, 4, 'I', '2025-11-10 09:36:24'::timestamp),
  ('241064', 'IZAURA DE ARAUJO BEZERRA', 'a.izaura.bezerra@aec.com.br', 6, 5, 11, 8, 'S', '2025-11-10 09:36:22'::timestamp),
  ('307399', 'JAINE DA SILVA SANTOS', 'jaine.santos@aec.com.br', 5, 10, 10, 5, 'I', '2025-11-10 10:03:51'::timestamp),
  ('331058', 'JANDSON JUNIOR DA SILVA', 'jandson.silva@aec.com.br', 5, 5, 9, 11, 'C', '2025-11-10 09:56:54'::timestamp),
  ('391860', 'JAQUELINE MARIA LAURINDO', 'jaqueline.laurindo@aec.com.br', 4, 8, 9, 9, 'S', '2025-11-10 09:42:36'::timestamp),
  ('274071', 'JESSICA BEATRIZ DA SILVA OLIVEIRA', 'jessica.boliveira@aec.com.br', 8, 9, 6, 7, 'I', '2025-11-10 10:10:30'::timestamp),
  ('240745', 'JOAO PAULO SILVA DE OLIVEIRA', 'a.joao.paulo@aec.com.br', 7, 9, 8, 6, 'I', '2025-11-10 09:48:04'::timestamp),
  ('134187', 'JONATHAN LINS DA SILVA', 'jonathan.silva@aec.com.br', 9, 8, 6, 7, 'D', '2025-11-10 10:52:38'::timestamp),
  ('359232', 'JOSE ANDERSON TEIXEIRA DA SILVA', 'anderson.tsilva@aec.com.br', 6, 7, 10, 7, 'S', '2025-11-10 10:16:12'::timestamp),
  ('395270', 'JOSE GABRIEL INACIO SILVA', 'gabriel.isilva@aec.com.br', 10, 6, 5, 9, 'D', '2025-11-10 09:44:11'::timestamp),
  ('359264', 'JOSE GIVALDO DA SILVA REGO', 'givaldo.rego@aec.com.br', 4, 8, 11, 7, 'S', '2025-11-10 10:01:31'::timestamp),
  ('359279', 'JUAN PABLO OLIVEIRA DO NASCIMENTO', 'juan.nascimento@aec.com.br', 5, 11, 8, 6, 'I', '2025-11-10 09:43:51'::timestamp),
  ('211199', 'JULIO CESAR ALVES DA SILVA SANTOS', 'a.julio.cesar@aec.com.br', 8, 8, 6, 8, 'D', '2025-11-10 10:08:45'::timestamp),
  ('359260', 'KAIO CESAR SANTOS DA SILVA', 'kaio.csilva@aec.com.br', 6, 9, 9, 6, 'I', '2025-11-10 09:31:21'::timestamp),
  ('230569', 'KAROLINNE MARIA SILVA DE OLIVEIRA', 'a.karolinne.oliveira@aec.com.br', 8, 6, 10, 6, 'S', '2025-11-10 09:43:41'::timestamp),
  ('227625', 'KELCIANE CAVALCANTE DE LIMA', 'kelciane.lima@aec.com.br', 9, 7, 8, 6, 'D', '2025-11-10 10:18:05'::timestamp),
  ('391941', 'LARA GUEDES DE ARAUJO', 'lara.araujo@aec.com.br', 6, 10, 9, 5, 'I', '2025-11-10 10:13:20'::timestamp),
  ('316539', 'LARYSSA ALVES DE SA SILVA', 'laryssa.silva@aec.com.br', 8, 6, 7, 9, 'C', '2025-11-10 09:35:18'::timestamp),
  ('313947', 'LEANDRO DE ABREU OLIVEIRA', 'leandro.oliveira@aec.com.br', 5, 7, 9, 9, 'S', '2025-11-10 10:05:48'::timestamp),
  ('280951', 'LUAN CARLOS SILVA BATISTA', 'luan.batista@aec.com.br', 7, 8, 7, 8, 'I', '2025-11-10 10:01:29'::timestamp),
  ('257923', 'MARCELO JOSE FERREIRA DA SILVA', 'a.marcelo.silva@aec.com.br', 9, 4, 8, 9, 'D', '2025-11-10 09:48:35'::timestamp),
  ('225756', 'MARIA CLARA DA SILVA SANTOS', 'a.maria.clara@aec.com.br', 7, 11, 9, 3, 'I', '2025-11-10 10:01:21'::timestamp),
  ('257931', 'MARIA LUIZA FURTADO BEZERRA', 'a.maria.luiza@aec.com.br', 6, 8, 7, 9, 'I', '2025-11-10 09:36:49'::timestamp),
  ('336920', 'MARIANA ALVES DE OLIVEIRA', 'mariana.aoliveira@aec.com.br', 6, 7, 11, 6, 'S', '2025-11-10 09:36:31'::timestamp),
  ('349518', 'MARIANNE OLIVEIRA RAMOS', 'marianne.ramos@aec.com.br', 6, 10, 8, 6, 'I', '2025-11-10 09:40:58'::timestamp),
  ('281726', 'MARIANA PEREIRA VERAS', 'a.mariana.veras@aec.com.br', 5, 6, 10, 9, 'S', '2025-11-10 10:13:41'::timestamp),
  ('200972', 'MIKAEL DE SA FERREIRA', 'a.mikael.ferreira@aec.com.br', 7, 4, 8, 11, 'C', '2025-11-10 09:54:16'::timestamp),
  ('333076', 'PAULO GUILHERME DOS ANJOS CASTILIANI', 'paulo.castiliani@aec.com.br', 6, 8, 9, 7, 'S', '2025-11-10 09:51:48'::timestamp),
  ('316490', 'PEDRO DE ALBUQUERQUE LINS', 'pedro.lins@aec.com.br', 5, 9, 7, 9, 'I', '2025-11-10 09:25:19'::timestamp),
  ('311634', 'PEDRO HENRIQUE SILVA SANTANA', 'pedro.santana@aec.com.br', 5, 8, 10, 7, 'S', '2025-11-10 09:45:07'::timestamp),
  ('359225', 'PETERSON RODRIGUES DA SILVA', 'peterson.silva@aec.com.br', 6, 8, 10, 6, 'S', '2025-11-10 09:23:48'::timestamp),
  ('273783', 'RAIANE DA SILVA MARQUES', 'a.raiane.marques@aec.com.br', 4, 8, 8, 10, 'C', '2025-11-10 09:51:22'::timestamp),
  ('304166', 'RAPHAELA MARIA PINTO DE OLIVEIRA', 'raphaela.oliveira@aec.com.br', 10, 7, 7, 6, 'D', '2025-11-10 09:40:30'::timestamp),
  ('359315', 'RENAN BARBOSA SANTOS', 'renan.bsantos@aec.com.br', 4, 8, 9, 9, 'S', '2025-11-10 09:48:03'::timestamp),
  ('264886', 'RENATO ANTONIO VERAS DA SILVA', 'a.renato.silva@aec.com.br', 5, 9, 9, 7, 'I', '2025-11-10 09:25:01'::timestamp),
  ('284289', 'RICARDO JOSE DA SILVA', 'ricardo.jsilva@aec.com.br', 6, 7, 9, 8, 'S', '2025-11-10 09:48:05'::timestamp),
  ('292356', 'SANDRO JOSE DA SILVA', 'sandro.silva@aec.com.br', 7, 4, 9, 10, 'C', '2025-11-10 10:27:25'::timestamp),
  ('359289', 'SARA GOMES VICENTE', 'sara.vicente@aec.com.br', 5, 9, 9, 7, 'I', '2025-11-10 09:49:34'::timestamp),
  ('287661', 'SILVIA RAFAELA SANTOS SILVA', 'a.silvia.santos@aec.com.br', 6, 5, 10, 9, 'S', '2025-11-10 10:10:08'::timestamp),
  ('359152', 'SOFIA ISABEL DE MELO OLIVEIRA', 'sofia.oliveira@aec.com.br', 4, 6, 11, 9, 'S', '2025-11-10 10:04:09'::timestamp),
  ('334715', 'STEPHANI MARIA LIMA DE ANDRADE', 'stephani.andrade@aec.com.br', 6, 6, 8, 10, 'C', '2025-11-10 10:20:21'::timestamp),
  ('261064', 'TARCILA RAYANE DIAS RODRIGUES', 'tarcila.rodrigues@aec.com.br', 8, 9, 6, 7, 'I', '2025-11-10 10:00:44'::timestamp),
  ('402592', 'THAIS RODRIGUES CARVALHO', 'thais.carvalho@aec.com.br', 4, 9, 10, 7, 'S', '2025-11-10 09:40:36'::timestamp),
  ('316440', 'THAISA MARIA DOS SANTOS SILVA', 'thaisa.silva@aec.com.br', 5, 10, 11, 4, 'S', '2025-11-10 09:32:32'::timestamp),
  ('395548', 'THAYANNE TELES DE OLIVEIRA', 'thayanne.oliveira@aec.com.br', 4, 7, 11, 8, 'S', '2025-11-10 10:08:05'::timestamp),
  ('300373', 'VALDIANA DA SILVA SANTOS', 'valdiana.santos@aec.com.br', 5, 8, 11, 6, 'S', '2025-11-10 09:43:05'::timestamp),
  ('257961', 'VANDEBERG AURELIO DOS SANTOS', 'a.vandeberg.santos@aec.com.br', 7, 6, 6, 11, 'C', '2025-11-10 10:07:44'::timestamp),
  ('284238', 'VITOR CORDEIRO DE OLIVEIRA', 'vitor.oliveira@aec.com.br', 6, 9, 10, 5, 'S', '2025-11-10 09:50:45'::timestamp),
  ('241033', 'WILLAMES VIEIRA DE OLIVEIRA JUNIOR', 'willames.junior@aec.com.br', 8, 5, 6, 11, 'C', '2025-11-10 09:36:44'::timestamp),
  ('395415', 'YASMIN MARIA SANTOS', 'yasmin.santos@aec.com.br', 5, 10, 10, 5, 'I', '2025-11-10 09:38:39'::timestamp),
  ('263044', 'YVSON VIEIRA SILVA', 'a.yvson.silva@aec.com.br', 4, 7, 10, 9, 'S', '2025-11-10 09:58:30'::timestamp),
  ('323093', 'YURI JONAS SILVA NUNES', 'yuri.nunes@aec.com.br', 7, 4, 7, 12, 'C', '2025-11-10 09:35:17'::timestamp)
  
ON CONFLICT DO NOTHING;

-- 4. Atualizar função search_participants para ordenar por hierarquia
CREATE OR REPLACE FUNCTION public.search_participants(
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
  ORDER BY 
    CASE p.hierarchy_level
      WHEN 'gerente' THEN 1
      WHEN 'coordenador' THEN 2
      WHEN 'supervisor' THEN 3
      WHEN 'colaborador' THEN 4
      ELSE 5
    END,
    p.name;
END;
$$;

-- ========================
-- MIGRATION: 20251202170733_fbf5a965-2759-4600-be7f-7b1522845029.sql
-- ========================
-- =====================================================
-- ADICIONAR COLUNAS DE AFASTAMENTO E INSERIR 10 NOVOS PARTICIPANTES
-- =====================================================

-- Parte 1: Adicionar novas colunas para informações de afastamento
ALTER TABLE public.participants 
ADD COLUMN IF NOT EXISTS leave_type text,
ADD COLUMN IF NOT EXISTS return_date date,
ADD COLUMN IF NOT EXISTS operation_origin text;

-- Comentários para documentação
COMMENT ON COLUMN public.participants.leave_type IS 'Tipo de afastamento: LICENÇA MATERNIDADE, AUXILIO DOENCA, etc.';
COMMENT ON COLUMN public.participants.return_date IS 'Data prevista de retorno do afastamento';
COMMENT ON COLUMN public.participants.operation_origin IS 'Operação de origem do funcionário';

-- Parte 2: Inserir os 10 novos participantes afastados
INSERT INTO public.participants 
  (registration, name, email, cargo, supervisor, coordinator, manager, 
   hierarchy_level, is_active, leave_type, return_date, operation_origin)
VALUES
  ('157257', 'ANGELA MARIA DOS SANTOS', 'disc@aec.com.br', 
   'ATENDENTE', NULL, 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 
   'colaborador', false, 'LICENÇA MATERNIDADE', '2025-10-17', 'NET_CRC_CM_HFC+DTH'),
   
  ('226802', 'ELISANGELA MARIA DE FARIAS MOURA', 'disc@aec.com.br', 
   'ATENDENTE', NULL, 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 
   'colaborador', false, 'AUXILIO DOENCA', '2025-11-15', 'CLARO_MOVEL_CONTROLE_NIVEL_I'),
   
  ('366717', 'ANDREIA FORTUNATO SILVA', 'disc@aec.com.br', 
   'ATENDENTE', NULL, 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 
   'colaborador', false, 'LICENÇA MATERNIDADE', '2025-11-26', 'CLARO_MOVEL_CONTROLE_SERVICE_TO_SALES'),
   
  ('277692', 'SANDRA MARQUES DE OLIVEIRA', 'disc@aec.com.br', 
   'ATENDENTE', NULL, 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 
   'colaborador', false, 'LICENÇA MATERNIDADE', '2025-11-29', 'IFOOD_CX_POS_ENTREGA'),
   
  ('411030', 'HUDSON KLEITON DA SILVA', 'disc@aec.com.br', 
   'ATENDENTE', NULL, 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 
   'colaborador', false, 'AUXILIO DOENCA', '2025-11-27', 'IFOOD_RX_CHAT_N1'),
   
  ('382766', 'EWERTON MENDES DE LIMA', 'disc@aec.com.br', 
   'ATENDENTE', NULL, 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 
   'colaborador', false, 'AUXILIO DOENCA', '2025-11-28', 'BANCO_INTER_EMPRESTIMOS_VOZ'),
   
  ('426765', 'JOSE RODRIGO DE OLIVEIRA SANTOS', 'disc@aec.com.br', 
   'ATENDENTE', NULL, 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 
   'colaborador', false, 'AUXILIO DOENCA', '2025-12-01', 'CLARO_MOVEL_CONTROLE_NIVEL_I'),
   
  ('316693', 'ANIE KARINE CANUTO ALVES DE LIMA', 'disc@aec.com.br', 
   'ATENDENTE', NULL, 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 
   'colaborador', false, 'AUXILIO DOENCA', '2025-11-08', NULL),
   
  ('214605', 'JAIRA MARIANA OLIVEIRA DINIZ', 'disc@aec.com.br', 
   'ATENDENTE', NULL, 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 
   'colaborador', false, 'LICENÇA MATERNIDADE', '2025-12-01', 'CLARO_MOVEL_RETENCAO_ATIVA_PORT_RECEPTIVO'),
   
  ('352103', 'DEISIANNY CRISTIANNY DA CONCEICAO DANTAS', 'disc@aec.com.br', 
   'ATENDENTE', NULL, 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 
   'colaborador', false, 'LICENÇA MATERNIDADE', '2025-12-02', 'CLARO_MOVEL_CRC')
   
ON CONFLICT (registration) DO UPDATE SET
  name = EXCLUDED.name,
  leave_type = EXCLUDED.leave_type,
  return_date = EXCLUDED.return_date,
  operation_origin = EXCLUDED.operation_origin,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- ========================
-- MIGRATION: 20251223132000_add_missing_participants.sql
-- ========================
-- Migration to add missing participants who have test results but no participant record
-- and link their test results to the new participant records.

-- 1. Insert missing participants
INSERT INTO participants (registration, name, email, cargo, coordinator, hierarchy_level)
VALUES 
  ('411017', 'Emily Maiara Melchiades Martins Melo', 'emilly.maiara@if-aec.com.br', 'COLABORADOR', 'A DEFINIR', 'colaborador'),
  ('364514', 'Wesley de Araujo Silva', 'wesley.daraujo@aec.com.br', 'COLABORADOR', 'A DEFINIR', 'colaborador'),
  ('294982', 'Cauê Porfírio dos Santos', 'caueporfirio25@gmail.com', 'COLABORADOR', 'A DEFINIR', 'colaborador'),
  ('410992', 'Wesley Adrian Oliveira dos Santos', 'wesley.oliveira@aec.com.br', 'COLABORADOR', 'A DEFINIR', 'colaborador')
ON CONFLICT (registration) DO NOTHING;

-- 2. Link test results to the new participants
UPDATE test_results
SET participant_id = participants.id
FROM participants
WHERE test_results.registration = participants.registration
AND test_results.participant_id IS NULL
AND participants.registration IN ('411017', '364514', '294982', '410992');


-- ========================
-- MIGRATION: 20251223134500_fix_dashboard_dups_and_missing.sql
-- ========================
-- Migration to fix dashboard duplicates and missing participants

-- 1. Update search_participants function to return only the latest test result per user
CREATE OR REPLACE FUNCTION public.search_participants(search_text text DEFAULT NULL::text, filter_status text DEFAULT NULL::text, filter_cargo text DEFAULT NULL::text, filter_coordinator text DEFAULT NULL::text)
 RETURNS TABLE(id uuid, registration text, name text, email text, cargo text, coordinator text, has_completed_test boolean, dominant_profile text, score_d integer, score_i integer, score_s integer, score_c integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  LEFT JOIN (
    SELECT DISTINCT ON (registration) *
    FROM test_results
    ORDER BY registration, created_at DESC
  ) tr ON p.registration = tr.registration
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
  ORDER BY 
    CASE p.hierarchy_level
      WHEN 'gerente' THEN 1
      WHEN 'coordenador' THEN 2
      WHEN 'supervisor' THEN 3
      WHEN 'colaborador' THEN 4
      ELSE 5
    END,
    p.name;
END;
$function$;

-- 2. Insert missing participants found in test_results but not in participants table
INSERT INTO participants (registration, name, email, cargo, coordinator, hierarchy_level)
VALUES 
  ('297437', 'Danilo Bezerra dos santos silva ', 'a.danilo.bsantos@if-aec.com.br', 'COLABORADOR', 'A DEFINIR', 'colaborador'),
  ('257551', 'Ayrlla Alves Da Silva ', 'a.ayrlla.silva@if-aec.com.br', 'COLABORADOR', 'A DEFINIR', 'colaborador'),
  ('263660', 'Larissa Feitosa Silva Reis', 'larissafeitosa2084@gmail.com', 'COLABORADOR', 'A DEFINIR', 'colaborador'),
  ('364656', 'Fernanda Maria Leandro Rodrigues ', 'fernanda.lrodrigues@aec.com.br', 'COLABORADOR', 'A DEFINIR', 'colaborador'),
  ('260534', 'Patrícya Viviane Amaral castro ', 'a.patricya.castro@if-aec.com.br', 'COLABORADOR', 'A DEFINIR', 'colaborador'),
  ('303768', 'Ana Kivia Ferreira Lima', 'ana.lima@if-aec.com.br', 'COLABORADOR', 'A DEFINIR', 'colaborador'),
  ('273054', 'Vitória maria da gama', 'vitoria.ma98528100@gmail.com', 'COLABORADOR', 'A DEFINIR', 'colaborador'),
  ('274217', 'Erica Barbosa dos santos', 'a.erica.bsantos@if-aec.com.br', 'COLABORADOR', 'A DEFINIR', 'colaborador'),
  ('300691', 'Maria laise barbosa alves', 'laiseeisaac@gmail.com', 'COLABORADOR', 'A DEFINIR', 'colaborador'),
  ('165959', 'MYLLENA FERREIRA MIRANDA', 'myllena.miranda@aec.com.br', 'COLABORADOR', 'A DEFINIR', 'colaborador')
ON CONFLICT (registration) DO NOTHING;

-- 3. Link unlinked test results to the newly inserted participants
UPDATE test_results
SET participant_id = participants.id
FROM participants
WHERE test_results.registration = participants.registration
AND test_results.participant_id IS NULL;


-- ========================
-- SEED DATA
-- ========================
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

