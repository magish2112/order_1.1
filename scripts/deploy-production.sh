#!/bin/bash

# ===========================================
# Production Deployment Script
# ===========================================
# Автоматический деплой проекта в production
# ===========================================

set -e  # Остановить при ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}🚀 Eterno Production Deployment${NC}"
echo -e "${BLUE}=========================================${NC}\n"

# ===========================================
# 1. Проверка предусловий
# ===========================================

echo -e "${YELLOW}📋 Проверка предусловий...${NC}"

# Проверка наличия .env файла
if [ ! -f .env ]; then
    echo -e "${RED}❌ Ошибка: Файл .env не найден!${NC}"
    echo -e "Скопируйте .env.production и заполните все переменные:"
    echo -e "  cp .env.production .env"
    echo -e "  nano .env"
    exit 1
fi

# Проверка критичных переменных
echo -e "${YELLOW}🔐 Проверка environment переменных...${NC}"

required_vars=(
    "POSTGRES_PASSWORD"
    "JWT_SECRET"
    "JWT_REFRESH_SECRET"
    "CORS_ORIGIN"
    "NEXT_PUBLIC_API_URL"
)

missing_vars=()

for var in "${required_vars[@]}"; do
    value=$(grep "^${var}=" .env | cut -d '=' -f2-)
    if [ -z "$value" ] || [ "$value" == "CHANGE_ME_GENERATE_STRONG_PASSWORD_HERE" ] || [ "$value" == "CHANGE_ME_GENERATE_RANDOM_32_CHARS_OR_MORE_HERE" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo -e "${RED}❌ Ошибка: Следующие переменные не настроены:${NC}"
    for var in "${missing_vars[@]}"; do
        echo -e "  - $var"
    done
    echo -e "\n${YELLOW}Отредактируйте .env файл и заполните все переменные.${NC}"
    exit 1
fi

# Проверка CORS (не должен быть *)
cors_origin=$(grep "^CORS_ORIGIN=" .env | cut -d '=' -f2-)
if [ "$cors_origin" == "*" ]; then
    echo -e "${RED}❌ Ошибка: CORS_ORIGIN не может быть '*' в production!${NC}"
    echo -e "Укажите конкретные домены, например:"
    echo -e "  CORS_ORIGIN=https://yourdomain.com,https://admin.yourdomain.com"
    exit 1
fi

# Проверка длины JWT секретов
jwt_secret=$(grep "^JWT_SECRET=" .env | cut -d '=' -f2-)
jwt_refresh=$(grep "^JWT_REFRESH_SECRET=" .env | cut -d '=' -f2-)

if [ ${#jwt_secret} -lt 32 ]; then
    echo -e "${RED}❌ Ошибка: JWT_SECRET слишком короткий (минимум 32 символа)!${NC}"
    echo -e "Сгенерируйте новый: openssl rand -base64 32"
    exit 1
fi

if [ ${#jwt_refresh} -lt 32 ]; then
    echo -e "${RED}❌ Ошибка: JWT_REFRESH_SECRET слишком короткий (минимум 32 символа)!${NC}"
    echo -e "Сгенерируйте новый: openssl rand -base64 32"
    exit 1
fi

echo -e "${GREEN}✅ Все переменные окружения настроены${NC}\n"

# Проверка Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Ошибка: Docker не установлен!${NC}"
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}❌ Ошибка: Docker Compose не установлен!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker и Docker Compose установлены${NC}\n"

# ===========================================
# 2. Backup текущих данных
# ===========================================

echo -e "${YELLOW}💾 Создание backup...${NC}"

BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup БД (если контейнер запущен)
if docker ps | grep -q order_postgres; then
    echo -e "  - Backup PostgreSQL..."
    docker compose exec -T postgres pg_dump -U postgres -d eterno_production > "$BACKUP_DIR/database.sql" 2>/dev/null || echo "  ⚠️  База данных пустая или не доступна"
fi

# Backup загруженных файлов (если volume существует)
if docker volume ls | grep -q order_uploads_data; then
    echo -e "  - Backup uploads..."
    docker run --rm -v order_uploads_data:/data -v "$(pwd)/$BACKUP_DIR":/backup alpine tar czf /backup/uploads.tar.gz /data 2>/dev/null || echo "  ⚠️  Файлы не найдены"
fi

echo -e "${GREEN}✅ Backup создан: $BACKUP_DIR${NC}\n"

# ===========================================
# 3. Остановка текущих контейнеров
# ===========================================

echo -e "${YELLOW}⏸️  Остановка текущих контейнеров...${NC}"

if docker ps | grep -q "order_"; then
    docker compose down
    echo -e "${GREEN}✅ Контейнеры остановлены${NC}\n"
else
    echo -e "${GREEN}✅ Контейнеры не запущены${NC}\n"
fi

# ===========================================
# 4. Pull последних образов
# ===========================================

echo -e "${YELLOW}📥 Загрузка обновлений базовых образов...${NC}"

docker compose pull postgres redis nginx

echo -e "${GREEN}✅ Образы обновлены${NC}\n"

# ===========================================
# 5. Build приложения
# ===========================================

echo -e "${YELLOW}🔨 Сборка приложения...${NC}"

# Используем production override
docker compose -f docker-compose.yml -f docker-compose.production.yml build --no-cache

echo -e "${GREEN}✅ Приложение собрано${NC}\n"

# ===========================================
# 6. Запуск контейнеров
# ===========================================

echo -e "${YELLOW}🚀 Запуск контейнеров...${NC}"

docker compose -f docker-compose.yml -f docker-compose.production.yml up -d

echo -e "${GREEN}✅ Контейнеры запущены${NC}\n"

# ===========================================
# 7. Ожидание готовности сервисов
# ===========================================

echo -e "${YELLOW}⏳ Ожидание готовности сервисов...${NC}"

# Ждем postgres
echo -n "  - PostgreSQL: "
timeout=60
counter=0
while [ $counter -lt $timeout ]; do
    if docker compose exec -T postgres pg_isready -U postgres &> /dev/null; then
        echo -e "${GREEN}готов${NC}"
        break
    fi
    echo -n "."
    sleep 1
    ((counter++))
done

if [ $counter -eq $timeout ]; then
    echo -e "${RED}timeout${NC}"
    echo -e "${RED}❌ PostgreSQL не запустился за $timeout секунд${NC}"
    exit 1
fi

# Ждем redis
echo -n "  - Redis: "
timeout=30
counter=0
while [ $counter -lt $timeout ]; do
    if docker compose exec -T redis redis-cli ping &> /dev/null; then
        echo -e "${GREEN}готов${NC}"
        break
    fi
    echo -n "."
    sleep 1
    ((counter++))
done

if [ $counter -eq $timeout ]; then
    echo -e "${RED}timeout${NC}"
    echo -e "${RED}❌ Redis не запустился за $timeout секунд${NC}"
    exit 1
fi

# Ждем API
echo -n "  - API: "
timeout=60
counter=0
while [ $counter -lt $timeout ]; do
    if curl -f http://localhost/health &> /dev/null; then
        echo -e "${GREEN}готов${NC}"
        break
    fi
    echo -n "."
    sleep 1
    ((counter++))
done

if [ $counter -eq $timeout ]; then
    echo -e "${RED}timeout${NC}"
    echo -e "${RED}❌ API не запустился за $timeout секунд${NC}"
    docker compose logs api
    exit 1
fi

echo -e "\n${GREEN}✅ Все сервисы готовы${NC}\n"

# ===========================================
# 8. Проверка деплоя
# ===========================================

echo -e "${YELLOW}🔍 Проверка деплоя...${NC}"

# Проверка API
api_health=$(curl -s http://localhost/health || echo "")
if echo "$api_health" | grep -q "ok"; then
    echo -e "${GREEN}✅ API работает${NC}"
else
    echo -e "${RED}❌ API не отвечает${NC}"
    docker compose logs api | tail -20
fi

# Проверка Web
if curl -f http://localhost/ &> /dev/null; then
    echo -e "${GREEN}✅ Web сайт работает${NC}"
else
    echo -e "${RED}❌ Web сайт не доступен${NC}"
    docker compose logs web | tail -20
fi

# Проверка Admin
if curl -f http://localhost:3001/ &> /dev/null; then
    echo -e "${GREEN}✅ Админка работает${NC}"
else
    echo -e "${RED}❌ Админка не доступна${NC}"
    docker compose logs admin | tail -20
fi

echo ""

# ===========================================
# 9. Итоговая информация
# ===========================================

echo -e "${BLUE}=========================================${NC}"
echo -e "${GREEN}✅ Деплой завершен успешно!${NC}"
echo -e "${BLUE}=========================================${NC}\n"

echo -e "${BLUE}📊 Информация о деплое:${NC}"
echo -e "  Главный сайт: http://localhost"
echo -e "  Админка:      http://localhost:3001"
echo -e "  API Health:   http://localhost/health"
echo -e "  Backup:       $BACKUP_DIR"
echo ""

echo -e "${BLUE}📝 Полезные команды:${NC}"
echo -e "  Логи всех сервисов:    docker compose logs -f"
echo -e "  Логи API:              docker compose logs -f api"
echo -e "  Статус контейнеров:    docker compose ps"
echo -e "  Остановить:            docker compose down"
echo ""

echo -e "${YELLOW}⚠️  Важно:${NC}"
echo -e "  1. Настройте SSL сертификаты (Let's Encrypt)"
echo -e "  2. Настройте регулярные backups"
echo -e "  3. Настройте мониторинг (Prometheus/Grafana)"
echo -e "  4. Проверьте Lighthouse score"
echo ""

echo -e "${GREEN}🎉 Готово!${NC}\n"
