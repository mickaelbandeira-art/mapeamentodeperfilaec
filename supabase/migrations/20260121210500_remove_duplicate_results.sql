-- ==============================================================================
-- REMOVE DUPLICATE RESULTS
-- ==============================================================================

-- Delete all test_results that are NOT the latest one for a given registration
DELETE FROM public.test_results
WHERE id NOT IN (
  SELECT DISTINCT ON (registration) id
  FROM public.test_results
  ORDER BY registration, completed_at DESC, id DESC
);

-- Optional: Add a unique constraint to prevent future duplicates (if desired business rule)
-- ALTER TABLE public.test_results ADD CONSTRAINT unique_latest_result_per_registration UNIQUE (registration, completed_at);
