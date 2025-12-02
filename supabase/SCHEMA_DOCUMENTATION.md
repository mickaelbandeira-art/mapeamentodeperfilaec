# 📘 Documentação do Schema - Sistema DISC AeC

## Visão Geral

Este banco de dados gerencia um sistema de avaliação de perfis comportamentais DISC para colaboradores da organização AeC, incluindo gestão de participantes, resultados de testes, autenticação de administradores e controle de acesso baseado em roles.

## Tabelas Principais

### `participants`

Armazena informações dos participantes da organização.

**Campos:**
- `id` (uuid, PK): Identificador único gerado automaticamente
- `registration` (text, UNIQUE, NOT NULL): Matrícula do colaborador
- `name` (text, NOT NULL): Nome completo
- `email` (text, NOT NULL): Email corporativo
- `network_login` (text, nullable): Login de rede do colaborador
- `cargo` (text, NOT NULL): Cargo/função atual
- `supervisor` (text, nullable): Nome do supervisor direto (pode ser NULL para níveis hierárquicos superiores)
- `coordinator` (text, NOT NULL): Nome do coordenador responsável
- `manager` (text, default: "Jonathan Lins da Silva"): Nome do gerente responsável
- `hierarchy_level` (enum, NOT NULL): Nível hierárquico do colaborador
  - Valores possíveis: `'colaborador'`, `'supervisor'`, `'coordenador'`, `'gerente'`
- `is_active` (boolean, default: true): Status ativo/inativo do participante
- `created_at` (timestamp): Data/hora de criação do registro
- `updated_at` (timestamp): Data/hora da última atualização (atualizado automaticamente via trigger)

**Índices:**
- UNIQUE constraint em `registration`
- Índice em `email` para buscas rápidas
- Índice em `hierarchy_level` para filtros de hierarquia

**RLS Policies:**
- ✅ **SELECT público**: Permite leitura pública para validação de matrícula durante o registro
- ✅ **SELECT coordenadores**: Coordenadores podem ver apenas seus subordinados diretos
- ✅ **SELECT gerentes**: Gerentes podem ver todos os participantes
- 🔒 **INSERT/UPDATE/DELETE**: Apenas administradores podem modificar dados

**Uso típico:**
```sql
-- Buscar participante por matrícula para auto-completar formulário
SELECT name, email FROM participants WHERE registration = '226610';

-- Listar subordinados de um coordenador
SELECT * FROM participants WHERE coordinator = 'KELCIANE CAVALCANTE DE LIMA';
```

---

### `test_results`

Armazena resultados dos testes DISC completados pelos participantes.

**Campos:**
- `id` (uuid, PK): Identificador único do resultado
- `participant_id` (uuid, nullable): ID do participante (se existir na tabela participants)
- `registration` (text, NOT NULL): Matrícula do participante (desnormalizado para histórico)
- `name` (text, NOT NULL): Nome do participante no momento do teste
- `email` (text, NOT NULL): Email do participante no momento do teste
- `score_d` (integer, NOT NULL): Pontuação do perfil Dominância (0-30)
- `score_i` (integer, NOT NULL): Pontuação do perfil Influência (0-30)
- `score_s` (integer, NOT NULL): Pontuação do perfil Estabilidade (0-30)
- `score_c` (integer, NOT NULL): Pontuação do perfil Conformidade (0-30)
- `dominant_profile` (text, NOT NULL): Perfil dominante calculado ('D', 'I', 'S', 'C')
- `completed_at` (timestamp, default: now()): Data/hora de conclusão do teste
- `test_duration_seconds` (integer, nullable): Duração do teste em segundos
- `answers` (jsonb, nullable): Respostas detalhadas do questionário em formato JSON

**Desnormalização:**
Os campos `registration`, `name` e `email` são armazenados diretamente para manter o histórico caso o participante seja removido da tabela `participants`.

**RLS Policies:**
- ✅ **SELECT público**: Qualquer um pode ver resultados de matrículas válidas
- ✅ **SELECT coordenadores**: Coordenadores veem resultados de seus subordinados
- ✅ **SELECT gerentes**: Gerentes veem todos os resultados
- ✅ **INSERT público**: Permite inserção ao completar o teste (sem autenticação)
- 🔒 **UPDATE/DELETE**: Apenas administradores

**Uso típico:**
```sql
-- Inserir resultado ao completar teste
INSERT INTO test_results (registration, name, email, score_d, score_i, score_s, score_c, dominant_profile)
VALUES ('226610', 'AMANDA LIMA LINO', 'a.amanda.lino@aec.com.br', 9, 2, 10, 9, 'S');

-- Buscar distribuição de perfis
SELECT dominant_profile, COUNT(*) as total 
FROM test_results 
GROUP BY dominant_profile;
```

