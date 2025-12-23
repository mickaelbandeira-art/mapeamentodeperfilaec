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
