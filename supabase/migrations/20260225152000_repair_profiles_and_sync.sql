-- 1. Ensure the trigger function is correct and robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    email, 
    matricula, 
    cargo,
    site, 
    role, 
    status
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'matricula',
    new.raw_user_meta_data->>'cargo',
    new.raw_user_meta_data->>'site',
    COALESCE(new.raw_user_meta_data->>'role', 'visitor'),
    COALESCE(new.raw_user_meta_data->>'status', 'pending')
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- If there's a role in metadata, also add to user_roles
  IF new.raw_user_meta_data->>'role' IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, (new.raw_user_meta_data->>'role')::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN new;
END;
$$;

-- 2. Re-create the trigger to ensure it's active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. SYNC: Create profiles for existing users who are missing one
INSERT INTO public.profiles (id, full_name, email, status, role)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)), 
  email,
  'pending',
  'visitor'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 4. FORCE FIX: Make Mickael an approved Admin
DO $$ 
DECLARE
  target_user_id uuid;
BEGIN
  -- Find the specific user
  SELECT id INTO target_user_id FROM auth.users WHERE email = 'mickael.bandeira@aec.com.br' LIMIT 1;
  
  IF target_user_id IS NOT NULL THEN
    -- Ensure profile exists and is updated
    INSERT INTO public.profiles (id, full_name, email, role, status, site, matricula, cargo)
    VALUES (
      target_user_id, 
      'Mickael Bandeira da Silva', 
      'mickael.bandeira@aec.com.br', 
      'admin', 
      'approved', 
      'ARP3', 
      '461576', 
      'ADMIN'
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'admin',
      status = 'approved',
      site = 'ARP3',
      matricula = '461576',
      cargo = 'ADMIN';

    -- Ensure Admin Role is assigned
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Mickael Bandeira fixed and promoted to Admin.';
  ELSE
    RAISE WARNING 'Mickael Bandeira email not found in auth.users. Please sign up first.';
  END IF;
END $$;
