# 🔗 Configuração Multi-Projeto - Banco de Dados DISC AeC

Este guia explica como reutilizar este banco de dados Supabase em múltiplos projetos frontend, backends e ambientes (desenvolvimento, staging, produção).

---

## 📋 Índice

1. [Opção 1: Mesmo Banco, Múltiplos Frontends](#opção-1-mesmo-banco-múltiplos-frontends)
2. [Opção 2: Replicação para Múltiplos Bancos](#opção-2-replicação-para-múltiplos-bancos)
3. [Opção 3: Tabelas Compartilhadas + Específicas](#opção-3-tabelas-compartilhadas--específicas)
4. [Gerenciamento de Secrets](#gerenciamento-de-secrets)
5. [Ambientes (Dev, Staging, Prod)](#ambientes-dev-staging-prod)
6. [Boas Práticas](#boas-práticas)

---

## Opção 1: Mesmo Banco, Múltiplos Frontends

### 📌 Quando usar

- Você quer uma **única fonte de verdade** centralizada
- Múltiplos frontends (web, mobile, admin dashboard) acessam os **mesmos dados**
- Sincronização automática entre aplicações
- Economia de custos (1 banco Supabase em vez de vários)

### ✅ Vantagens

✔️ Dados sempre sincronizados entre todos os projetos  
✔️ Uma única fonte de verdade  
✔️ Facilita manutenção e migrations  
✔️ Reduz custos de infraestrutura  
✔️ RLS policies protegem automaticamente todas as aplicações  

### ⚠️ Considerações

⚠️ Todos os projetos compartilham o mesmo limite de conexões do banco  
⚠️ Mudanças no schema afetam todos os projetos simultaneamente  
⚠️ Planejamento de migrations deve considerar compatibilidade retroativa  

### 🔧 Setup

#### Passo 1: Configurar variáveis de ambiente em cada projeto

**Projeto A - Frontend Web**
```env
# .env
VITE_SUPABASE_PROJECT_ID="zpoqtqfscxpozkdvlqoi"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_SUPABASE_URL="https://zpoqtqfscxpozkdvlqoi.supabase.co"
```

**Projeto B - Admin Dashboard**
```env
# .env
VITE_SUPABASE_PROJECT_ID="zpoqtqfscxpozkdvlqoi"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_SUPABASE_URL="https://zpoqtqfscxpozkdvlqoi.supabase.co"
```

**Projeto C - Mobile App**
```env
# .env
EXPO_PUBLIC_SUPABASE_URL="https://zpoqtqfscxpozkdvlqoi.supabase.co"
EXPO_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Passo 2: Isolar dados por projeto (se necessário)

Se você precisar **isolar dados entre projetos** mantendo o mesmo banco, adicione uma coluna `project_id`:

```sql
-- Adicionar coluna de identificação de projeto
ALTER TABLE custom_table_project_a 
ADD COLUMN project_id text DEFAULT 'project_a';

-- Policy para isolar por projeto
CREATE POLICY "Isolate by project"
ON custom_table_project_a
FOR ALL
USING (project_id = current_setting('app.current_project', true));
```

#### Passo 3: Nomenclatura de tabelas por projeto

Para **tabelas específicas de cada projeto**, use prefixos claros:

```
Tabelas CORE (compartilhadas):
├── participants
├── test_results
├── profiles
└── user_roles

Tabelas Projeto A (Web):
├── project_a_sessions
├── project_a_analytics
└── project_a_notifications

Tabelas Projeto B (Admin):
├── project_b_audit_logs
├── project_b_reports
└── project_b_exports

Tabelas Projeto C (Mobile):
├── project_c_device_tokens
├── project_c_push_notifications
└── project_c_offline_queue
```

---

## Opção 2: Replicação para Múltiplos Bancos

### 📌 Quando usar

- Ambientes **completamente isolados** (dev, staging, prod)
- Projetos **independentes** que não devem compartilhar dados
- Cada cliente/organização precisa de **sua própria instância**
- Requisitos de **compliance** exigem isolamento de dados

### ✅ Vantagens

✔️ Isolamento completo entre ambientes  
✔️ Testes destrutivos não afetam produção  
✔️ Escalabilidade independente  
✔️ Cada banco pode ter configurações otimizadas  

### ⚠️ Considerações

⚠️ Custo multiplicado (1 banco por ambiente)  
⚠️ Sincronização manual de schemas entre ambientes  
⚠️ Migrations devem ser aplicadas em cada banco  

### 🔧 Setup com pg_dump (Método Simples)

#### Passo 1: Exportar schema + dados do banco original

```bash
# Exportar TUDO (schema + dados)
pg_dump -h db.zpoqtqfscxpozkdvlqoi.supabase.co \
  -U postgres \
  -d postgres \
  --schema=public \
  --clean \
  --if-exists \
  -f backup_aec_disc_full.sql

# Exportar APENAS schema (sem dados)
pg_dump -h db.zpoqtqfscxpozkdvlqoi.supabase.co \
  -U postgres \
  -d postgres \
  --schema=public \
  --schema-only \
  -f schema_only.sql

# Exportar APENAS dados (sem schema)
pg_dump -h db.zpoqtqfscxpozkdvlqoi.supabase.co \
  -U postgres \
  -d postgres \
  --schema=public \
  --data-only \
  -f data_only.sql
```

#### Passo 2: Importar em outro projeto Supabase

```bash
# Criar novo projeto no Supabase primeiro, depois:
psql -h db.NOVO_PROJETO_ID.supabase.co \
  -U postgres \
  -d postgres \
  -f backup_aec_disc_full.sql
```

### 🔧 Setup com Supabase CLI (Recomendado)

#### Passo 1: Instalar Supabase CLI

```bash
# Via npm
npm install -g supabase

# Via Homebrew (macOS)
brew install supabase/tap/supabase

# Via Scoop (Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

#### Passo 2: Login e link ao projeto original

```bash
# Login no Supabase
supabase login

# Link ao projeto original
supabase link --project-ref zpoqtqfscxpozkdvlqoi
```

#### Passo 3: Gerar migration do estado atual

```bash
# Criar migration com o schema completo atual
supabase db dump -f supabase/migrations/20250117000000_initial_schema.sql

# Ver migrations disponíveis
supabase db remote commit list
```

#### Passo 4: Aplicar em novo projeto

```bash
# Link ao projeto de destino
supabase link --project-ref NOVO_PROJETO_ID

# Aplicar todas as migrations
supabase db push

# Ou aplicar migration específica
supabase db push --include-functions --include-roles
```

#### Passo 5: Sincronizar dados (opcional)

```bash
# Exportar dados como CSV
supabase db dump --data-only -f data.sql

# Importar em novo banco
psql -h db.NOVO_PROJETO_ID.supabase.co \
  -U postgres \
  -d postgres \
  -f data.sql
```

### 🔄 Script automatizado de replicação

**Arquivo: `scripts/replicate-db.sh`**

```bash
#!/bin/bash
# Script para replicar banco de dados entre projetos Supabase

SOURCE_PROJECT="zpoqtqfscxpozkdvlqoi"
TARGET_PROJECT="${1:-NOVO_PROJETO_ID}"
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"

echo "🔄 Replicando de $SOURCE_PROJECT para $TARGET_PROJECT"

# Passo 1: Dump do banco original
echo "📦 Exportando dados..."
pg_dump -h db.$SOURCE_PROJECT.supabase.co \
  -U postgres \
  -d postgres \
  --schema=public \
  --clean \
  --if-exists \
  > $BACKUP_FILE

# Passo 2: Importar no destino
echo "📥 Importando dados..."
psql -h db.$TARGET_PROJECT.supabase.co \
  -U postgres \
  -d postgres \
  < $BACKUP_FILE

echo "✅ Replicação concluída!"
echo "📝 Backup salvo em: $BACKUP_FILE"
```

**Uso:**
```bash
chmod +x scripts/replicate-db.sh
./scripts/replicate-db.sh NOVO_PROJETO_ID
```

---

## Opção 3: Tabelas Compartilhadas + Específicas

### 📌 Quando usar

- Você tem **dados comuns** (usuários, participantes) e **dados específicos** por projeto
- Quer **evitar duplicação** de dados comuns
- Precisa de **flexibilidade** para adicionar features específicas

### 🗂️ Estrutura recomendada

```
Schema público (public):

📁 CORE (compartilhado entre todos os projetos)
├── participants
├── test_results
├── profiles
└── user_roles

📁 PROJETO A - Sistema Web de Testes
├── project_a_user_sessions
├── project_a_quiz_progress
├── project_a_custom_questions
└── project_a_analytics_events

📁 PROJETO B - Dashboard Administrativo
├── project_b_audit_logs
├── project_b_custom_reports
├── project_b_scheduled_exports
└── project_b_email_templates

📁 PROJETO C - Mobile App
├── project_c_device_tokens
├── project_c_push_notifications
├── project_c_offline_cache
└── project_c_app_settings
```

### 🔒 Isolamento via RLS

#### Exemplo 1: Coluna `project_id` com RLS

```sql
-- Criar tabela específica do Projeto A
CREATE TABLE public.project_a_analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text DEFAULT 'project_a' NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  event_name text NOT NULL,
  event_data jsonb,
  created_at timestamp DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.project_a_analytics_events ENABLE ROW LEVEL SECURITY;

-- Policy: Apenas Projeto A pode acessar
CREATE POLICY "Project A only"
ON public.project_a_analytics_events
FOR ALL
USING (project_id = 'project_a' AND has_role(auth.uid(), 'admin'));
```

#### Exemplo 2: RLS baseado em email domain

```sql
-- Policy para isolar por domínio de email corporativo
CREATE POLICY "Company domain isolation"
ON public.custom_company_data
FOR ALL
USING (
  SPLIT_PART(
    (SELECT email FROM auth.users WHERE id = auth.uid()), 
    '@', 
    2
  ) = company_domain
);
```

### 📝 Convenção de nomenclatura

| Tipo | Formato | Exemplo |
|------|---------|---------|
| Core (compartilhado) | `snake_case` | `participants`, `test_results` |
| Projeto específico | `project_<id>_<table>` | `project_a_sessions` |
| Feature específica | `<project>_<feature>_<table>` | `mobile_push_notifications` |
| Temporária/staging | `temp_<date>_<table>` | `temp_20250117_import` |

---

## Gerenciamento de Secrets

### 🔐 Secrets necessários

Para cada projeto frontend, configure:

```env
# Backend (Supabase)
VITE_SUPABASE_URL=https://zpoqtqfscxpozkdvlqoi.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=zpoqtqfscxpozkdvlqoi

# Para Edge Functions (apenas backend)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (NUNCA no frontend!)
SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@db.zpoqtqfscxpozkdvlqoi.supabase.co:5432/postgres
```

### 📂 Template `.env.template`

Crie um arquivo `.env.template` no repositório:

```env
# =====================================================
# SUPABASE - Sistema DISC AeC
# =====================================================

# Projeto Supabase (Produção)
VITE_SUPABASE_PROJECT_ID="zpoqtqfscxpozkdvlqoi"
VITE_SUPABASE_URL="https://zpoqtqfscxpozkdvlqoi.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="SEU_ANON_KEY_AQUI"

# =====================================================
# INSTRUÇÕES
# =====================================================
# 1. Copie este arquivo para .env
# 2. Substitua os valores "SEU_..._AQUI" pelas credenciais reais
# 3. NUNCA commite o arquivo .env no Git!
#
# Para obter as credenciais:
# - Acesse: https://supabase.com/dashboard/project/zpoqtqfscxpozkdvlqoi/settings/api
# - Copie o "anon public" key
```

### 🔒 Segurança

⚠️ **NUNCA commite secrets reais no repositório!**

```gitignore
# .gitignore
.env
.env.local
.env.*.local
*.key
secrets/
```

✅ **Para múltiplos ambientes:**

```
.env.development      # Banco de desenvolvimento
.env.staging          # Banco de staging
.env.production       # Banco de produção
.env.template         # Template sem secrets (commitar apenas este)
```

---

## Ambientes (Dev, Staging, Prod)

### 🌍 Estratégia 1: Mesmo banco, diferentes tabelas

```sql
-- Tabelas de desenvolvimento (prefixo dev_)
CREATE TABLE dev_test_participants AS SELECT * FROM participants LIMIT 10;

-- Tabelas de staging (prefixo staging_)
CREATE TABLE staging_test_results AS SELECT * FROM test_results WHERE created_at > '2025-01-01';

-- Produção usa tabelas sem prefixo
SELECT * FROM participants; -- produção
```

### 🌍 Estratégia 2: Bancos separados por ambiente

```
┌─────────────────────────────────────────┐
│  DEVELOPMENT (Supabase Project 1)       │
│  - Schema completo                      │
│  - Dados de teste/seed                  │
│  - Testes destrutivos permitidos        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  STAGING (Supabase Project 2)           │
│  - Schema idêntico à produção           │
│  - Cópia parcial dos dados de produção  │
│  - Testes não-destrutivos               │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  PRODUCTION (Supabase Project 3)        │
│  - Schema versionado                    │
│  - Dados reais                          │
│  - Backup automático diário             │
└─────────────────────────────────────────┘
```

**Configuração do projeto:**

```json
// package.json
{
  "scripts": {
    "dev": "vite --mode development",
    "staging": "vite --mode staging",
    "build": "vite build --mode production"
  }
}
```

**Variáveis por ambiente:**

```env
# .env.development
VITE_SUPABASE_URL=https://dev-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=dev-key...

# .env.staging
VITE_SUPABASE_URL=https://staging-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=staging-key...

# .env.production
VITE_SUPABASE_URL=https://zpoqtqfscxpozkdvlqoi.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=prod-key...
```

---

## Boas Práticas

### ✅ DO (Faça)

✔️ **Use migrations versionadas** para todas as mudanças de schema  
✔️ **Documente alterações** no `CHANGELOG.md` do banco  
✔️ **Teste migrations em dev/staging** antes de produção  
✔️ **Use RLS policies** para segurança por padrão  
✔️ **Crie backups regulares** antes de migrations importantes  
✔️ **Use nomenclatura consistente** para tabelas e colunas  
✔️ **Separe dados sensíveis** em tabelas com RLS restritiva  
✔️ **Mantenha `.env.template`** atualizado e versionado  

### ❌ DON'T (Não faça)

❌ **Não altere schema diretamente em produção** sem migration  
❌ **Não commite secrets** (.env com credenciais reais)  
❌ **Não remova migrations antigas** que já foram aplicadas  
❌ **Não ignore avisos de compatibilidade** entre versões  
❌ **Não use `SELECT *`** sem considerar impacto de novas colunas  
❌ **Não crie foreign keys** para tabelas gerenciadas pelo Supabase (exceto PKs)  
❌ **Não use CHECK constraints com now()** (use triggers)  

### 🔄 Workflow recomendado para mudanças

```
1. 💻 Development
   ├── Criar migration localmente
   ├── Testar em banco de dev
   └── Commitar migration no Git

2. 🧪 Staging
   ├── Deploy da migration em staging
   ├── Testes de QA
   └── Validação de performance

3. 🚀 Production
   ├── Backup completo do banco
   ├── Aplicar migration em horário de baixo tráfego
   ├── Monitorar logs e métricas
   └── Rollback preparado se necessário
```

---

## Checklist de Setup Multi-Projeto

### ✅ Inicial

- [ ] Definir estratégia (mesmo banco vs bancos separados)
- [ ] Criar `.env.template` e `.env.example`
- [ ] Adicionar `.env` ao `.gitignore`
- [ ] Documentar schema em `SCHEMA_DOCUMENTATION.md`
- [ ] Configurar backup automático
- [ ] Testar RLS policies com usuários de teste

### ✅ Por projeto adicional

- [ ] Criar arquivo `.env` específico do projeto
- [ ] Configurar cliente Supabase com credenciais corretas
- [ ] Definir nomenclatura de tabelas específicas (se aplicável)
- [ ] Criar RLS policies para isolamento (se necessário)
- [ ] Documentar integrações no `README.md` do projeto
- [ ] Testar acesso em ambiente local

### ✅ Manutenção contínua

- [ ] Manter migrations versionadas
- [ ] Atualizar documentação quando schema mudar
- [ ] Sincronizar migrations entre ambientes (dev → staging → prod)
- [ ] Fazer backup antes de migrations grandes
- [ ] Revisar RLS policies periodicamente

---

## Recursos Adicionais

### 📚 Links úteis

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Row Level Security (RLS) Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Migrations Best Practices](https://supabase.com/docs/guides/database/migrations)
- [Backup & Restore Guide](https://supabase.com/docs/guides/platform/backups)

### 🛠️ Ferramentas recomendadas

- **Supabase CLI**: Gerenciamento de migrations e deploy
- **pgAdmin** ou **DBeaver**: Exploração visual do banco
- **Postman**: Testes de APIs e Edge Functions
- **GitHub Actions**: CI/CD automatizado com migrations

---

## Suporte e Contato

Para dúvidas sobre este banco de dados:

- **Documentação técnica**: Ver `SCHEMA_DOCUMENTATION.md`
- **Projeto Supabase**: https://supabase.com/dashboard/project/zpoqtqfscxpozkdvlqoi
- **Migrations**: Ver pasta `supabase/migrations/`

**Responsável técnico**: Mickael Bandeira (mickael.bandeira@aec.com.br)

---

**Última atualização**: 17 de Novembro de 2025  
**Versão do documento**: 1.0.0
