-- Migration to add missing participants who have test results but no participant record
-- and link their test results to the new participant records.

-- 1. Insert missing participants
INSERT INTO participants (registration, name, email, cargo, coordinator, hierarchy_level)
VALUES 
  ('411017', 'Emily Maiara Melchiades Martins Melo', 'emilly.maiara@if-aec.com.br', 'COLABORADOR', 'A DEFINIR', 'colaborador'),
  ('364514', 'Wesley de Araujo Silva', 'wesley.daraujo@aec.com.br', 'COLABORADOR', 'A DEFINIR', 'colaborador'),
  ('294982', 'Cauê Porfírio dos Santos', 'caueporfirio25@gmail.com', 'COLABORADOR', 'A DEFINIR', 'colaborador'),
  ('410992', 'Wesley Adrian Oliveira dos Santos', 'wesley.oliveira@aec.com.br', 'COLABORADOR', 'A DEFINIR', 'colaborador')
ON CONFLICT (registration) DO NOTHING;

-- 2. Link test results to the new participants
UPDATE test_results
SET participant_id = participants.id
FROM participants
WHERE test_results.registration = participants.registration
AND test_results.participant_id IS NULL
AND participants.registration IN ('411017', '364514', '294982', '410992');
