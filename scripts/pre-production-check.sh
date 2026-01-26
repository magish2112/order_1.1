#!/bin/bash

# ===========================================
# Pre-Production Check Script
# ===========================================
# Проверяет проект перед деплоем в production
# Ищет потенциальные проблемы и предупреждает
# ===========================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

errors=0
warnings=0

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}🔍 Pre-Production Security Check${NC}"
echo -e "${BLUE}=========================================${NC}\n"

# ===========================================
# 1. Проверка .env файла
# ===========================================

echo -e "${YELLOW}📋 Проверка .env файла...${NC}"

if [ ! -f .env ]; then
    echo -e "${RED}❌ ОШИБКА: Файл .env не найден!${NC}"
    echo -e "   Создайте: cp .env.production .env"
    ((errors++))
else
    echo -e "${GREEN}✅ Файл .env существует${NC}"
    
    # Проверка опасных значений
    if grep -q "CHANGE_ME\|admin123\|test-jwt-secret" .env; then
        echo -e "${RED}❌ ОШИБКА: В .env найдены тестовые значения!${NC}"
        echo -e "   Замените все CHANGE_ME, admin123, test-* на реальные значения"
        ((errors++))
    fi
    
    # Проверка CORS
    if grep -q "^CORS_ORIGIN=\*" .env; then
        echo -e "${RED}❌ ОШИБКА: CORS_ORIGIN не может быть * в production!${NC}"
        ((errors++))
    fi
    
    # Проверка длины секретов
    jwt_secret=$(grep "^JWT_SECRET=" .env 2>/dev/null | cut -d '=' -f2-)
    if [ ${#jwt_secret} -lt 32 ]; then
        echo -e "${RED}❌ ОШИБКА: JWT_SECRET слишком короткий (< 32 символов)${NC}"
        ((errors++))
    fi
fi

echo ""

# ===========================================
# 2. Поиск hardcoded секретов в коде
# ===========================================

echo -e "${YELLOW}🔐 Поиск hardcoded секретов...${NC}"

# Поиск тестовых паролей
if grep -r "password.*123\|admin123\|test.*password" apps/ --exclude-dir=node_modules --exclude-dir=tests --exclude-dir=.next 2>/dev/null; then
    echo -e "${YELLOW}⚠️  ПРЕДУПРЕЖДЕНИЕ: Найдены тестовые пароли в коде${NC}"
    ((warnings++))
else
    echo -e "${GREEN}✅ Тестовые пароли не найдены${NC}"
fi

# Поиск example.com
if grep -r "example\.com" apps/web/ --exclude-dir=node_modules --exclude-dir=.next --exclude="*.test.*" 2>/dev/null | grep -v "//"; then
    echo -e "${YELLOW}⚠️  ПРЕДУПРЕЖДЕНИЕ: Найдены example.com ссылки${NC}"
    ((warnings++))
else
    echo -e "${GREEN}✅ example.com ссылки не найдены${NC}"
fi

echo ""

# ===========================================
# 3. Проверка временных файлов
# ===========================================

echo -e "${YELLOW}📁 Проверка временных файлов...${NC}"

temp_files=$(find . -name "*.tmp" -o -name "*.temp" -o -name "*.log" -o -name ".DS_Store" 2>/dev/null | wc -l)
if [ $temp_files -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Найдено $temp_files временных файлов${NC}"
    find . -name "*.tmp" -o -name "*.temp" -o -name "*.log" -o -name ".DS_Store" 2>/dev/null | head -5
    ((warnings++))
else
    echo -e "${GREEN}✅ Временные файлы не найдены${NC}"
fi

echo ""

# ===========================================
# 4. Проверка node_modules
# ===========================================

echo -e "${YELLOW}📦 Проверка зависимостей...${NC}"

# Проверка уязвимостей (если npm audit доступен)
cd apps/api 2>/dev/null && npm audit --production 2>/dev/null | grep -i "critical\|high" && ((warnings++)) || echo -e "${GREEN}✅ API dependencies secure${NC}"
cd ../../apps/web 2>/dev/null && npm audit --production 2>/dev/null | grep -i "critical\|high" && ((warnings++)) || echo -e "${GREEN}✅ Web dependencies secure${NC}"
cd ../..

echo ""

# ===========================================
# 5. Проверка Docker конфигурации
# ===========================================

echo -e "${YELLOW}🐳 Проверка Docker конфигурации...${NC}"

# Проверка что есть production override
if [ ! -f docker-compose.production.yml ]; then
    echo -e "${RED}❌ ОШИБКА: docker-compose.production.yml не найден!${NC}"
    ((errors++))
else
    echo -e "${GREEN}✅ Production docker-compose найден${NC}"
    
    # Проверка что порты БД закрыты
    if grep -q "postgres:" docker-compose.production.yml && ! grep -A 5 "postgres:" docker-compose.production.yml | grep -q "ports: \[\]"; then
        echo -e "${YELLOW}⚠️  ПРЕДУПРЕЖДЕНИЕ: Порты PostgreSQL могут быть открыты${NC}"
        ((warnings++))
    else
        echo -e "${GREEN}✅ Порты PostgreSQL закрыты${NC}"
    fi
fi

echo ""

# ===========================================
# 6. Проверка Nginx конфига
# ===========================================

echo -e "${YELLOW}🌐 Проверка Nginx конфигурации...${NC}"

if [ ! -f nginx/nginx.conf ]; then
    echo -e "${RED}❌ ОШИБКА: nginx/nginx.conf не найден!${NC}"
    ((errors++))
else
    echo -e "${GREEN}✅ Nginx конфиг найден${NC}"
    
    # Проверка SSL (если должен быть)
    if ! grep -q "listen 443 ssl" nginx/nginx.conf; then
        echo -e "${YELLOW}⚠️  ПРЕДУПРЕЖДЕНИЕ: SSL не настроен в nginx.conf${NC}"
        echo -e "   Добавьте после получения сертификатов"
        ((warnings++))
    fi
fi

echo ""

# ===========================================
# 7. Проверка миграций БД
# ===========================================

echo -e "${YELLOW}🗄️  Проверка миграций БД...${NC}"

if [ ! -d apps/api/prisma/migrations ]; then
    echo -e "${YELLOW}⚠️  ПРЕДУПРЕЖДЕНИЕ: Папка migrations не найдена${NC}"
    ((warnings++))
else
    migration_count=$(ls -1 apps/api/prisma/migrations | wc -l)
    echo -e "${GREEN}✅ Найдено $migration_count миграций${NC}"
fi

echo ""

# ===========================================
# 8. Проверка статических файлов
# ===========================================

echo -e "${YELLOW}📸 Проверка статических файлов...${NC}"

if [ ! -f apps/web/public/logo.svg ]; then
    echo -e "${YELLOW}⚠️  ПРЕДУПРЕЖДЕНИЕ: Логотип не найден${NC}"
    ((warnings++))
else
    logo_size=$(stat -f%z apps/web/public/logo.svg 2>/dev/null || stat -c%s apps/web/public/logo.svg 2>/dev/null)
    echo -e "${GREEN}✅ Логотип найден ($logo_size bytes)${NC}"
fi

echo ""

# ===========================================
# 9. Итоги
# ===========================================

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}📊 Результаты проверки${NC}"
echo -e "${BLUE}=========================================${NC}\n"

if [ $errors -gt 0 ]; then
    echo -e "${RED}❌ Найдено критичных ошибок: $errors${NC}"
    echo -e "${RED}   НЕЛЬЗЯ деплоить! Исправьте ошибки и запустите снова.${NC}"
    exit 1
fi

if [ $warnings -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Найдено предупреждений: $warnings${NC}"
    echo -e "${YELLOW}   Рекомендуется исправить перед деплоем.${NC}"
    echo -e "\n${BLUE}Продолжить деплой? (y/n)${NC}"
    read -r response
    if [ "$response" != "y" ]; then
        echo -e "${YELLOW}Деплой отменен${NC}"
        exit 0
    fi
fi

echo -e "${GREEN}✅ Все проверки пройдены!${NC}"
echo -e "${GREEN}   Проект готов к production деплою.${NC}\n"

echo -e "${BLUE}Следующий шаг:${NC}"
echo -e "  ./scripts/deploy-production.sh"
echo ""

exit 0
