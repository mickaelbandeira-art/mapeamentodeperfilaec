-- ==========================================================
-- SQL FIX-ALL: RLS POLICIES, TRIGGER REPAIR & ADMIN SEEDING
-- ==========================================================

-- 1. Ensure Columns Exist in public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS site text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cargo text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS matricula text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approval_comment text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approved_at timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id);

-- 2. Enable & Configure RLS (THIS IS CRITICAL)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile (e.g. avatar, basic info)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Allow admins to view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admins to update all profiles (for approval logic)
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 3. Fix the Trigger Function (handle_new_user)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, full_name, email, matricula, cargo, site, role, status
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
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    matricula = EXCLUDED.matricula,
    cargo = EXCLUDED.cargo,
    site = EXCLUDED.site,
    role = EXCLUDED.role;
  
  -- Add role to user_roles table
  IF new.raw_user_meta_data->>'role' IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, (new.raw_user_meta_data->>'role')::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN new;
END;
$$;

-- 4. Sync Profiles for Existing Auth Users
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

-- 5. THE MICKAEL FIX: Force Admin Approval
DO $$ 
DECLARE
  target_user_id uuid;
BEGIN
  -- Search by email in auth.users
  SELECT id INTO target_user_id FROM auth.users WHERE email = 'mickael.bandeira@aec.com.br' LIMIT 1;
  
  IF target_user_id IS NOT NULL THEN
    -- Upsert profile with correct data
    INSERT INTO public.profiles (id, full_name, email, role, status, site, matricula, cargo)
    VALUES (
      target_user_id, 'Mickael Bandeira da Silva', 'mickael.bandeira@aec.com.br', 
      'admin', 'approved', 'ARP3', '461576', 'ADMIN'
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'admin', status = 'approved', site = 'ARP3', matricula = '461576', cargo = 'ADMIN';

    -- Ensure admin role is in user_roles
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Mickael Bandeira fixed.';
  END IF;
END $$;
