#!/bin/bash
# =====================================================
# SCRIPT DE BACKUP AUTOMÁTICO - Sistema DISC AeC
# =====================================================
# Este script cria backups completos, de schema e de dados
# do banco de dados Supabase.
#
# USO:
# ./backup.sh [tipo] [projeto_id]
#
# TIPOS:
# - full: Backup completo (schema + dados) - PADRÃO
# - schema: Apenas estrutura do banco
# - data: Apenas dados (sem schema)
# - all: Gera os 3 tipos de backup
#
# EXEMPLOS:
# ./backup.sh                          # Backup completo do projeto padrão
# ./backup.sh full                     # Mesmo que acima
# ./backup.sh schema                   # Apenas schema
# ./backup.sh all                      # Gera todos os tipos
# ./backup.sh full OUTRO_PROJECT_ID    # Backup de outro projeto
#
# REQUISITOS:
# - pg_dump instalado (vem com PostgreSQL)
# - Credenciais do banco (será solicitada senha)
# =====================================================

set -e  # Sair em caso de erro

# =====================================================
# CONFIGURAÇÃO
# =====================================================

# Projeto Supabase padrão (AeC DISC)
DEFAULT_PROJECT_REF="zpoqtqfscxpozkdvlqoi"

# Tipo de backup (pode ser: full, schema, data, all)
BACKUP_TYPE="${1:-full}"

# Projeto (pode ser sobrescrito por parâmetro)
PROJECT_REF="${2:-$DEFAULT_PROJECT_REF}"

# Diretório de backups
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Host do banco
DB_HOST="db.${PROJECT_REF}.supabase.co"
DB_USER="postgres"
DB_NAME="postgres"

# =====================================================
# FUNÇÕES
# =====================================================

# Criar diretório de backups se não existir
create_backup_dir() {
  if [ ! -d "$BACKUP_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
    echo "📁 Diretório de backups criado: $BACKUP_DIR"
  fi
}

# Backup completo (schema + dados)
backup_full() {
  local filename="$BACKUP_DIR/full_backup_${PROJECT_REF}_${DATE}.sql"
  
  echo "🔄 Iniciando backup completo..."
  echo "   Projeto: $PROJECT_REF"
  echo "   Arquivo: $filename"
  
  pg_dump -h "$DB_HOST" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --schema=public \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    --verbose \
    -f "$filename"
  
  echo "✅ Backup completo concluído: $filename"
  echo "   Tamanho: $(du -h "$filename" | cut -f1)"
}

# Backup apenas schema
backup_schema() {
  local filename="$BACKUP_DIR/schema_only_${PROJECT_REF}_${DATE}.sql"
  
  echo "🔄 Iniciando backup de schema..."
  echo "   Projeto: $PROJECT_REF"
  echo "   Arquivo: $filename"
  
  pg_dump -h "$DB_HOST" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --schema=public \
    --schema-only \
    --no-owner \
    --no-privileges \
    --verbose \
    -f "$filename"
  
  echo "✅ Backup de schema concluído: $filename"
  echo "   Tamanho: $(du -h "$filename" | cut -f1)"
}

# Backup apenas dados
backup_data() {
  local filename="$BACKUP_DIR/data_only_${PROJECT_REF}_${DATE}.sql"
  
  echo "🔄 Iniciando backup de dados..."
  echo "   Projeto: $PROJECT_REF"
  echo "   Arquivo: $filename"
  
  pg_dump -h "$DB_HOST" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --schema=public \
    --data-only \
    --no-owner \
    --no-privileges \
    --column-inserts \
    --verbose \
    -f "$filename"
  
  echo "✅ Backup de dados concluído: $filename"
  echo "   Tamanho: $(du -h "$filename" | cut -f1)"
}

# Exibir ajuda
show_help() {
  echo "=====================================================
BACKUP AUTOMÁTICO - Sistema DISC AeC
=====================================================

USO:
  ./backup.sh [tipo] [projeto_id]

TIPOS DE BACKUP:
  full      Backup completo (schema + dados) - PADRÃO
  schema    Apenas estrutura do banco (sem dados)
  data      Apenas dados (sem schema)
  all       Gera os 3 tipos de backup

EXEMPLOS:
  ./backup.sh
  ./backup.sh full
  ./backup.sh schema
  ./backup.sh all
  ./backup.sh full OUTRO_PROJECT_ID

RESTAURAÇÃO:
  psql -h db.PROJETO.supabase.co \\
       -U postgres \\
       -d postgres \\
       -f backups/full_backup_PROJETO_DATE.sql

PROJETO PADRÃO: $DEFAULT_PROJECT_REF
DIRETÓRIO BACKUPS: $BACKUP_DIR

====================================================="
  exit 0
}

# =====================================================
# SCRIPT PRINCIPAL
# =====================================================

# Verificar se pediu ajuda
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
  show_help
fi

# Banner
echo "====================================================="
echo "🗄️  BACKUP AUTOMÁTICO - Sistema DISC AeC"
echo "====================================================="
echo "Data/Hora: $(date '+%Y-%m-%d %H:%M:%S')"
echo "Tipo: $BACKUP_TYPE"
echo "Projeto: $PROJECT_REF"
echo "Host: $DB_HOST"
echo "====================================================="
echo ""

# Criar diretório de backups
create_backup_dir

# Executar backup conforme tipo solicitado
case "$BACKUP_TYPE" in
  full)
    backup_full
    ;;
  schema)
    backup_schema
    ;;
  data)
    backup_data
    ;;
  all)
    backup_full
    echo ""
    backup_schema
    echo ""
    backup_data
    ;;
  *)
    echo "❌ Erro: Tipo de backup inválido: $BACKUP_TYPE"
    echo ""
    show_help
    exit 1
    ;;
esac

# Estatísticas finais
echo ""
echo "====================================================="
echo "📊 ESTATÍSTICAS DE BACKUP"
echo "====================================================="
echo "Total de arquivos no diretório: $(ls -1 "$BACKUP_DIR" | wc -l)"
echo "Espaço total usado: $(du -sh "$BACKUP_DIR" | cut -f1)"
echo ""
echo "Últimos 5 backups:"
ls -lht "$BACKUP_DIR" | head -n 6
echo "====================================================="
echo "✅ Backup concluído com sucesso!"
echo "====================================================="

# =====================================================
# LIMPEZA AUTOMÁTICA (opcional)
# =====================================================
# Descomentar as linhas abaixo para manter apenas os últimos N backups
# e deletar backups mais antigos automaticamente

# KEEP_LAST_N_BACKUPS=10
# 
# echo ""
# echo "🧹 Limpando backups antigos (mantendo últimos $KEEP_LAST_N_BACKUPS)..."
# 
# cd "$BACKUP_DIR"
# ls -t | tail -n +$((KEEP_LAST_N_BACKUPS + 1)) | xargs -I {} rm -- {}
# 
# echo "✅ Limpeza concluída"

exit 0