---

### `profiles`

Perfis de usuários autenticados (administradores, coordenadores, gerentes) que acessam o sistema.

**Campos:**
- `id` (uuid, PK, FK→auth.users): ID do usuário Supabase Auth
- `full_name` (text, NOT NULL): Nome completo do usuário
- `email` (text, NOT NULL): Email do usuário
- `matricula` (text, nullable): Matrícula se for um colaborador da organização
- `cargo` (text, nullable): Cargo atual do usuário
- `avatar_url` (text, nullable): URL da foto de perfil
- `created_at` (timestamp): Data/hora de criação do perfil
- `updated_at` (timestamp): Data/hora da última atualização (atualizado automaticamente via trigger)

**Trigger:**
Trigger `on_auth_user_created` cria automaticamente um perfil quando um novo usuário faz signup via Supabase Auth.

**RLS Policies:**
- ✅ **SELECT próprio**: Usuário pode ver seu próprio perfil
- ✅ **SELECT admins**: Administradores podem ver todos os perfis
- ✅ **UPDATE próprio**: Usuário pode atualizar seu próprio perfil
- 🔒 **INSERT/DELETE**: Gerenciado automaticamente via trigger (não permitido manualmente)

**Uso típico:**
```sql
-- Buscar perfil do usuário logado
SELECT * FROM profiles WHERE id = auth.uid();

-- Atualizar avatar do usuário
UPDATE profiles SET avatar_url = 'https://...' WHERE id = auth.uid();
```

---

### `user_roles`

Sistema de roles (funções) para controle de acesso baseado em permissões.

**Campos:**
- `id` (uuid, PK): Identificador único
- `user_id` (uuid, FK→auth.users, NOT NULL): ID do usuário
- `role` (enum, NOT NULL): Role atribuída ao usuário
  - Valores possíveis: `'admin'`, `'manager'`, `'coordinator'`
- `created_at` (timestamp): Data/hora de criação da role
- **UNIQUE constraint**: (user_id, role) - Um usuário não pode ter a mesma role duplicada

**RLS Policies:**
- ✅ **SELECT próprio ou admin**: Usuário vê suas próprias roles ou é admin
- ✅ **INSERT especial**: Permite auto-registro de admin apenas para email específico (`mickael.bandeira@aec.com.br`) + admins podem criar qualquer role
- 🔒 **UPDATE/DELETE**: Apenas administradores

**Email autorizado para auto-registro admin:**
- `mickael.bandeira@aec.com.br` pode criar sua própria role de admin na primeira vez que acessar o sistema

**Uso típico:**
```sql
-- Verificar roles do usuário logado
SELECT role FROM user_roles WHERE user_id = auth.uid();

-- Adicionar role de coordenador (apenas admins)
INSERT INTO user_roles (user_id, role) VALUES ('user-uuid-here', 'coordinator');
```

---

## Views

### `dashboard_stats`

View materializada (atualizada em tempo real) com estatísticas agregadas para o dashboard administrativo.

**Campos computados:**
- `total_participants` (bigint): Total de participantes ativos (`is_active = true`)
- `total_completed_tests` (bigint): Total de testes completados
- `pending_tests` (bigint): Número de participantes ativos sem teste completado
- `completion_rate` (numeric): Taxa de conclusão dos testes em porcentagem

**Query subjacente:**
```sql
SELECT 
  COUNT(DISTINCT p.id) as total_participants,
  COUNT(DISTINCT tr.id) as total_completed_tests,
  COUNT(DISTINCT p.id) - COUNT(DISTINCT tr.id) as pending_tests,
  CASE 
    WHEN COUNT(DISTINCT p.id) > 0 
    THEN (COUNT(DISTINCT tr.id)::numeric / COUNT(DISTINCT p.id) * 100)
    ELSE 0 
  END as completion_rate
FROM participants p
LEFT JOIN test_results tr ON p.registration = tr.registration
WHERE p.is_active = true;
```

**Uso típico:**
```sql
-- Obter todas as estatísticas do dashboard
SELECT * FROM dashboard_stats;
```

---

## Funções (Functions)

### `has_role(user_id uuid, role app_role) → boolean`

Verifica se um usuário específico possui uma role (função) no sistema.

**Características:**
- ⚡ **SECURITY DEFINER**: Executa com privilégios elevados para evitar recursão nas RLS policies
- 🔒 **STABLE**: Marcada como estável para otimização de queries
- 🎯 **search_path = public**: Garante que apenas o schema public é acessado

