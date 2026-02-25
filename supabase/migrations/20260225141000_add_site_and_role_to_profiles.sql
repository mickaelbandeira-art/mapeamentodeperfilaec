-- Add site and role columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS site text,
ADD COLUMN IF NOT EXISTS role text;

-- Update the handle_new_user function to include role and site from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, matricula, role, site)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    new.raw_user_meta_data->>'matricula',
    COALESCE(new.raw_user_meta_data->>'role', 'visitor'),
    new.raw_user_meta_data->>'site'
  );
  RETURN new;
END;
$$;
