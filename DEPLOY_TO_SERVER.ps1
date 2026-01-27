# ===========================================
# Автоматический деплой Eterno на сервер
# ===========================================

$SERVER = "46.17.102.76"
$USER = "magish"
$PASS = "9Oecwton!1"

Write-Host "=========================================" -ForegroundColor Blue
Write-Host "🚀 Автоматический деплой Eterno" -ForegroundColor Blue
Write-Host "=========================================" -ForegroundColor Blue
Write-Host ""

Write-Host "📋 Создаю архив проекта..." -ForegroundColor Yellow
# Создаем архив проекта (исключая ненужные файлы)
$excludeList = @("node_modules", ".git", ".next", "dist", "build", ".env")
Compress-Archive -Path ./* -DestinationPath eterno-deploy.zip -Force -CompressionLevel Fastest

Write-Host "✅ Архив создан: eterno-deploy.zip" -ForegroundColor Green
Write-Host ""

Write-Host "=========================================" -ForegroundColor Blue
Write-Host "📝 СЛЕДУЮЩИЕ ШАГИ (выполните вручную):" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Blue
Write-Host ""

Write-Host "1. Подключитесь к серверу:" -ForegroundColor Cyan
Write-Host "   ssh $USER@$SERVER" -ForegroundColor White
Write-Host "   Password: $PASS" -ForegroundColor White
Write-Host ""

Write-Host "2. На сервере выполните:" -ForegroundColor Cyan
Write-Host @"
   # Установка Docker (если нужно)
   sudo apt update
   sudo apt install -y docker.io docker-compose git curl
   sudo systemctl start docker
   sudo systemctl enable docker
   sudo usermod -aG docker $USER
   
   # Создание директории
   mkdir -p ~/eterno
   cd ~/eterno
"@ -ForegroundColor White
Write-Host ""

Write-Host "3. Скопируйте файлы на сервер (в новом окне PowerShell):" -ForegroundColor Cyan
Write-Host "   pscp -pw $PASS eterno-deploy.zip ${USER}@${SERVER}:/home/$USER/eterno/" -ForegroundColor White
Write-Host ""

Write-Host "4. Распакуйте и запустите (на сервере):" -ForegroundColor Cyan
Write-Host @"
   cd ~/eterno
   unzip -o eterno-deploy.zip
   
   # Создание .env файла
   cat > .env << 'EOF'
NODE_ENV=production
POSTGRES_DB=eterno_production
POSTGRES_USER=eterno_user
POSTGRES_PASSWORD=z10bZTLLrvhFRH1AOvDZ9pTtE8KrDTZP
DATABASE_URL=postgresql://eterno_user:z10bZTLLrvhFRH1AOvDZ9pTtE8KrDTZP@postgres:5432/eterno_production
REDIS_URL=redis://redis:6379
JWT_SECRET=qozH/xlNXnc8JXUP7B+HXt1W5WnSjBzX4s3+SpsHtA4=
JWT_REFRESH_SECRET=bJBF3Iy0wgHGGprJ0QqsLVdOBbUFb3NtoE4GO7a4Cg0=
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CORS_ORIGIN=http://$SERVER,http://$SERVER:3000,http://$SERVER:3001
NEXT_PUBLIC_API_URL=http://$SERVER
ADMIN_URL=http://$SERVER:3001
NEXT_PUBLIC_SITE_URL=http://$SERVER
SWAGGER_HOST=$SERVER
SWAGGER_SCHEME=http
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@eterno-stroy.ru
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/app/public/uploads
PUBLIC_UPLOAD_URL=/uploads
API_PORT=4000
WEB_PORT=3000
ADMIN_PORT=3001
NGINX_PORT=80
POSTGRES_PORT=5432
REDIS_PORT=6379
VITE_API_URL=http://$SERVER/api/v1
DEV_ADMIN_EMAIL=
DEV_ADMIN_PASSWORD=
EOF
   
   # Остановка старых контейнеров
   docker compose down
   
   # Build и запуск
   docker compose build
   docker compose up -d
   
   # Ожидание запуска
   sleep 30
   
   # Проверка статуса
   docker compose ps
   
   # Миграции БД
   docker compose exec api npx prisma migrate deploy
   
   # Создание админа
   docker compose exec api node create-admin-eterno.js
   
   # Проверка health
   curl http://localhost/health
"@ -ForegroundColor White
Write-Host ""

Write-Host "=========================================" -ForegroundColor Blue
Write-Host "📊 После деплоя сайт будет доступен:" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Blue
Write-Host "  Главный сайт: http://$SERVER" -ForegroundColor Cyan
Write-Host "  Админка:      http://${SERVER}:3001" -ForegroundColor Cyan
Write-Host "  API Health:   http://${SERVER}/health" -ForegroundColor Cyan
Write-Host ""

# Сохраняем инструкции в файл
$instructions = @"
# ИНСТРУКЦИИ ПО ДЕПЛОЮ

Сервер: $SERVER
Пользователь: $USER
Пароль: $PASS

## Быстрый деплой:

1. SSH подключение:
   ssh $USER@$SERVER
   
2. На сервере:
   mkdir -p ~/eterno && cd ~/eterno
   
3. Копирование файлов (в новом PowerShell окне):
   pscp -pw $PASS eterno-deploy.zip ${USER}@${SERVER}:/home/$USER/eterno/
   
4. Распаковка и запуск (на сервере):
   unzip -o eterno-deploy.zip
   docker compose down
   docker compose build
   docker compose up -d
   docker compose exec api npx prisma migrate deploy
   docker compose exec api node create-admin-eterno.js

## Проверка:
   curl http://localhost/health
   
## URLs:
   - Сайт: http://$SERVER
   - Админка: http://${SERVER}:3001
"@

$instructions | Out-File -FilePath "DEPLOY_INSTRUCTIONS.txt" -Encoding UTF8

Write-Host "✅ Инструкции сохранены в: DEPLOY_INSTRUCTIONS.txt" -ForegroundColor Green
Write-Host ""