**Parâmetros:**
- `_user_id` (uuid): ID do usuário a verificar
- `_role` (app_role): Role a verificar ('admin', 'manager', 'coordinator')

**Retorno:**
- `true` se o usuário possui a role especificada
- `false` caso contrário

**Uso em RLS Policies:**
```sql
CREATE POLICY "Admins can do everything"
ON some_table
FOR ALL
USING (has_role(auth.uid(), 'admin'));
```

**Implementação:**
```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

---

### `search_participants(...) → TABLE`

Função de busca avançada de participantes com múltiplos filtros e join automático com resultados de testes.

**Parâmetros:**
- `search_text` (text, nullable): Texto para buscar em nome, email ou matrícula
- `filter_status` (text, nullable): Filtro de status do teste ('Completado', 'Pendente')
- `filter_cargo` (text, nullable): Filtro por cargo específico
- `filter_coordinator` (text, nullable): Filtro por coordenador específico

**Retorno (TABLE):**
Retorna uma tabela com os seguintes campos:
- `id`, `registration`, `name`, `email`, `cargo`, `coordinator`
- `has_completed_test` (boolean): Se o participante completou o teste
- `dominant_profile`, `score_d`, `score_i`, `score_s`, `score_c`: Dados do teste (NULL se pendente)

**Características:**
- 🔒 **SECURITY DEFINER**: Respeita as RLS policies do usuário que a chama
- 🚀 **Otimizada**: Usa LEFT JOIN para incluir participantes sem testes
- 📊 **Ordenação**: Resultados ordenados por nome

**Uso típico:**
```sql
-- Buscar todos os participantes com "SILVA" no nome
SELECT * FROM search_participants('SILVA', NULL, NULL, NULL);

-- Buscar apenas testes completados do cargo "INSTRUTOR"
SELECT * FROM search_participants(NULL, 'Completado', 'INSTRUTOR DE TREINAMENTO', NULL);

-- Buscar subordinados de um coordenador específico
SELECT * FROM search_participants(NULL, NULL, NULL, 'KELCIANE CAVALCANTE DE LIMA');
```

**Implementação:**
```sql
CREATE OR REPLACE FUNCTION public.search_participants(
  search_text text DEFAULT NULL,
  filter_status text DEFAULT NULL,
  filter_cargo text DEFAULT NULL,
  filter_coordinator text DEFAULT NULL
)
RETURNS TABLE(...) -- ver campos acima
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, p.registration, p.name, p.email, p.cargo, p.coordinator,
    (tr.id IS NOT NULL) as has_completed_test,
    tr.dominant_profile, tr.score_d, tr.score_i, tr.score_s, tr.score_c
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
  ORDER BY p.name;
END;
$$;
```

---

## Enums (Tipos Enumerados)

### `app_role`

Define os tipos de roles (funções) disponíveis no sistema.

**Valores:**
- `'admin'`: Administrador com acesso total ao sistema
- `'manager'`: Gerente que pode visualizar todos os participantes e resultados
- `'coordinator'`: Coordenador que pode visualizar apenas seus subordinados diretos

**Criação:**
```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'coordinator');
```

---

### `hierarchy_level`

Define os níveis hierárquicos na organização.

**Valores:**
- `'colaborador'`: Nível operacional/execução
- `'supervisor'`: Supervisão direta de colaboradores
- `'coordenador'`: Coordenação de supervisores e equipes
- `'gerente'`: Gestão de coordenadores e áreas

**Criação:**
```sql
CREATE TYPE public.hierarchy_level AS ENUM ('colaborador', 'supervisor', 'coordenador', 'gerente');
```

---

## Triggers

### `update_updated_at_column()`

Trigger function que atualiza automaticamente o campo `updated_at` com o timestamp atual sempre que um registro é modificado.

**Aplicado em:**
- `participants` (tabela)
- `profiles` (tabela)

**Implementação:**
```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Exemplo de aplicação
CREATE TRIGGER update_participants_updated_at
BEFORE UPDATE ON public.participants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
```

---

### `handle_new_user()`

Trigger function que cria automaticamente um perfil na tabela `profiles` quando um novo usuário é criado via Supabase Auth.

**Aplicado em:**
- `auth.users` (via trigger after insert)

**Implementação:**
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, matricula)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    new.raw_user_meta_data->>'matricula'
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
```

---

## Diagrama de Relacionamentos (ER)

