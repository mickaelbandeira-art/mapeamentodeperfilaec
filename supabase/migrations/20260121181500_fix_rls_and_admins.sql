-- ==============================================================================
-- Fix RLS Policies and Update Admin Users
-- ==============================================================================

-- 1. Enable anonymous/public inserts for test_results
-- This is required because the test is completed by users who are likely not authenticated (anon).
DROP POLICY IF EXISTS "Enable insert for all users" ON public.test_results;
CREATE POLICY "Enable insert for all users" 
ON public.test_results 
FOR INSERT 
TO public 
WITH CHECK (true);

-- 2. Enable public read access for participants
-- Required for the registration screen to lookup existing participants by registration number
DROP POLICY IF EXISTS "Enable read access for all users" ON public.participants;
CREATE POLICY "Enable read access for all users" 
ON public.participants 
FOR SELECT 
TO public 
USING (true);

-- 3. Insert/Update Admin Users in Participants table
-- Using ON CONFLICT to update existing records or insert new ones
INSERT INTO public.participants (registration, name, email, cargo, hierarchy_level, is_active)
VALUES
  ('134187', 'JONATHAN LINS DA SILVA', 'jonathan.silva@aec.com.br', 'GERENTE', 'gerente', true),
  ('227625', 'KELCIANE CAVALCANTE DE LIMA', 'kelciane.lima@aec.com.br', 'COORDENADOR', 'coordenador', true),
  ('261064', 'IZAURA DE ARAUJO BEZERRA', 'a.izaura.bezerrra@aec.com.br', 'COORDENADOR', 'coordenador', true),
  ('461576', 'Mickael Bandeira da Silva', 'mickael.bandeira@aec.com.br', 'ADMIN', 'gerente', true)
ON CONFLICT (registration) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  cargo = EXCLUDED.cargo,
  hierarchy_level = EXCLUDED.hierarchy_level,
  is_active = true,
  updated_at = now();

