#!/bin/bash

# ===========================================
# Generate Secrets Script
# ===========================================
# Генерирует все необходимые секреты для production
# ===========================================

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}🔐 Генератор секретов для Production${NC}"
echo -e "${BLUE}=========================================${NC}\n"

echo -e "${YELLOW}Генерируем надежные секреты...${NC}\n"

# JWT Secret
JWT_SECRET=$(openssl rand -base64 32)
echo -e "${GREEN}JWT_SECRET:${NC}"
echo "$JWT_SECRET"
echo ""

# JWT Refresh Secret
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
echo -e "${GREEN}JWT_REFRESH_SECRET:${NC}"
echo "$JWT_REFRESH_SECRET"
echo ""

# PostgreSQL Password
POSTGRES_PASSWORD=$(openssl rand -base64 24)
echo -e "${GREEN}POSTGRES_PASSWORD:${NC}"
echo "$POSTGRES_PASSWORD"
echo ""

# Сохранить в файл
SECRETS_FILE="secrets-$(date +%Y%m%d-%H%M%S).txt"

cat > "$SECRETS_FILE" << EOF
# ===========================================
# Generated Secrets for Production
# Дата: $(date)
# ===========================================

JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
POSTGRES_PASSWORD=$POSTGRES_PASSWORD

# ===========================================
# ⚠️  ВАЖНО: 
# 1. Скопируйте эти значения в .env файл
# 2. Удалите этот файл после копирования!
# 3. НЕ коммитьте этот файл в Git!
# ===========================================
EOF

echo -e "${BLUE}=========================================${NC}"
echo -e "${GREEN}✅ Секреты сгенерированы и сохранены в:${NC}"
echo -e "${YELLOW}   $SECRETS_FILE${NC}\n"

echo -e "${YELLOW}⚠️  ВАЖНО:${NC}"
echo -e "1. Скопируйте значения из $SECRETS_FILE в .env файл"
echo -e "2. Удалите файл $SECRETS_FILE после копирования:"
echo -e "   ${BLUE}rm $SECRETS_FILE${NC}"
echo -e "3. НЕ коммитьте секреты в Git!\n"

echo -e "${BLUE}Команда для автоматического обновления .env:${NC}"
echo -e "${YELLOW}sed -i 's/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/' .env${NC}"
echo -e "${YELLOW}sed -i 's/JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET/' .env${NC}"
echo -e "${YELLOW}sed -i 's/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$POSTGRES_PASSWORD/' .env${NC}"
echo ""
