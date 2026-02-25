-- Create application status type if it doesn't exist
-- Using text for simplicity and flexibility in this phase

-- Add status column to profiles with default 'pending'
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Add approval_comment and approved_at for better audit
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS approval_comment text,
ADD COLUMN IF NOT EXISTS approved_at timestamptz,
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id);

-- Update handle_new_user to capture registration details
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
    'pending'
  );
  
  -- Automatically assign the role in user_roles table if provided
  IF new.raw_user_meta_data->>'role' IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, (new.raw_user_meta_data->>'role')::public.app_role)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN new;
END;
$$;
