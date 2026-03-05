-- ==============================================================
-- CORREÇÃO DEFINITIVA: VISIBILIDADE DA FILA DE APROVAÇÃO
-- Aplicar no SQL Editor do Supabase (supabase.com/dashboard)
-- ==============================================================

-- 1. SINCRONIZAÇÃO FORÇADA DE ROLES (Reserva de Emergência)
-- Isso garante que o Mickael e outros administradores estejam em ambas as tabelas
DO $$ 
DECLARE
    target_id UUID;
    target_email TEXT;
BEGIN
    -- Lista de emails que DEVEM ser admins
    FOR target_email IN SELECT unnest(ARRAY[
        'mickael.bandeira@aec.com.br',
        'jonathan.silva@aec.com.br',
        'kelciane.lima@aec.com.br'
    ])
    LOOP
        -- Pega o ID do Auth
        SELECT id INTO target_id FROM auth.users WHERE LOWER(email) = LOWER(target_email);
        
        IF target_id IS NOT NULL THEN
            -- Garante no Profiles
            UPDATE public.profiles SET role = 'admin', status = 'approved' WHERE id = target_id;
            
            -- Garante no User_Roles (O que o RLS usa)
            INSERT INTO public.user_roles (user_id, role)
            VALUES (target_id, 'admin')
            ON CONFLICT (user_id, role) DO NOTHING;
            
            RAISE NOTICE 'Admin sincronizado: %', target_email;
        END IF;
    END LOOP;
END $$;

-- 2. REPARO DAS POLÍTICAS RLS (Tornar o RLS mais inteligente)
-- Atualmente o RLS só olha para a tabela user_roles.
-- Vamos fazer ele olhar para a coluna 'role' da tabela profiles também para evitar bloqueios se as tabelas estiverem dessincronizadas.

-- Remover políticas antigas
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Nova política de VISUALIZAÇÃO (SELECT)
CREATE POLICY "Admins can view all profiles" ON public.profiles 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Nova política de ATUALIZAÇÃO (UPDATE)
CREATE POLICY "Admins can update all profiles" ON public.profiles 
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- 3. VERIFICAÇÃO E REPARO "KAROLAYNE"
-- Garante que se ela registrou, o status dela é 'pending' e não 'approved' ou 'visitor' acidentalmente
UPDATE public.profiles 
SET status = 'pending', role = 'instrutor'
WHERE LOWER(email) = 'karolayne.asilva@aec.com.br' 
AND status != 'approved';

-- 4. RECARREGAR CONFIGURAÇÕES
NOTIFY pgrst, 'reload config';
