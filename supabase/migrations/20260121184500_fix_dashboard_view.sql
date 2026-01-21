-- ==============================================================================
-- Fix Dashboard Stats View & Reload Schema
-- ==============================================================================

-- 1. Drop existing view to ensure clean slate
DROP VIEW IF EXISTS public.dashboard_stats;

-- 2. Recreate the view with explicit security invoker
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

-- 3. Grant Explicit Permissions
-- Important: Grant to 'authenticated' so logged-in admins can see it.
-- Also granting to 'service_role' just in case.
GRANT SELECT ON public.dashboard_stats TO authenticated;
GRANT SELECT ON public.dashboard_stats TO service_role;

-- 4. Reload PostgREST Schema Cache
-- This helps Supabase API pick up the changes immediately.
NOTIFY pgrst, 'reload config';
