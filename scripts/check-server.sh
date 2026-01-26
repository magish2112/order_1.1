#!/bin/bash
# Диагностика сервера: контейнеры, API, пароль админа, VITE_API_URL
# Запуск на сервере: bash scripts/check-server.sh

set -e

cd "$(dirname "$0")/.." || { echo "Ошибка: запустите из корня проекта"; exit 1; }

echo "══════════════════════════════════════════════════════════════"
echo "  ДИАГНОСТИКА СЕРВЕРА"
echo "══════════════════════════════════════════════════════════════"
echo ""

# 1. Статус контейнеров
echo "1️⃣  Статус контейнеров:"
echo "──────────────────────────────────────────────────────────────"
docker compose ps 2>/dev/null || docker-compose ps 2>/dev/null || echo "⚠️  docker compose не найден"
echo ""

# 2. Проверка API
echo "2️⃣  Проверка API (http://127.0.0.1:4000/health):"
echo "──────────────────────────────────────────────────────────────"
if curl -sf http://127.0.0.1:4000/health >/dev/null 2>&1; then
  echo "✅ API отвечает"
  curl -s http://127.0.0.1:4000/health | head -1
else
  echo "❌ API не отвечает"
  echo "Логи API (последние 20 строк):"
  docker compose logs api 2>/dev/null | tail -20 || docker-compose logs api 2>/dev/null | tail -20 || echo "Не удалось получить логи"
fi
echo ""

# 3. Проверка VITE_API_URL в .env
echo "3️⃣  VITE_API_URL в .env:"
echo "──────────────────────────────────────────────────────────────"
if [ -f .env ]; then
  VITE_URL=$(grep '^VITE_API_URL=' .env 2>/dev/null | head -1)
  if [ -n "$VITE_URL" ]; then
    echo "✅ Найден: $VITE_URL"
  else
    echo "❌ VITE_API_URL не найден в .env"
  fi
else
  echo "⚠️  Файл .env не найден"
fi
echo ""

# 4. Проверка админа в БД
echo "4️⃣  Проверка администратора в БД:"
echo "──────────────────────────────────────────────────────────────"
if docker compose ps api 2>/dev/null | grep -q "Up" || docker-compose ps api 2>/dev/null | grep -q "Up"; then
  ADMIN_CHECK=$(docker compose exec -T api node -e "
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    (async () => {
      try {
        const user = await prisma.user.findUnique({ where: { email: 'admineterno@yandex.ru' } });
        if (user) {
          console.log('✅ Админ найден: ' + user.email + ', активен: ' + user.isActive);
        } else {
          console.log('❌ Админ не найден в БД');
        }
        await prisma.\$disconnect();
      } catch (e) {
        console.log('❌ Ошибка: ' + e.message);
        process.exit(1);
      }
    })();
  " 2>/dev/null || echo "❌ Не удалось проверить БД")
  echo "$ADMIN_CHECK"
else
  echo "⚠️  Контейнер API не запущен"
fi
echo ""

# 5. Проверка web
echo "5️⃣  Проверка сайта (web):"
echo "──────────────────────────────────────────────────────────────"
if curl -sf http://127.0.0.1:3000 >/dev/null 2>&1; then
  echo "✅ Сайт отвечает"
else
  echo "❌ Сайт не отвечает"
  echo "Статус контейнера web:"
  docker compose ps web 2>/dev/null | grep web || docker-compose ps web 2>/dev/null | grep web || echo "Контейнер не найден"
fi
echo ""

# 6. Проверка admin
echo "6️⃣  Проверка админ-панели:"
echo "──────────────────────────────────────────────────────────────"
if curl -sf http://127.0.0.1:3001 >/dev/null 2>&1; then
  echo "✅ Админ-панель отвечает"
else
  echo "❌ Админ-панель не отвечает"
  echo "Статус контейнера admin:"
  docker compose ps admin 2>/dev/null | grep admin || docker-compose ps admin 2>/dev/null | grep admin || echo "Контейнер не найден"
fi
echo ""

echo "══════════════════════════════════════════════════════════════"
echo "  РЕКОМЕНДАЦИИ:"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "Если API не отвечает:"
echo "  docker compose logs api | tail -50"
echo ""
echo "Если VITE_API_URL отсутствует:"
echo "  echo 'VITE_API_URL=http://46.17.102.76:4000/api/v1' >> .env"
echo "  docker compose build --no-cache admin && docker compose up -d admin"
echo ""
echo "Если админ не найден или нужен новый пароль:"
echo "  docker compose exec -T api node create-admin-eterno.js 'ВашПароль123!@#'"
echo ""
echo "══════════════════════════════════════════════════════════════"
