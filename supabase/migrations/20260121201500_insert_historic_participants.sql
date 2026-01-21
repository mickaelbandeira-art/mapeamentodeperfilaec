-- ==============================================================================
-- INSERT HISTORIC PARTICIPANTS (Extracted from 20251223134500)
-- ==============================================================================

INSERT INTO public.participants (registration, name, email, cargo, coordinator, hierarchy_level)
VALUES 
  ('297437', 'Danilo Bezerra dos santos silva ', 'a.danilo.bsantos@if-aec.com.br', 'COLABORADOR', 'A DEFINIR', 'colaborador'),
  ('257551', 'Ayrlla Alves Da Silva ', 'a.ayrlla.silva@if-aec.com.br', 'COLABORADOR', 'A DEFINIR', 'colaborador'),
  ('263660', 'Larissa Feitosa Silva Reis', 'larissafeitosa2084@gmail.com', 'COLABORADOR', 'A DEFINIR', 'colaborador'),
  ('364656', 'Fernanda Maria Leandro Rodrigues ', 'fernanda.lrodrigues@aec.com.br', 'COLABORADOR', 'A DEFINIR', 'colaborador'),
  ('260534', 'Patrícya Viviane Amaral castro ', 'a.patricya.castro@if-aec.com.br', 'COLABORADOR', 'A DEFINIR', 'colaborador'),
  ('303768', 'Ana Kivia Ferreira Lima', 'ana.lima@if-aec.com.br', 'COLABORADOR', 'A DEFINIR', 'colaborador'),
  ('273054', 'Vitória maria da gama', 'vitoria.ma98528100@gmail.com', 'COLABORADOR', 'A DEFINIR', 'colaborador'),
  ('274217', 'Erica Barbosa dos santos', 'a.erica.bsantos@if-aec.com.br', 'COLABORADOR', 'A DEFINIR', 'colaborador'),
  ('300691', 'Maria laise barbosa alves', 'laiseeisaac@gmail.com', 'COLABORADOR', 'A DEFINIR', 'colaborador'),
  ('165959', 'MYLLENA FERREIRA MIRANDA', 'myllena.miranda@aec.com.br', 'COLABORADOR', 'A DEFINIR', 'colaborador')
ON CONFLICT (registration) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  cargo = EXCLUDED.cargo,
  coordinator = EXCLUDED.coordinator,
  hierarchy_level = EXCLUDED.hierarchy_level,
  updated_at = now();

-- Update links to test_results if they exist
UPDATE test_results
SET participant_id = participants.id
FROM participants
WHERE test_results.registration = participants.registration
AND test_results.participant_id IS NULL;
