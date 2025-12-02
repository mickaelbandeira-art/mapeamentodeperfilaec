-- =====================================================
-- ADICIONAR COLUNAS DE AFASTAMENTO E INSERIR 10 NOVOS PARTICIPANTES
-- =====================================================

-- Parte 1: Adicionar novas colunas para informações de afastamento
ALTER TABLE public.participants 
ADD COLUMN IF NOT EXISTS leave_type text,
ADD COLUMN IF NOT EXISTS return_date date,
ADD COLUMN IF NOT EXISTS operation_origin text;

-- Comentários para documentação
COMMENT ON COLUMN public.participants.leave_type IS 'Tipo de afastamento: LICENÇA MATERNIDADE, AUXILIO DOENCA, etc.';
COMMENT ON COLUMN public.participants.return_date IS 'Data prevista de retorno do afastamento';
COMMENT ON COLUMN public.participants.operation_origin IS 'Operação de origem do funcionário';

-- Parte 2: Inserir os 10 novos participantes afastados
INSERT INTO public.participants 
  (registration, name, email, cargo, supervisor, coordinator, manager, 
   hierarchy_level, is_active, leave_type, return_date, operation_origin)
VALUES
  ('157257', 'ANGELA MARIA DOS SANTOS', 'disc@aec.com.br', 
   'ATENDENTE', NULL, 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 
   'colaborador', false, 'LICENÇA MATERNIDADE', '2025-10-17', 'NET_CRC_CM_HFC+DTH'),
   
  ('226802', 'ELISANGELA MARIA DE FARIAS MOURA', 'disc@aec.com.br', 
   'ATENDENTE', NULL, 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 
   'colaborador', false, 'AUXILIO DOENCA', '2025-11-15', 'CLARO_MOVEL_CONTROLE_NIVEL_I'),
   
  ('366717', 'ANDREIA FORTUNATO SILVA', 'disc@aec.com.br', 
   'ATENDENTE', NULL, 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 
   'colaborador', false, 'LICENÇA MATERNIDADE', '2025-11-26', 'CLARO_MOVEL_CONTROLE_SERVICE_TO_SALES'),
   
  ('277692', 'SANDRA MARQUES DE OLIVEIRA', 'disc@aec.com.br', 
   'ATENDENTE', NULL, 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 
   'colaborador', false, 'LICENÇA MATERNIDADE', '2025-11-29', 'IFOOD_CX_POS_ENTREGA'),
   
  ('411030', 'HUDSON KLEITON DA SILVA', 'disc@aec.com.br', 
   'ATENDENTE', NULL, 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 
   'colaborador', false, 'AUXILIO DOENCA', '2025-11-27', 'IFOOD_RX_CHAT_N1'),
   
  ('382766', 'EWERTON MENDES DE LIMA', 'disc@aec.com.br', 
   'ATENDENTE', NULL, 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 
   'colaborador', false, 'AUXILIO DOENCA', '2025-11-28', 'BANCO_INTER_EMPRESTIMOS_VOZ'),
   
  ('426765', 'JOSE RODRIGO DE OLIVEIRA SANTOS', 'disc@aec.com.br', 
   'ATENDENTE', NULL, 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 
   'colaborador', false, 'AUXILIO DOENCA', '2025-12-01', 'CLARO_MOVEL_CONTROLE_NIVEL_I'),
   
  ('316693', 'ANIE KARINE CANUTO ALVES DE LIMA', 'disc@aec.com.br', 
   'ATENDENTE', NULL, 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 
   'colaborador', false, 'AUXILIO DOENCA', '2025-11-08', NULL),
   
  ('214605', 'JAIRA MARIANA OLIVEIRA DINIZ', 'disc@aec.com.br', 
   'ATENDENTE', NULL, 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 
   'colaborador', false, 'LICENÇA MATERNIDADE', '2025-12-01', 'CLARO_MOVEL_RETENCAO_ATIVA_PORT_RECEPTIVO'),
   
  ('352103', 'DEISIANNY CRISTIANNY DA CONCEICAO DANTAS', 'disc@aec.com.br', 
   'ATENDENTE', NULL, 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 
   'colaborador', false, 'LICENÇA MATERNIDADE', '2025-12-02', 'CLARO_MOVEL_CRC')
   
ON CONFLICT (registration) DO UPDATE SET
  name = EXCLUDED.name,
  leave_type = EXCLUDED.leave_type,
  return_date = EXCLUDED.return_date,
  operation_origin = EXCLUDED.operation_origin,
  is_active = EXCLUDED.is_active,
  updated_at = now();