-- Make email column nullable in participants and test_results tables
ALTER TABLE public.participants ALTER COLUMN email DROP NOT NULL;
ALTER TABLE public.test_results ALTER COLUMN email DROP NOT NULL;

-- Notify schema reload
NOTIFY pgrst, 'reload schema';
