-- Inserir roles para os usuários administrativos
INSERT INTO public.user_roles (user_id, role) VALUES
  ('78326efa-baa0-45d8-a8ce-334c2675745d', 'admin'),    -- mickael.bandeira@aec.com.br
  ('24a4e4ba-598a-433d-9f84-2d87eab3b283', 'manager'),  -- jonathan.silva@aec.com.br
  ('6431f2f5-7f28-4af9-b194-67de0f23854c', 'manager'),  -- a.izaura.bezerra@aec.com.br
  ('3338eb8d-e42f-442d-8997-cdc62eb7b7e6', 'coordinator') -- kelciane.lima@aec.com.br
ON CONFLICT (user_id, role) DO NOTHING;

-- Criar profiles automáticos se não existirem
INSERT INTO public.profiles (id, email, full_name)
SELECT 
  u.id, 
  u.email, 
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1))
FROM auth.users u
WHERE u.id IN (
  '78326efa-baa0-45d8-a8ce-334c2675745d',
  '24a4e4ba-598a-433d-9f84-2d87eab3b283',
  '6431f2f5-7f28-4af9-b194-67de0f23854c',
  '3338eb8d-e42f-442d-8997-cdc62eb7b7e6'
)
ON CONFLICT (id) DO NOTHING;

-- Inserir participantes de exemplo para testar auto-preenchimento
INSERT INTO public.participants (registration, name, email, cargo, coordinator, hierarchy_level, manager, is_active) VALUES
  ('12345', 'João Silva', 'joao.silva@aec.com.br', 'Analista de Sistemas', 'Kelciane Lima', 'colaborador', 'Jonathan Lins da Silva', true),
  ('12346', 'Maria Santos', 'maria.santos@aec.com.br', 'Coordenadora de TI', 'Jonathan Lins da Silva', 'coordenador', 'Jonathan Lins da Silva', true),
  ('12347', 'Pedro Oliveira', 'pedro.oliveira@aec.com.br', 'Assistente Administrativo', 'Kelciane Lima', 'colaborador', 'Izaura Bezerra', true),
  ('12348', 'Ana Costa', 'ana.costa@aec.com.br', 'Gerente de Projetos', 'Izaura Bezerra', 'gerente', 'Jonathan Lins da Silva', true),
  ('12349', 'Carlos Mendes', 'carlos.mendes@aec.com.br', 'Desenvolvedor Senior', 'Maria Santos', 'colaborador', 'Jonathan Lins da Silva', true)
ON CONFLICT (registration) DO NOTHING;