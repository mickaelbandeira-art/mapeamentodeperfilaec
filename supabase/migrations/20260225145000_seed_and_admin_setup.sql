-- 1. Ensure 'site' column exists in participants
ALTER TABLE public.participants 
ADD COLUMN IF NOT EXISTS site text;

-- 2. Insert/Update participants with site info
INSERT INTO public.participants (registration, name, email, cargo, coordinator, hierarchy_level, site, is_active)
VALUES
  ('134187', 'JONATHAN LINS DA SILVA', 'jonathan.silva@aec.com.br', 'GERENTE', 'JONATHAN LINS DA SILVA', 'gerente', 'ARP1', true),
  ('227625', 'KELCIANE CAVALCANTE DE LIMA', 'kelciane.lima@aec.com.br', 'COORDENADOR', 'JONATHAN LINS DA SILVA', 'coordenador', 'ARP1', true),
  ('261064', 'IZAURA DE ARAUJO BEZERRA', 'a.izaura.bezerrra@aec.com.br', 'COORDENADOR', 'JONATHAN LINS DA SILVA', 'coordenador', 'ARP1', true),
  ('461576', 'Mickael Bandeira da Silva', 'mickael.bandeira@aec.com.br', 'ADMIN', 'JONATHAN LINS DA SILVA', 'gerente', 'ARP3', true)
ON CONFLICT (registration) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  cargo = EXCLUDED.cargo,
  hierarchy_level = EXCLUDED.hierarchy_level,
  site = EXCLUDED.site,
  is_active = true,
  updated_at = now();

-- 3. Grant Admin Access to Mickael in profiles and user_roles
DO $$ 
DECLARE
  target_user_id uuid;
BEGIN
  -- We look for the profile by email
  SELECT id INTO target_user_id FROM public.profiles WHERE email = 'mickael.bandeira@aec.com.br' LIMIT 1;
  
  IF target_user_id IS NOT NULL THEN
    -- Update profile to admin and approved
    UPDATE public.profiles 
    SET role = 'admin', 
        status = 'approved',
        site = 'ARP3'
    WHERE id = target_user_id;
    
    -- Ensure entry in user_roles exists
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Admin access granted to user with ID %', target_user_id;
  ELSE
    RAISE WARNING 'User with email mickael.bandeira@aec.com.br not found in profiles table. Please register first.';
  END IF;
END $$;