```
┌─────────────────┐
│   auth.users    │ (Supabase Auth - gerenciado)
└────────┬────────┘
         │ 1:1
         ├──────────┐
         │          │
    ┌────▼────┐  ┌──▼──────────┐
    │ profiles│  │ user_roles  │
    └─────────┘  └─────────────┘
                      │
                      │ has_role() verifica roles
                      │ usado em RLS policies
                      ▼
         ┌──────────────────────────┐
         │  RLS Policies protegem:  │
         │  • participants          │
         │  • test_results          │
         └──────────────────────────┘

┌──────────────┐     1:N        ┌──────────────┐
│ participants │◄───────────────│ test_results │
└──────────────┘   (via          └──────────────┘
                    registration)
```

---

## Segurança e Boas Práticas

### ✅ Row-Level Security (RLS)

Todas as tabelas públicas têm RLS habilitado:
```sql
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
```

### ✅ Prevenção de Recursão RLS

A função `has_role()` usa `SECURITY DEFINER` para evitar recursão infinita nas policies:
- ❌ **Errado**: Policy que consulta a própria tabela → recursão infinita
- ✅ **Correto**: Policy que chama função SECURITY DEFINER → executa com privilégios elevados

### ✅ Validação de Dados

- Campos NOT NULL garantem integridade básica
- Unique constraints previnem duplicatas
- Enums restringem valores válidos
- Foreign keys mantêm integridade referencial

### ✅ Auditoria

- Campos `created_at` e `updated_at` em tabelas críticas
- Triggers automáticos para manter timestamps atualizados
- Desnormalização em `test_results` para preservar histórico

### ⚠️ Considerações Importantes

1. **Email autorizado admin**: Apenas `mickael.bandeira@aec.com.br` pode auto-registrar como admin
2. **Testes públicos**: Qualquer um pode inserir resultados de testes (necessário para o fluxo sem autenticação)
3. **Desnormalização**: `test_results` armazena dados redundantes propositalmente para histórico
4. **Supervisor nullable**: Cargos de nível superior (coordenadores, gerentes) não têm supervisor

---

## Consultas Úteis

### Estatísticas gerais
```sql
-- Ver estatísticas do dashboard
SELECT * FROM dashboard_stats;

-- Distribuição de perfis DISC
SELECT 
  dominant_profile, 
  COUNT(*) as quantidade,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentual
FROM test_results
GROUP BY dominant_profile
ORDER BY quantidade DESC;
```

### Gestão de participantes
```sql
-- Listar participantes por coordenador
SELECT coordinator, COUNT(*) as total
FROM participants
WHERE is_active = true
GROUP BY coordinator
ORDER BY total DESC;

-- Taxa de conclusão por cargo
SELECT 
  cargo,
  COUNT(DISTINCT p.id) as total,
  COUNT(DISTINCT tr.id) as completados,
  ROUND(COUNT(DISTINCT tr.id)::numeric / COUNT(DISTINCT p.id) * 100, 1) as taxa
FROM participants p
LEFT JOIN test_results tr ON p.registration = tr.registration
WHERE p.is_active = true
GROUP BY cargo
ORDER BY total DESC;
```

### Controle de acesso
```sql
-- Verificar roles de um usuário
SELECT r.role, u.email, p.full_name
FROM user_roles r
JOIN auth.users u ON r.user_id = u.id
JOIN profiles p ON r.user_id = p.id
WHERE u.email = 'mickael.bandeira@aec.com.br';

-- Listar todos os administradores
SELECT p.full_name, p.email
FROM user_roles r
JOIN profiles p ON r.user_id = p.id
WHERE r.role = 'admin';
```

---

## Manutenção e Backup

### Backup completo
```bash
pg_dump -h db.zpoqtqfscxpozkdvlqoi.supabase.co \
  -U postgres \
  -d postgres \
  --schema=public \
  --clean \
  --if-exists \
  -f backup_$(date +%Y%m%d).sql
```

### Backup apenas schema
```bash
pg_dump -h db.zpoqtqfscxpozkdvlqoi.supabase.co \
  -U postgres \
  -d postgres \
  --schema=public \
  --schema-only \
  -f schema_$(date +%Y%m%d).sql
```

### Restauração
```bash
psql -h db.OUTRO_PROJETO.supabase.co \
  -U postgres \
  -d postgres \
  -f backup_20250117.sql
```

---

## Versão e Changelog

**Versão atual**: 1.0.0  
**Última atualização**: 17 de Novembro de 2025  
**Projeto Supabase ID**: zpoqtqfscxpozkdvlqoi

### Changelog
- **v1.0.0** (Nov 2025): Schema inicial com sistema DISC completo
  - Tabelas: participants, test_results, profiles, user_roles
  - View: dashboard_stats
  - Funções: has_role, search_participants
  - Enums: app_role, hierarchy_level
  - RLS policies completas
  - Triggers automáticos
