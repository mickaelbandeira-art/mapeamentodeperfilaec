-- =====================================================
-- POPULAR BANCO DE DADOS - Sistema DISC AeC
-- Total: 71 participantes + 67 resultados de testes
-- =====================================================

-- 1. Limpar dados de exemplo anteriores
DELETE FROM public.test_results WHERE registration IN ('12345', '12346', '12347', '12348', '12349');
DELETE FROM public.participants WHERE registration IN ('12345', '12346', '12347', '12348', '12349');

-- 2. Inserir todos os 71 participantes (SEM DUPLICATAS)
INSERT INTO public.participants 
  (registration, name, email, network_login, cargo, supervisor, coordinator, manager, hierarchy_level, is_active)
VALUES
  -- NÍVEL 1: GERENTE
  ('134187', 'JONATHAN LINS DA SILVA', 'jonathan.silva@aec.com.br', 'jonathan.silva', 'GERENTE DE PESSOAS III', NULL, 'JONATHAN LINS DA SILVA', 'Jonathan Lins da Silva', 'gerente', true),
  
  -- NÍVEL 2: COORDENADORES
  ('241064', 'IZAURA DE ARAUJO BEZERRA', 'a.izaura.bezerra@aec.com.br', 'a.izaura.bezerra', 'COORDENADOR DE PESSOAS II', NULL, 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'coordenador', true),
  ('227625', 'KELCIANE CAVALCANTE DE LIMA', 'kelciane.lima@aec.com.br', 'kelciane.lima', 'COORDENADOR DE PESSOAS I', NULL, 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'coordenador', true),
  ('241033', 'WILLAMES VIEIRA DE OLIVEIRA JUNIOR', 'willames.junior@aec.com.br', 'willames.junior', 'COORDENADOR ACADEMICO DE ENSINO', NULL, 'WILLAMES VIEIRA DE OLIVEIRA JUNIOR', 'Jonathan Lins da Silva', 'coordenador', true),
  
  -- NÍVEL 3: SUPERVISORES
  ('268126', 'ELIELZA KAROLYNE DOS SANTOS', 'a.elielza.santos@aec.com.br', 'a.elielza.santos', 'SUPERVISOR DE PESSOAS JUNIOR', NULL, 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'supervisor', true),
  ('211199', 'JULIO CESAR ALVES DA SILVA SANTOS', 'a.julio.cesar@aec.com.br', 'a.julio.cesar', 'SUPERVISOR DE PESSOAS JUNIOR', NULL, 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'supervisor', true),
  ('225756', 'MARIA CLARA DA SILVA SANTOS', 'a.maria.clara@aec.com.br', 'a.maria.clara', 'SUPERVISOR DE PESSOAS JUNIOR', NULL, 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'supervisor', true),
  ('281726', 'MARIANA PEREIRA VERAS', 'a.mariana.veras@aec.com.br', 'a.mariana.veras', 'SUPERVISOR DE PESSOAS JUNIOR', NULL, 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'supervisor', true),
  ('333076', 'PAULO GUILHERME DOS ANJOS CASTILIANI', 'paulo.castiliani@aec.com.br', 'paulo.castiliani', 'SUPERVISOR DE OPERACAO', NULL, 'WILLAMES VIEIRA DE OLIVEIRA JUNIOR', 'Jonathan Lins da Silva', 'supervisor', true),
  ('287661', 'SILVIA RAFAELA SANTOS SILVA', 'a.silvia.santos@aec.com.br', 'a.silvia.santos', 'SUPERVISOR DE PESSOAS JUNIOR', NULL, 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'supervisor', true),
  
  -- NÍVEL 4: COLABORADORES (61 participantes)
  ('226610', 'AMANDA LIMA LINO', 'a.amanda.lino@aec.com.br', 'a.amanda.lino', 'INSTRUTOR DE TREINAMENTO', 'MARIA CLARA DA SILVA SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('355042', 'AMANDA MARIA LIMA PRAXEDES', 'amanda.praxedes@aec.com.br', 'amanda.praxedes', 'INSTRUTOR DE TREINAMENTO', 'MARIANA PEREIRA VERAS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('359193', 'ANA CAROLINA SILVA DOS SANTOS', 'ana.casantos@aec.com.br', 'ana.casantos', 'INSTRUTOR DE TREINAMENTO', 'MARIA CLARA DA SILVA SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('394527', 'ANA PAULA SANTOS FERREIRA', 'ana.psferreira@aec.com.br', 'ana.psferreira', 'INSTRUTOR DE TREINAMENTO', 'ELIELZA KAROLYNE DOS SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('328279', 'BRUNO DOMINGOS LEAO SILVA BARBOSA', 'bruno.barbosa@aec.com.br', 'bruno.barbosa', 'INSTRUTOR DE TREINAMENTO', 'MARIANA PEREIRA VERAS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('359254', 'BRUNO HENRIQUE MUNIZ DA SILVA', 'bruno.hmsilva@aec.com.br', 'bruno.hmsilva', 'INSTRUTOR DE TREINAMENTO', 'JULIO CESAR ALVES DA SILVA SANTOS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('296317', 'CAMILA VIEIRA DELGADO DE OLIVEIRA', 'camila.oliveira@aec.com.br', 'camila.oliveira', 'INSTRUTOR DE TREINAMENTO', 'MARIA CLARA DA SILVA SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('292530', 'CARLOS EDUARDO SILVA DE OLIVEIRA', 'carlos.eoliveira@aec.com.br', 'carlos.eoliveira', 'INSTRUTOR DE TREINAMENTO', 'ELIELZA KAROLYNE DOS SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('296216', 'CICERO JOSE DE SOUZA', 'a.cicero.souza@aec.com.br', 'a.cicero.souza', 'INSTRUTOR DE TREINAMENTO', 'MARIA CLARA DA SILVA SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('359117', 'CICERO PEREIRA LEITE', 'cicero.leite@aec.com.br', 'cicero.leite', 'INSTRUTOR DE TREINAMENTO', 'MARIANA PEREIRA VERAS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('359290', 'DAVI ALEXANDRE DANTAS SANTOS', 'davi.asantos@aec.com.br', 'davi.asantos', 'INSTRUTOR DE TREINAMENTO', 'MARIANA PEREIRA VERAS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('292448', 'EDNALDO CANDIDO DA SILVA', 'ednaldo.silva@aec.com.br', 'ednaldo.silva', 'INSTRUTOR DE TREINAMENTO', 'MARIANA PEREIRA VERAS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('359300', 'EDUARDA MARIA SILVA GOMES', 'eduarda.gomes@aec.com.br', 'eduarda.gomes', 'INSTRUTOR DE TREINAMENTO', 'JULIO CESAR ALVES DA SILVA SANTOS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('347160', 'FERNANDO HENRIQUE BARROS DA SILVA', 'fernando.hsilva@aec.com.br', 'fernando.hsilva', 'INSTRUTOR DE TREINAMENTO', 'MARIANA PEREIRA VERAS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('246095', 'FRANCIMERY XAVIER DA SILVA', 'a.francimery.silva@aec.com.br', 'a.francimery.silva', 'INSTRUTOR DE TREINAMENTO', 'ELIELZA KAROLYNE DOS SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('359245', 'GABRIEL VINICIUS MARQUES BARRETO', 'gabriel.barreto@aec.com.br', 'gabriel.barreto', 'INSTRUTOR DE TREINAMENTO', 'ELIELZA KAROLYNE DOS SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('267910', 'GUILHERME MELO DE SOUZA', 'a.guilherme.souza@aec.com.br', 'a.guilherme.souza', 'INSTRUTOR DE TREINAMENTO', 'MARIA CLARA DA SILVA SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('210515', 'IANNA DA COSTA ALMEIDA', 'ianna.almeida@aec.com.br', 'ianna.almeida', 'INSTRUTOR DE TREINAMENTO', 'MARIANA PEREIRA VERAS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('307399', 'JAINE DA SILVA SANTOS', 'jaine.santos@aec.com.br', 'jaine.santos', 'INSTRUTOR DE TREINAMENTO', 'JULIO CESAR ALVES DA SILVA SANTOS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('331058', 'JANDSON JUNIOR DA SILVA', 'jandson.silva@aec.com.br', 'jandson.silva', 'INSTRUTOR DE TREINAMENTO', 'MARIA CLARA DA SILVA SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('391860', 'JAQUELINE MARIA LAURINDO', 'jaqueline.laurindo@aec.com.br', 'jaqueline.laurindo', 'ANALISTA DE CONTEUDO JUNIOR', 'PAULO GUILHERME DOS ANJOS CASTILIANI', 'WILLAMES VIEIRA DE OLIVEIRA JUNIOR', 'Jonathan Lins da Silva', 'colaborador', true),
  ('274071', 'JESSICA BEATRIZ DA SILVA OLIVEIRA', 'jessica.boliveira@aec.com.br', 'jessica.boliveira', 'INSTRUTOR DE TREINAMENTO', 'MARIANA PEREIRA VERAS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('240745', 'JOAO PAULO SILVA DE OLIVEIRA', 'a.joao.paulo@aec.com.br', 'a.joao.paulo', 'INSTRUTOR DE TREINAMENTO', 'ELIELZA KAROLYNE DOS SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('359232', 'JOSE ANDERSON TEIXEIRA DA SILVA', 'anderson.tsilva@aec.com.br', 'anderson.tsilva', 'INSTRUTOR DE TREINAMENTO', 'ELIELZA KAROLYNE DOS SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('395270', 'JOSE GABRIEL INACIO SILVA', 'gabriel.isilva@aec.com.br', 'gabriel.isilva', 'INSTRUTOR DE TREINAMENTO', 'JULIO CESAR ALVES DA SILVA SANTOS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('359264', 'JOSE GIVALDO DA SILVA REGO', 'givaldo.rego@aec.com.br', 'givaldo.rego', 'INSTRUTOR DE TREINAMENTO', 'MARIANA PEREIRA VERAS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('155494', 'JOSE RODRIGO SANTOS SILVA', 'rodrigo.ssilva@aec.com.br', 'rodrigo.ssilva', 'ANALISTA DE CONTEUDO JUNIOR', 'PAULO GUILHERME DOS ANJOS CASTILIANI', 'WILLAMES VIEIRA DE OLIVEIRA JUNIOR', 'Jonathan Lins da Silva', 'colaborador', true),
  ('359279', 'JUAN PABLO OLIVEIRA DO NASCIMENTO', 'juan.nascimento@aec.com.br', 'juan.nascimento', 'INSTRUTOR DE TREINAMENTO', 'ELIELZA KAROLYNE DOS SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('359260', 'KAIO CESAR SANTOS DA SILVA', 'kaio.csilva@aec.com.br', 'kaio.csilva', 'INSTRUTOR DE TREINAMENTO', 'MARIA CLARA DA SILVA SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('230569', 'KAROLINNE MARIA SILVA DE OLIVEIRA', 'a.karolinne.oliveira@aec.com.br', 'a.karolinne.oliveira', 'ANALISTA DE CONTEUDO JUNIOR', 'PAULO GUILHERME DOS ANJOS CASTILIANI', 'WILLAMES VIEIRA DE OLIVEIRA JUNIOR', 'Jonathan Lins da Silva', 'colaborador', true),
  ('391941', 'LARA GUEDES DE ARAUJO', 'lara.araujo@aec.com.br', 'lara.araujo', 'INSTRUTOR DE TREINAMENTO', 'MARIA CLARA DA SILVA SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('316539', 'LARYSSA ALVES DE SA SILVA', 'laryssa.silva@aec.com.br', 'laryssa.silva', 'ANALISTA DE CONTEUDO JUNIOR', 'PAULO GUILHERME DOS ANJOS CASTILIANI', 'WILLAMES VIEIRA DE OLIVEIRA JUNIOR', 'Jonathan Lins da Silva', 'colaborador', true),
  ('313947', 'LEANDRO DE ABREU OLIVEIRA', 'leandro.oliveira@aec.com.br', 'leandro.oliveira', 'ANALISTA DE CONTEUDO JUNIOR', 'PAULO GUILHERME DOS ANJOS CASTILIANI', 'WILLAMES VIEIRA DE OLIVEIRA JUNIOR', 'Jonathan Lins da Silva', 'colaborador', true),
  ('280951', 'LUAN CARLOS SILVA BATISTA', 'luan.batista@aec.com.br', 'luan.batista', 'INSTRUTOR DE TREINAMENTO', 'MARIANA PEREIRA VERAS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('257923', 'MARCELO JOSE FERREIRA DA SILVA', 'a.marcelo.silva@aec.com.br', 'a.marcelo.silva', 'ANALISTA DE CONTEUDO JUNIOR', 'PAULO GUILHERME DOS ANJOS CASTILIANI', 'WILLAMES VIEIRA DE OLIVEIRA JUNIOR', 'Jonathan Lins da Silva', 'colaborador', true),
  ('418749', 'MARIA CLARA DOS SANTOS', 'maria.csantos@aec.com.br', 'maria.csantos', 'ANALISTA DE PESSOAS JUNIOR', 'SILVIA RAFAELA SANTOS SILVA', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('257931', 'MARIA LUIZA FURTADO BEZERRA', 'a.maria.luiza@aec.com.br', 'a.maria.luiza', 'ANALISTA DE CONTEUDO JUNIOR', 'PAULO GUILHERME DOS ANJOS CASTILIANI', 'WILLAMES VIEIRA DE OLIVEIRA JUNIOR', 'Jonathan Lins da Silva', 'colaborador', true),
  ('336920', 'MARIANA ALVES DE OLIVEIRA', 'mariana.aoliveira@aec.com.br', 'mariana.aoliveira', 'INSTRUTOR DE TREINAMENTO', 'JULIO CESAR ALVES DA SILVA SANTOS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('349518', 'MARIANNE OLIVEIRA RAMOS', 'marianne.ramos@aec.com.br', 'marianne.ramos', 'INSTRUTOR DE TREINAMENTO', 'ELIELZA KAROLYNE DOS SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('200972', 'MIKAEL DE SA FERREIRA', 'a.mikael.ferreira@aec.com.br', 'a.mikael.ferreira', 'INSTRUTOR DE TREINAMENTO', 'MARIA CLARA DA SILVA SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('316490', 'PEDRO DE ALBUQUERQUE LINS', 'pedro.lins@aec.com.br', 'pedro.lins', 'INSTRUTOR DE TREINAMENTO', 'JULIO CESAR ALVES DA SILVA SANTOS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('311634', 'PEDRO HENRIQUE SILVA SANTANA', 'pedro.santana@aec.com.br', 'pedro.santana', 'INSTRUTOR DE TREINAMENTO', 'ELIELZA KAROLYNE DOS SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('359225', 'PETERSON RODRIGUES DA SILVA', 'peterson.silva@aec.com.br', 'peterson.silva', 'INSTRUTOR DE TREINAMENTO', 'MARIANA PEREIRA VERAS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('273783', 'RAIANE DA SILVA MARQUES', 'a.raiane.marques@aec.com.br', 'a.raiane.marques', 'INSTRUTOR DE TREINAMENTO', 'JULIO CESAR ALVES DA SILVA SANTOS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('304166', 'RAPHAELA MARIA PINTO DE OLIVEIRA', 'raphaela.oliveira@aec.com.br', 'raphaela.oliveira', 'INSTRUTOR DE TREINAMENTO', 'MARIA CLARA DA SILVA SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('359315', 'RENAN BARBOSA SANTOS', 'renan.bsantos@aec.com.br', 'renan.bsantos', 'INSTRUTOR DE TREINAMENTO', 'ELIELZA KAROLYNE DOS SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('264886', 'RENATO ANTONIO VERAS DA SILVA', 'a.renato.silva@aec.com.br', 'a.renato.silva', 'INSTRUTOR DE TREINAMENTO', 'MARIA CLARA DA SILVA SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('284289', 'RICARDO JOSE DA SILVA', 'ricardo.jsilva@aec.com.br', 'ricardo.jsilva', 'INSTRUTOR DE TREINAMENTO', 'JULIO CESAR ALVES DA SILVA SANTOS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('292356', 'SANDRO JOSE DA SILVA', 'sandro.silva@aec.com.br', 'sandro.silva', 'INSTRUTOR DE TREINAMENTO', 'ELIELZA KAROLYNE DOS SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('359289', 'SARA GOMES VICENTE', 'sara.vicente@aec.com.br', 'sara.vicente', 'INSTRUTOR DE TREINAMENTO', 'JULIO CESAR ALVES DA SILVA SANTOS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('359152', 'SOFIA ISABEL DE MELO OLIVEIRA', 'sofia.oliveira@aec.com.br', 'sofia.oliveira', 'INSTRUTOR DE TREINAMENTO', 'JULIO CESAR ALVES DA SILVA SANTOS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('334715', 'STEPHANI MARIA LIMA DE ANDRADE', 'stephani.andrade@aec.com.br', 'stephani.andrade', 'INSTRUTOR DE TREINAMENTO', 'ELIELZA KAROLYNE DOS SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('261064', 'TARCILA RAYANE DIAS RODRIGUES', 'tarcila.rodrigues@aec.com.br', 'tarcila.rodrigues', 'INSTRUTOR DE TREINAMENTO', 'MARIANA PEREIRA VERAS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('402592', 'THAIS RODRIGUES CARVALHO', 'thais.carvalho@aec.com.br', 'thais.carvalho', 'ASSISTENTE DE PESSOAS', 'SILVIA RAFAELA SANTOS SILVA', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('316440', 'THAISA MARIA DOS SANTOS SILVA', 'thaisa.silva@aec.com.br', 'thaisa.silva', 'INSTRUTOR DE TREINAMENTO', 'MARIA CLARA DA SILVA SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('395548', 'THAYANNE TELES DE OLIVEIRA', 'thayanne.oliveira@aec.com.br', 'thayanne.oliveira', 'ANALISTA DE PESSOAS JUNIOR', 'SILVIA RAFAELA SANTOS SILVA', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('300373', 'VALDIANA DA SILVA SANTOS', 'valdiana.santos@aec.com.br', 'valdiana.santos', 'INSTRUTOR DE TREINAMENTO', 'MARIANA PEREIRA VERAS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('257961', 'VANDEBERG AURELIO DOS SANTOS', 'a.vandeberg.santos@aec.com.br', 'a.vandeberg.santos', 'INSTRUTOR DE TREINAMENTO', 'JULIO CESAR ALVES DA SILVA SANTOS', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('284238', 'VITOR CORDEIRO DE OLIVEIRA', 'vitor.oliveira@aec.com.br', 'vitor.oliveira', 'INSTRUTOR DE TREINAMENTO', 'MARIA CLARA DA SILVA SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('395415', 'YASMIN MARIA SANTOS', 'yasmin.santos@aec.com.br', 'yasmin.santos', 'INSTRUTOR DE TREINAMENTO', 'ELIELZA KAROLYNE DOS SANTOS', 'KELCIANE CAVALCANTE DE LIMA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('263044', 'YVSON VIEIRA SILVA', 'a.yvson.silva@aec.com.br', 'a.yvson.silva', 'AUXILIAR DE PESSOAS', 'SILVIA RAFAELA SANTOS SILVA', 'IZAURA DE ARAUJO BEZERRA', 'Jonathan Lins da Silva', 'colaborador', true),
  ('323093', 'YURI JONAS SILVA NUNES', 'yuri.nunes@aec.com.br', 'yuri.nunes', 'ANALISTA DE CONTEUDO JUNIOR', 'PAULO GUILHERME DOS ANJOS CASTILIANI', 'WILLAMES VIEIRA DE OLIVEIRA JUNIOR', 'Jonathan Lins da Silva', 'colaborador', true)
  
ON CONFLICT (registration) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  network_login = EXCLUDED.network_login,
  cargo = EXCLUDED.cargo,
  supervisor = EXCLUDED.supervisor,
  coordinator = EXCLUDED.coordinator,
  manager = EXCLUDED.manager,
  hierarchy_level = EXCLUDED.hierarchy_level,
  updated_at = now();

-- 3. Inserir os 67 resultados de testes completados
INSERT INTO public.test_results 
  (registration, name, email, score_d, score_i, score_s, score_c, dominant_profile, completed_at)
VALUES
  ('226610', 'AMANDA LIMA LINO', 'a.amanda.lino@aec.com.br', 9, 2, 10, 9, 'S', '2025-11-10 10:01:49'::timestamp),
  ('355042', 'AMANDA MARIA LIMA PRAXEDES', 'amanda.praxedes@aec.com.br', 9, 10, 8, 3, 'I', '2025-11-10 09:45:47'::timestamp),
  ('359193', 'ANA CAROLINA SILVA DOS SANTOS', 'ana.casantos@aec.com.br', 10, 3, 11, 6, 'S', '2025-11-10 10:08:14'::timestamp),
  ('394527', 'ANA PAULA SANTOS FERREIRA', 'ana.psferreira@aec.com.br', 5, 10, 8, 7, 'I', '2025-11-10 09:19:43'::timestamp),
  ('359254', 'BRUNO HENRIQUE MUNIZ DA SILVA', 'bruno.hmsilva@aec.com.br', 9, 8, 9, 4, 'D', '2025-11-10 09:28:45'::timestamp),
  ('296317', 'CAMILA VIEIRA DELGADO DE OLIVEIRA', 'camila.oliveira@aec.com.br', 10, 6, 8, 6, 'D', '2025-11-10 10:10:03'::timestamp),
  ('292530', 'CARLOS EDUARDO SILVA DE OLIVEIRA', 'carlos.eoliveira@aec.com.br', 6, 5, 10, 9, 'S', '2025-11-10 09:25:24'::timestamp),
  ('296216', 'CICERO JOSE DE SOUZA', 'a.cicero.souza@aec.com.br', 7, 9, 7, 7, 'I', '2025-11-10 09:25:51'::timestamp),
  ('359117', 'CICERO PEREIRA LEITE', 'cicero.leite@aec.com.br', 9, 7, 7, 7, 'D', '2025-11-10 10:09:48'::timestamp),
  ('359290', 'DAVI ALEXANDRE DANTAS SANTOS', 'davi.asantos@aec.com.br', 5, 11, 9, 5, 'I', '2025-11-10 09:56:27'::timestamp),
  ('292448', 'EDNALDO CANDIDO DA SILVA', 'ednaldo.silva@aec.com.br', 5, 9, 9, 7, 'I', '2025-11-10 10:10:24'::timestamp),
  ('359300', 'EDUARDA MARIA SILVA GOMES', 'eduarda.gomes@aec.com.br', 9, 8, 5, 8, 'D', '2025-11-10 10:26:06'::timestamp),
  ('268126', 'ELIELZA KAROLYNE DOS SANTOS', 'a.elielza.santos@aec.com.br', 5, 4, 11, 10, 'S', '2025-11-10 09:38:24'::timestamp),
  ('347160', 'FERNANDO HENRIQUE BARROS DA SILVA', 'fernando.hsilva@aec.com.br', 3, 6, 13, 8, 'S', '2025-11-10 09:56:41'::timestamp),
  ('246095', 'FRANCIMERY XAVIER DA SILVA', 'a.francimery.silva@aec.com.br', 7, 8, 7, 8, 'I', '2025-11-10 09:31:24'::timestamp),
  ('359245', 'GABRIEL VINICIUS MARQUES BARRETO', 'gabriel.barreto@aec.com.br', 5, 8, 10, 7, 'S', '2025-11-10 09:17:15'::timestamp),
  ('267910', 'GUILHERME MELO DE SOUZA', 'a.guilherme.souza@aec.com.br', 9, 10, 7, 4, 'I', '2025-11-10 09:36:24'::timestamp),
  ('241064', 'IZAURA DE ARAUJO BEZERRA', 'a.izaura.bezerra@aec.com.br', 6, 5, 11, 8, 'S', '2025-11-10 09:36:22'::timestamp),
  ('307399', 'JAINE DA SILVA SANTOS', 'jaine.santos@aec.com.br', 5, 10, 10, 5, 'I', '2025-11-10 10:03:51'::timestamp),
  ('331058', 'JANDSON JUNIOR DA SILVA', 'jandson.silva@aec.com.br', 5, 5, 9, 11, 'C', '2025-11-10 09:56:54'::timestamp),
  ('391860', 'JAQUELINE MARIA LAURINDO', 'jaqueline.laurindo@aec.com.br', 4, 8, 9, 9, 'S', '2025-11-10 09:42:36'::timestamp),
  ('274071', 'JESSICA BEATRIZ DA SILVA OLIVEIRA', 'jessica.boliveira@aec.com.br', 8, 9, 6, 7, 'I', '2025-11-10 10:10:30'::timestamp),
  ('240745', 'JOAO PAULO SILVA DE OLIVEIRA', 'a.joao.paulo@aec.com.br', 7, 9, 8, 6, 'I', '2025-11-10 09:48:04'::timestamp),
  ('134187', 'JONATHAN LINS DA SILVA', 'jonathan.silva@aec.com.br', 9, 8, 6, 7, 'D', '2025-11-10 10:52:38'::timestamp),
  ('359232', 'JOSE ANDERSON TEIXEIRA DA SILVA', 'anderson.tsilva@aec.com.br', 6, 7, 10, 7, 'S', '2025-11-10 10:16:12'::timestamp),
  ('395270', 'JOSE GABRIEL INACIO SILVA', 'gabriel.isilva@aec.com.br', 10, 6, 5, 9, 'D', '2025-11-10 09:44:11'::timestamp),
  ('359264', 'JOSE GIVALDO DA SILVA REGO', 'givaldo.rego@aec.com.br', 4, 8, 11, 7, 'S', '2025-11-10 10:01:31'::timestamp),
  ('359279', 'JUAN PABLO OLIVEIRA DO NASCIMENTO', 'juan.nascimento@aec.com.br', 5, 11, 8, 6, 'I', '2025-11-10 09:43:51'::timestamp),
  ('211199', 'JULIO CESAR ALVES DA SILVA SANTOS', 'a.julio.cesar@aec.com.br', 8, 8, 6, 8, 'D', '2025-11-10 10:08:45'::timestamp),
  ('359260', 'KAIO CESAR SANTOS DA SILVA', 'kaio.csilva@aec.com.br', 6, 9, 9, 6, 'I', '2025-11-10 09:31:21'::timestamp),
  ('230569', 'KAROLINNE MARIA SILVA DE OLIVEIRA', 'a.karolinne.oliveira@aec.com.br', 8, 6, 10, 6, 'S', '2025-11-10 09:43:41'::timestamp),
  ('227625', 'KELCIANE CAVALCANTE DE LIMA', 'kelciane.lima@aec.com.br', 9, 7, 8, 6, 'D', '2025-11-10 10:18:05'::timestamp),
  ('391941', 'LARA GUEDES DE ARAUJO', 'lara.araujo@aec.com.br', 6, 10, 9, 5, 'I', '2025-11-10 10:13:20'::timestamp),
  ('316539', 'LARYSSA ALVES DE SA SILVA', 'laryssa.silva@aec.com.br', 8, 6, 7, 9, 'C', '2025-11-10 09:35:18'::timestamp),
  ('313947', 'LEANDRO DE ABREU OLIVEIRA', 'leandro.oliveira@aec.com.br', 5, 7, 9, 9, 'S', '2025-11-10 10:05:48'::timestamp),
  ('280951', 'LUAN CARLOS SILVA BATISTA', 'luan.batista@aec.com.br', 7, 8, 7, 8, 'I', '2025-11-10 10:01:29'::timestamp),
  ('257923', 'MARCELO JOSE FERREIRA DA SILVA', 'a.marcelo.silva@aec.com.br', 9, 4, 8, 9, 'D', '2025-11-10 09:48:35'::timestamp),
  ('225756', 'MARIA CLARA DA SILVA SANTOS', 'a.maria.clara@aec.com.br', 7, 11, 9, 3, 'I', '2025-11-10 10:01:21'::timestamp),
  ('257931', 'MARIA LUIZA FURTADO BEZERRA', 'a.maria.luiza@aec.com.br', 6, 8, 7, 9, 'I', '2025-11-10 09:36:49'::timestamp),
  ('336920', 'MARIANA ALVES DE OLIVEIRA', 'mariana.aoliveira@aec.com.br', 6, 7, 11, 6, 'S', '2025-11-10 09:36:31'::timestamp),
  ('349518', 'MARIANNE OLIVEIRA RAMOS', 'marianne.ramos@aec.com.br', 6, 10, 8, 6, 'I', '2025-11-10 09:40:58'::timestamp),
  ('281726', 'MARIANA PEREIRA VERAS', 'a.mariana.veras@aec.com.br', 5, 6, 10, 9, 'S', '2025-11-10 10:13:41'::timestamp),
  ('200972', 'MIKAEL DE SA FERREIRA', 'a.mikael.ferreira@aec.com.br', 7, 4, 8, 11, 'C', '2025-11-10 09:54:16'::timestamp),
  ('333076', 'PAULO GUILHERME DOS ANJOS CASTILIANI', 'paulo.castiliani@aec.com.br', 6, 8, 9, 7, 'S', '2025-11-10 09:51:48'::timestamp),
  ('316490', 'PEDRO DE ALBUQUERQUE LINS', 'pedro.lins@aec.com.br', 5, 9, 7, 9, 'I', '2025-11-10 09:25:19'::timestamp),
  ('311634', 'PEDRO HENRIQUE SILVA SANTANA', 'pedro.santana@aec.com.br', 5, 8, 10, 7, 'S', '2025-11-10 09:45:07'::timestamp),
  ('359225', 'PETERSON RODRIGUES DA SILVA', 'peterson.silva@aec.com.br', 6, 8, 10, 6, 'S', '2025-11-10 09:23:48'::timestamp),
  ('273783', 'RAIANE DA SILVA MARQUES', 'a.raiane.marques@aec.com.br', 4, 8, 8, 10, 'C', '2025-11-10 09:51:22'::timestamp),
  ('304166', 'RAPHAELA MARIA PINTO DE OLIVEIRA', 'raphaela.oliveira@aec.com.br', 10, 7, 7, 6, 'D', '2025-11-10 09:40:30'::timestamp),
  ('359315', 'RENAN BARBOSA SANTOS', 'renan.bsantos@aec.com.br', 4, 8, 9, 9, 'S', '2025-11-10 09:48:03'::timestamp),
  ('264886', 'RENATO ANTONIO VERAS DA SILVA', 'a.renato.silva@aec.com.br', 5, 9, 9, 7, 'I', '2025-11-10 09:25:01'::timestamp),
  ('284289', 'RICARDO JOSE DA SILVA', 'ricardo.jsilva@aec.com.br', 6, 7, 9, 8, 'S', '2025-11-10 09:48:05'::timestamp),
  ('292356', 'SANDRO JOSE DA SILVA', 'sandro.silva@aec.com.br', 7, 4, 9, 10, 'C', '2025-11-10 10:27:25'::timestamp),
  ('359289', 'SARA GOMES VICENTE', 'sara.vicente@aec.com.br', 5, 9, 9, 7, 'I', '2025-11-10 09:49:34'::timestamp),
  ('287661', 'SILVIA RAFAELA SANTOS SILVA', 'a.silvia.santos@aec.com.br', 6, 5, 10, 9, 'S', '2025-11-10 10:10:08'::timestamp),
  ('359152', 'SOFIA ISABEL DE MELO OLIVEIRA', 'sofia.oliveira@aec.com.br', 4, 6, 11, 9, 'S', '2025-11-10 10:04:09'::timestamp),
  ('334715', 'STEPHANI MARIA LIMA DE ANDRADE', 'stephani.andrade@aec.com.br', 6, 6, 8, 10, 'C', '2025-11-10 10:20:21'::timestamp),
  ('261064', 'TARCILA RAYANE DIAS RODRIGUES', 'tarcila.rodrigues@aec.com.br', 8, 9, 6, 7, 'I', '2025-11-10 10:00:44'::timestamp),
  ('402592', 'THAIS RODRIGUES CARVALHO', 'thais.carvalho@aec.com.br', 4, 9, 10, 7, 'S', '2025-11-10 09:40:36'::timestamp),
  ('316440', 'THAISA MARIA DOS SANTOS SILVA', 'thaisa.silva@aec.com.br', 5, 10, 11, 4, 'S', '2025-11-10 09:32:32'::timestamp),
  ('395548', 'THAYANNE TELES DE OLIVEIRA', 'thayanne.oliveira@aec.com.br', 4, 7, 11, 8, 'S', '2025-11-10 10:08:05'::timestamp),
  ('300373', 'VALDIANA DA SILVA SANTOS', 'valdiana.santos@aec.com.br', 5, 8, 11, 6, 'S', '2025-11-10 09:43:05'::timestamp),
  ('257961', 'VANDEBERG AURELIO DOS SANTOS', 'a.vandeberg.santos@aec.com.br', 7, 6, 6, 11, 'C', '2025-11-10 10:07:44'::timestamp),
  ('284238', 'VITOR CORDEIRO DE OLIVEIRA', 'vitor.oliveira@aec.com.br', 6, 9, 10, 5, 'S', '2025-11-10 09:50:45'::timestamp),
  ('241033', 'WILLAMES VIEIRA DE OLIVEIRA JUNIOR', 'willames.junior@aec.com.br', 8, 5, 6, 11, 'C', '2025-11-10 09:36:44'::timestamp),
  ('395415', 'YASMIN MARIA SANTOS', 'yasmin.santos@aec.com.br', 5, 10, 10, 5, 'I', '2025-11-10 09:38:39'::timestamp),
  ('263044', 'YVSON VIEIRA SILVA', 'a.yvson.silva@aec.com.br', 4, 7, 10, 9, 'S', '2025-11-10 09:58:30'::timestamp),
  ('323093', 'YURI JONAS SILVA NUNES', 'yuri.nunes@aec.com.br', 7, 4, 7, 12, 'C', '2025-11-10 09:35:17'::timestamp)
  
ON CONFLICT DO NOTHING;

-- 4. Atualizar função search_participants para ordenar por hierarquia
CREATE OR REPLACE FUNCTION public.search_participants(
  search_text text DEFAULT NULL,
  filter_status text DEFAULT NULL,
  filter_cargo text DEFAULT NULL,
  filter_coordinator text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  registration text,
  name text,
  email text,
  cargo text,
  coordinator text,
  has_completed_test boolean,
  dominant_profile text,
  score_d integer,
  score_i integer,
  score_s integer,
  score_c integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.registration,
    p.name,
    p.email,
    p.cargo,
    p.coordinator,
    (tr.id IS NOT NULL) as has_completed_test,
    tr.dominant_profile,
    tr.score_d,
    tr.score_i,
    tr.score_s,
    tr.score_c
  FROM participants p
  LEFT JOIN test_results tr ON p.registration = tr.registration
  WHERE 
    p.is_active = true
    AND (search_text IS NULL OR 
         p.name ILIKE '%' || search_text || '%' OR
         p.email ILIKE '%' || search_text || '%' OR
         p.registration ILIKE '%' || search_text || '%')
    AND (filter_status IS NULL OR
         (filter_status = 'Completado' AND tr.id IS NOT NULL) OR
         (filter_status = 'Pendente' AND tr.id IS NULL))
    AND (filter_cargo IS NULL OR p.cargo = filter_cargo)
    AND (filter_coordinator IS NULL OR p.coordinator = filter_coordinator)
  ORDER BY 
    CASE p.hierarchy_level
      WHEN 'gerente' THEN 1
      WHEN 'coordenador' THEN 2
      WHEN 'supervisor' THEN 3
      WHEN 'colaborador' THEN 4
      ELSE 5
    END,
    p.name;
END;
$$;