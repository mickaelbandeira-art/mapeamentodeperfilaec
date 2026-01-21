-- ==============================================================================
-- FINAL FIX ALL V3: Create Missing Tables, Functions, Schema, Permissions, Dashboard, Admins
-- ==============================================================================

-- 0. Extensions & Enums
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'coordinator');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.hierarchy_level AS ENUM ('colaborador', 'supervisor', 'coordenador', 'gerente');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Tables (Create if missing)

-- PROFILES
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

-- PARTICIPANTS
CREATE TABLE IF NOT EXISTS public.participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration text UNIQUE NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  network_login text,
  cargo text NOT NULL,
  supervisor text,
  coordinator text NOT NULL,
  manager text DEFAULT 'Jonathan Lins da Silva',
  hierarchy_level public.hierarchy_level NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- TEST RESULTS
CREATE TABLE IF NOT EXISTS public.test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid REFERENCES public.participants(id) ON DELETE SET NULL,
  registration text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  score_d integer NOT NULL,
  score_i integer NOT NULL,
  score_s integer NOT NULL,
  score_c integer NOT NULL,
  dominant_profile text NOT NULL,
  completed_at timestamptz DEFAULT now(),
  test_duration_seconds integer,
  answers jsonb
);
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

-- USER ROLES
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. Functions

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- SEARCH PARTICIPANTS FUNCTION (Fix for missing function error)
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
  ORDER BY p.name;
END;
$$;

-- 3. Policies

-- Participants
DROP POLICY IF EXISTS "Enable read access for all users" ON public.participants;
CREATE POLICY "Enable read access for all users" ON public.participants FOR SELECT TO public USING (true);

-- Test Results
DROP POLICY IF EXISTS "Enable insert for all users" ON public.test_results;
CREATE POLICY "Enable insert for all users" ON public.test_results FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Enable select for all users" ON public.test_results;
CREATE POLICY "Enable select for all users" ON public.test_results FOR SELECT TO public USING (true);


-- 4. Dashboard View
DROP VIEW IF EXISTS public.dashboard_stats;
CREATE OR REPLACE VIEW public.dashboard_stats 
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

GRANT SELECT ON public.dashboard_stats TO authenticated, anon, service_role;


-- 5. Seed Admins
-- Note: 'coordinator' field is required, so we default to 'Jonathan Lins da Silva' (Self or Manager)
INSERT INTO public.participants (registration, name, email, cargo, coordinator, hierarchy_level, is_active)
VALUES
  ('134187', 'JONATHAN LINS DA SILVA', 'jonathan.silva@aec.com.br', 'GERENTE', 'JONATHAN LINS DA SILVA', 'gerente', true),
  ('227625', 'KELCIANE CAVALCANTE DE LIMA', 'kelciane.lima@aec.com.br', 'COORDENADOR', 'JONATHAN LINS DA SILVA', 'coordenador', true),
  ('261064', 'IZAURA DE ARAUJO BEZERRA', 'a.izaura.bezerrra@aec.com.br', 'COORDENADOR', 'JONATHAN LINS DA SILVA', 'coordenador', true),
  ('461576', 'Mickael Bandeira da Silva', 'mickael.bandeira@aec.com.br', 'ADMIN', 'JONATHAN LINS DA SILVA', 'gerente', true)
ON CONFLICT (registration) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  cargo = EXCLUDED.cargo,
  hierarchy_level = EXCLUDED.hierarchy_level,
  is_active = true,
  updated_at = now();

-- 6. Confirm Admin Emails
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email IN (
  'jonathan.silva@aec.com.br',
  'kelciane.lima@aec.com.br',
  'a.izaura.bezerrra@aec.com.br',
  'mickael.bandeira@aec.com.br'
);

-- 7. Reload
NOTIFY pgrst, 'reload config';
