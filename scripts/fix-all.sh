#!/bin/bash
# Автоматическое исправление: диагностика + исправление проблем
# Запуск на сервере: bash scripts/fix-all.sh [IP_сервера]
# Пример: bash scripts/fix-all.sh 46.17.102.76

set -e

cd "$(dirname "$0")/.." || { echo "Ошибка: запустите из корня проекта"; exit 1; }

HOST="${1:-46.17.102.76}"
VITE_URL="http://${HOST}:4000/api/v1"

echo "══════════════════════════════════════════════════════════════"
echo "  АВТОМАТИЧЕСКОЕ ИСПРАВЛЕНИЕ"
echo "══════════════════════════════════════════════════════════════"
echo ""

# 1. Диагностика
echo "1️⃣  ДИАГНОСТИКА"
echo "──────────────────────────────────────────────────────────────"
echo "Контейнеры:"
docker compose ps 2>/dev/null || docker-compose ps 2>/dev/null || echo "⚠️  docker compose не найден"
echo ""

echo "API:"
if curl -sf http://127.0.0.1:4000/health >/dev/null 2>&1; then
  echo "✅ API отвечает"
else
  echo "❌ API не отвечает"
fi
echo ""

echo "VITE_API_URL в .env:"
if [ -f .env ]; then
  if grep -q '^VITE_API_URL=' .env 2>/dev/null; then
    echo "✅ Найден: $(grep '^VITE_API_URL=' .env | head -1)"
  else
    echo "❌ Не найден"
  fi
else
  echo "⚠️  .env не найден"
fi
echo ""

# 2. Исправления
echo "2️⃣  ИСПРАВЛЕНИЯ"
echo "──────────────────────────────────────────────────────────────"

# 2.1. Запустить контейнеры, если не запущены
echo "Проверка контейнеров..."
if ! docker compose ps 2>/dev/null | grep -q "Up" && ! docker-compose ps 2>/dev/null | grep -q "Up"; then
  echo "  → Запуск контейнеров..."
  docker compose up -d 2>/dev/null || docker-compose up -d 2>/dev/null || true
  sleep 5
fi

# 2.2. Добавить/обновить VITE_API_URL
echo "Проверка VITE_API_URL..."
if ! grep -q "^VITE_API_URL=" .env 2>/dev/null; then
  echo "  → Добавление VITE_API_URL=$VITE_URL"
  grep -v '^VITE_API_URL=' .env 2>/dev/null > .env.tmp || true
  echo "VITE_API_URL=$VITE_URL" >> .env.tmp
  mv .env.tmp .env
elif ! grep -q "^VITE_API_URL=$VITE_URL" .env 2>/dev/null; then
  echo "  → Обновление VITE_API_URL=$VITE_URL"
  grep -v '^VITE_API_URL=' .env > .env.tmp 2>/dev/null || true
  echo "VITE_API_URL=$VITE_URL" >> .env.tmp
  mv .env.tmp .env
else
  echo "  ✅ VITE_API_URL уже правильный"
fi

# 2.3. Дождаться готовности API
echo "Ожидание готовности API..."
for i in $(seq 1 30); do
  if curl -sf http://127.0.0.1:4000/health >/dev/null 2>&1; then
    echo "  ✅ API готов"
    break
  fi
  sleep 2
done

# 2.4. Задать пароль админа (генерируем, если не задан)
echo "Проверка администратора..."
ADMIN_EXISTS=$(docker compose exec -T api node -e "
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  (async () => {
    try {
      const user = await prisma.user.findUnique({ where: { email: 'admineterno@yandex.ru' } });
      console.log(user ? 'yes' : 'no');
      await prisma.\$disconnect();
    } catch (e) {
      console.log('error');
      process.exit(1);
    }
  })();
" 2>/dev/null || echo "error")

if [ "$ADMIN_EXISTS" != "yes" ] || [ "$ADMIN_EXISTS" = "error" ]; then
  echo "  → Генерация пароля и создание/обновление админа..."
  if command -v openssl >/dev/null 2>&1; then
    ADMIN_PASSWORD="Er$(openssl rand -base64 16 | tr -d '/+=\n' | head -c 14)9!"
  else
    ADMIN_PASSWORD="Eterno$(date +%s | tail -c 7)xY!9"
  fi
  while [ ${#ADMIN_PASSWORD} -lt 12 ]; do
    ADMIN_PASSWORD="${ADMIN_PASSWORD}X1!"
  done
  
  docker compose exec -T api node create-admin-eterno.js "$ADMIN_PASSWORD" 2>/dev/null || \
    docker-compose exec -T api node create-admin-eterno.js "$ADMIN_PASSWORD" 2>/dev/null || true
else
  echo "  ✅ Админ уже существует"
  ADMIN_PASSWORD="(не изменён, используйте существующий или задайте новый вручную)"
fi

# 2.5. Пересобрать admin с VITE_API_URL
echo "Пересборка админ-панели..."
docker compose build --no-cache admin 2>/dev/null || docker-compose build --no-cache admin 2>/dev/null || true
docker compose up -d admin 2>/dev/null || docker-compose up -d admin 2>/dev/null || true

# 2.6. Пересобрать web (на всякий случай)
echo "Проверка сайта..."
if ! curl -sf http://127.0.0.1:3000 >/dev/null 2>&1; then
  echo "  → Пересборка web..."
  docker compose build --no-cache web 2>/dev/null || docker-compose build --no-cache web 2>/dev/null || true
  docker compose up -d web 2>/dev/null || docker-compose up -d web 2>/dev/null || true
fi

echo ""

# 3. Финальная проверка
echo "3️⃣  ФИНАЛЬНАЯ ПРОВЕРКА"
echo "──────────────────────────────────────────────────────────────"
echo "Контейнеры:"
docker compose ps 2>/dev/null || docker-compose ps 2>/dev/null
echo ""

echo "API:"; curl -sf http://127.0.0.1:4000/health >/dev/null && echo "✅ OK" || echo "❌ Не отвечает"
echo "Web:"; curl -sf http://127.0.0.1:3000 >/dev/null && echo "✅ OK" || echo "❌ Не отвечает"
echo "Admin:"; curl -sf http://127.0.0.1:3001 >/dev/null && echo "✅ OK" || echo "❌ Не отвечает"
echo ""

echo "══════════════════════════════════════════════════════════════"
echo "  РЕЗУЛЬТАТ"
echo "══════════════════════════════════════════════════════════════"
echo "  Админка:  http://${HOST}:3001"
echo "  Email:    admineterno@yandex.ru"
if [ "$ADMIN_PASSWORD" != "(не изменён, используйте существующий или задайте новый вручную)" ]; then
  echo "  Пароль:   $ADMIN_PASSWORD"
  echo ""
  echo "  ⚠️  СОХРАНИТЕ ПАРОЛЬ — он больше не покажется!"
else
  echo "  Пароль:   (используйте существующий или задайте новый)"
  echo ""
  echo "  Чтобы задать новый пароль:"
  echo "    docker compose exec -T api node create-admin-eterno.js 'ВашПароль123!@#'"
fi
echo "══════════════════════════════════════════════════════════════"
echo ""
