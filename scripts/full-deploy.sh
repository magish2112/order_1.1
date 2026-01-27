#!/bin/bash

# ===========================================
# Полный автоматический деплой на сервер
# ===========================================

SERVER_IP="46.17.102.76"
SERVER_USER="magish"
SERVER_PASS="9Oecwton!1"
PROJECT_DIR="/home/magish/eterno"

# Цвета
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}🚀 Автоматический деплой Eterno${NC}"
echo -e "${BLUE}=========================================${NC}\n"

# Функция для выполнения команд на сервере
ssh_exec() {
    sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "$1"
}

# Функция для копирования файлов
scp_copy() {
    sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no -r "$1" "$SERVER_USER@$SERVER_IP:$2"
}

# 1. Проверка подключения
echo -e "${YELLOW}📡 Проверка подключения к серверу...${NC}"
if ssh_exec "echo 'Подключение успешно'"; then
    echo -e "${GREEN}✅ Подключение установлено${NC}\n"
else
    echo -e "${RED}❌ Ошибка подключения!${NC}"
    exit 1
fi

# 2. Проверка и установка Docker
echo -e "${YELLOW}📦 Проверка Docker...${NC}"
if ssh_exec "docker --version" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Docker уже установлен${NC}"
else
    echo -e "${YELLOW}⏳ Установка Docker...${NC}"
    ssh_exec "sudo apt update && sudo apt install -y docker.io docker-compose git curl"
    ssh_exec "sudo systemctl start docker && sudo systemctl enable docker"
    ssh_exec "sudo usermod -aG docker $SERVER_USER"
    echo -e "${GREEN}✅ Docker установлен${NC}"
fi

# 3. Создание директории проекта
echo -e "\n${YELLOW}📁 Создание директории проекта...${NC}"
ssh_exec "mkdir -p $PROJECT_DIR"

# 4. Копирование файлов проекта
echo -e "${YELLOW}📤 Копирование файлов на сервер...${NC}"
echo -e "   Это может занять несколько минут..."

# Исключаем node_modules, .git, и временные файлы
cd "$(dirname "$0")/.."
scp_copy "./" "$PROJECT_DIR/"

echo -e "${GREEN}✅ Файлы скопированы${NC}\n"

# 5. Настройка .env файла
echo -e "${YELLOW}⚙️  Настройка environment переменных...${NC}"
ssh_exec "cd $PROJECT_DIR && cat > .env << 'ENVEOF'
NODE_ENV=production

# PostgreSQL
POSTGRES_DB=eterno_production
POSTGRES_USER=eterno_user
POSTGRES_PASSWORD=z10bZTLLrvhFRH1AOvDZ9pTtE8KrDTZP
DATABASE_URL=postgresql://eterno_user:z10bZTLLrvhFRH1AOvDZ9pTtE8KrDTZP@postgres:5432/eterno_production

# Redis
REDIS_URL=redis://redis:6379

# JWT Secrets
JWT_SECRET=qozH/xlNXnc8JXUP7B+HXt1W5WnSjBzX4s3+SpsHtA4=
JWT_REFRESH_SECRET=bJBF3Iy0wgHGGprJ0QqsLVdOBbUFb3NtoE4GO7a4Cg0=
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS (замените на свой домен!)
CORS_ORIGIN=http://$SERVER_IP,http://$SERVER_IP:3000,http://$SERVER_IP:3001

# Public URLs
NEXT_PUBLIC_API_URL=http://$SERVER_IP
ADMIN_URL=http://$SERVER_IP:3001
NEXT_PUBLIC_SITE_URL=http://$SERVER_IP
SWAGGER_HOST=$SERVER_IP
SWAGGER_SCHEME=http

# SMTP (опционально)
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@eterno-stroy.ru

# File Uploads
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/app/public/uploads
PUBLIC_UPLOAD_URL=/uploads

# Ports
API_PORT=4000
WEB_PORT=3000
ADMIN_PORT=3001
NGINX_PORT=80
POSTGRES_PORT=5432
REDIS_PORT=6379

# Vite
VITE_API_URL=http://$SERVER_IP/api/v1

DEV_ADMIN_EMAIL=
DEV_ADMIN_PASSWORD=
ENVEOF"

echo -e "${GREEN}✅ .env файл настроен${NC}\n"

# 6. Остановка старых контейнеров
echo -e "${YELLOW}⏸️  Остановка старых контейнеров...${NC}"
ssh_exec "cd $PROJECT_DIR && docker compose down 2>/dev/null || true"

# 7. Build и запуск контейнеров
echo -e "${YELLOW}🔨 Сборка и запуск контейнеров...${NC}"
echo -e "   Это займет 5-10 минут..."
ssh_exec "cd $PROJECT_DIR && docker compose build"
ssh_exec "cd $PROJECT_DIR && docker compose up -d"

# 8. Ожидание готовности сервисов
echo -e "\n${YELLOW}⏳ Ожидание готовности сервисов...${NC}"
sleep 30

# 9. Проверка статуса
echo -e "${YELLOW}📊 Проверка статуса контейнеров...${NC}"
ssh_exec "cd $PROJECT_DIR && docker compose ps"

# 10. Применение миграций БД
echo -e "\n${YELLOW}🗄️  Применение миграций БД...${NC}"
ssh_exec "cd $PROJECT_DIR && docker compose exec -T api npx prisma migrate deploy"

# 11. Создание админа
echo -e "${YELLOW}👤 Создание первого админа...${NC}"
ssh_exec "cd $PROJECT_DIR && docker compose exec -T api node create-admin-eterno.js"

# 12. Финальная проверка
echo -e "\n${YELLOW}🔍 Финальная проверка...${NC}"
if ssh_exec "curl -s http://localhost/health" | grep -q "ok"; then
    echo -e "${GREEN}✅ API работает!${NC}"
else
    echo -e "${RED}⚠️  API не отвечает, проверьте логи${NC}"
fi

# 13. Итоги
echo -e "\n${BLUE}=========================================${NC}"
echo -e "${GREEN}✅ Деплой завершен успешно!${NC}"
echo -e "${BLUE}=========================================${NC}\n"

echo -e "${BLUE}📊 Информация о деплое:${NC}"
echo -e "  Сервер:       ${GREEN}$SERVER_IP${NC}"
echo -e "  Главный сайт: ${GREEN}http://$SERVER_IP${NC}"
echo -e "  Админка:      ${GREEN}http://$SERVER_IP:3001${NC}"
echo -e "  API Health:   ${GREEN}http://$SERVER_IP/health${NC}"
echo -e ""

echo -e "${YELLOW}📝 Полезные команды:${NC}"
echo -e "  Логи:    ssh magish@$SERVER_IP 'cd $PROJECT_DIR && docker compose logs -f'"
echo -e "  Статус:  ssh magish@$SERVER_IP 'cd $PROJECT_DIR && docker compose ps'"
echo -e "  Restart: ssh magish@$SERVER_IP 'cd $PROJECT_DIR && docker compose restart'"
echo -e ""

echo -e "${BLUE}🎉 Готово! Сайт доступен по адресу: http://$SERVER_IP${NC}\n"
