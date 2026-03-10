-- Initial database schema for AeC Mapeamento
-- Adapted from Supabase migration

-- Enums
DO $$ BEGIN
    CREATE TYPE app_role AS ENUM ('admin', 'manager', 'coordinator', 'supervisor', 'colaborador');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users (Simulating auth.users for local PG)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text,
  created_at timestamptz DEFAULT now()
);

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  matricula text UNIQUE,
  cargo text,
  site text,
  role text DEFAULT 'visitor',
  status text DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Participants
CREATE TABLE IF NOT EXISTS public.participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration text UNIQUE NOT NULL,
  name text NOT NULL,
  email text,
  network_login text,
  cargo text,
  supervisor text,
  coordinator text,
  manager text,
  hierarchy_level text,
  is_active boolean DEFAULT true,
  leave_type text,
  return_date date,
  operation_origin text,
  site text,
  class_name text,
  instructor_email text,
  instructor_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Test Results
CREATE TABLE IF NOT EXISTS public.test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration text NOT NULL,
  participant_id uuid REFERENCES public.participants(id),
  name text,
  email text,
  score_d integer,
  score_i integer,
  score_s integer,
  score_c integer,
  dominant_profile text,
  answers jsonb,
  mindset_tipo text,
  vac_dominante text,
  insights_consultivos text,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- User Roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_participants_registration ON participants(registration);
CREATE INDEX IF NOT EXISTS idx_test_results_registration ON test_results(registration);

-- Views
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

-- Admin Seed (mickael.bandeira@aec.com.br / password: admin)
-- Password 'admin' hashed: $2a$10$Xm5A7uWqF3G5YlY3Q4M6rO8p8U1s2O6YI1A0w5U4G5X7M8N9O0P1Q
-- Using bcrypt standard hash for convenience
INSERT INTO public.users (id, email, password_hash)
VALUES ('78326efa-baa0-45d8-a8ce-334c2675745d', 'mickael.bandeira@aec.com.br', '$2a$10$Xm5A7uWqF3G5YlY3Q4M6rO8p8U1s2O6YI1A0w5U4G5X7M8N9O0P1Q')
ON CONFLICT DO NOTHING;

INSERT INTO public.profiles (id, full_name, email, role, status)
VALUES ('78326efa-baa0-45d8-a8ce-334c2675745d', 'Mickael Bandeira', 'mickael.bandeira@aec.com.br', 'admin', 'approved')
ON CONFLICT DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
VALUES ('78326efa-baa0-45d8-a8ce-334c2675745d', 'admin')
ON CONFLICT DO NOTHING;

-- Seed initial participants
INSERT INTO public.participants 
  (registration, name, email, network_login, cargo, supervisor, coordinator, manager, hierarchy_level, is_active)
VALUES
  ('134187', 'JONATHAN LINS DA SILVA', 'jonathan.silva@aec.com.br', 'jonathan.silva', 'GERENTE DE PESSOAS III', NULL, 'JONATHAN LINS DA SILVA', 'Jonathan Lins da Silva', 'gerente', true),
  ('241064', 'IZAURA DE ARAUJO BEZERRA', 'a.izaura.bezerra@aec.com.br', 'a.izaura.bezerra', 'COORDENADOR DE PESSOAS II', NULL, 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'coordenador', true),
  ('227625', 'KELCIANE CAVALCANTE DE LIMA', 'kelciane.lima@aec.com.br', 'kelciane.lima', 'COORDENADOR DE PESSOAS I', NULL, 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'coordenador', true)
ON CONFLICT (registration) DO NOTHING;
