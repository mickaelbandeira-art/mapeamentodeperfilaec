-- ==========================================================
-- GLOBAL ACCESS SETUP: RPC UPDATE & MULTI-SITE DASHBOARD
-- ==========================================================

-- 1. Update search_participants to include filter_site and return site
CREATE OR REPLACE FUNCTION public.search_participants(
  search_text text DEFAULT NULL,
  filter_status text DEFAULT NULL,
  filter_cargo text DEFAULT NULL,
  filter_coordinator text DEFAULT NULL,
  filter_turma text DEFAULT NULL,
  filter_instructor_email text DEFAULT NULL,
  filter_site text DEFAULT NULL
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
  instructor_name text,
  site text
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
    tr.class_name, tr.instructor_name, p.site
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
    AND (filter_site IS NULL OR p.site = filter_site)
  ORDER BY p.name;
END;
$$;

-- 2. Grant Global Access to Mickael (site = NULL means access to all)
UPDATE public.profiles 
SET site = NULL 
WHERE email = 'mickael.bandeira@aec.com.br';

-- 3. Update dashboard_stats view to support site filtering
DROP VIEW IF EXISTS public.dashboard_stats;
CREATE OR REPLACE VIEW public.dashboard_stats 
WITH (security_invoker = true)
AS
WITH site_counts AS (
    SELECT 
        site,
        COUNT(*) as total_participants,
        COUNT(*) FILTER (WHERE registration IN (SELECT registration FROM test_results)) as total_completed_tests,
        COUNT(*) FILTER (WHERE registration NOT IN (SELECT registration FROM test_results)) as pending_tests
    FROM participants 
    WHERE is_active = true
    GROUP BY site
)
SELECT 
    site,
    total_participants,
    total_completed_tests,
    pending_tests,
    ROUND(total_completed_tests::numeric / NULLIF(total_participants, 0) * 100, 1) as completion_rate
FROM site_counts
UNION ALL
SELECT 
    NULL as site,
    SUM(total_participants)::int,
    SUM(total_completed_tests)::int,
    SUM(pending_tests)::int,
    ROUND(SUM(total_completed_tests)::numeric / NULLIF(SUM(total_participants), 0) * 100, 1)
FROM site_counts;
