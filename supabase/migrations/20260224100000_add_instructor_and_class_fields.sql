-- Add new columns to test_results
ALTER TABLE public.test_results 
ADD COLUMN IF NOT EXISTS cpf text,
ADD COLUMN IF NOT EXISTS instructor_name text,
ADD COLUMN IF NOT EXISTS instructor_registration text,
ADD COLUMN IF NOT EXISTS instructor_email text,
ADD COLUMN IF NOT EXISTS class_name text;

-- Update search_participants function to include new filters
CREATE OR REPLACE FUNCTION public.search_participants(
  search_text text DEFAULT NULL,
  filter_status text DEFAULT NULL,
  filter_cargo text DEFAULT NULL,
  filter_coordinator text DEFAULT NULL,
  filter_turma text DEFAULT NULL,
  filter_instructor_email text DEFAULT NULL
)
RETURNS TABLE(
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
  score_c integer,
  class_name text,
  instructor_name text
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, p.registration, p.name, p.email, p.cargo, p.coordinator,
    (tr.id IS NOT NULL) as has_completed_test,
    tr.dominant_profile, tr.score_d, tr.score_i, tr.score_s, tr.score_c,
    tr.class_name, tr.instructor_name
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
    AND (filter_turma IS NULL OR tr.class_name = filter_turma)
    AND (filter_instructor_email IS NULL OR tr.instructor_email = filter_instructor_email)
  ORDER BY p.name;
END;
$$;
