-- ==============================================================================
-- ADD MANUAL PARTICIPANTS
-- ==============================================================================

-- Instruções de Uso:
-- 1. Adicione os participantes na lista de VALUES abaixo.
-- 2. Mantenha a estrutura: (matricula, nome, email, cargo, coordenador, nivel_hierarquico)
-- 3. O campo 'manager' será preenchido automaticamente como 'Jonathan Lins da Silva' se omitido.
-- 4. O campo 'is_active' será true por padrão.

INSERT INTO public.participants (
  registration,     -- Matrícula (Único)
  name,            -- Nome Completo
  email,           -- Email Corporativo
  cargo,           -- Cargo Atual
  coordinator,     -- Nome do Coordenador
  hierarchy_level  -- 'colaborador', 'supervisor', 'coordenador', 'gerente'
)
VALUES
  -- EXEMPLO 1: Colaborador
  ('123456', 'Nome do Colaborador 1', 'email1@aec.com.br', 'AGENTE DE ATENDIMENTO', 'Nome do Coordenador', 'colaborador'),
  
  -- EXEMPLO 2: Supervisor
  ('654321', 'Nome do Supervisor 1', 'email2@aec.com.br', 'SUPERVISOR DE ATENDIMENTO', 'Nome do Coordenador', 'supervisor'),

  -- ADICIONE SEUS NOVOS USUÁRIOS AQUI ABAIXO:
  ('000001', 'Novo Usuário A', 'novo.usuario.a@aec.com.br', 'CARGO A', 'COORDENADOR A', 'colaborador'),
  ('000002', 'Novo Usuário B', 'novo.usuario.b@aec.com.br', 'CARGO B', 'COORDENADOR B', 'colaborador')

-- Tratamento de conflitos:
-- Se a matrícula já existir, atualiza os dados (Nome, Email, Cargo e Coordenador).
ON CONFLICT (registration) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  cargo = EXCLUDED.cargo,
  coordinator = EXCLUDED.coordinator,
  hierarchy_level = EXCLUDED.hierarchy_level,
  updated_at = now();
