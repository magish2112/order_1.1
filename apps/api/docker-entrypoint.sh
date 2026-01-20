#!/bin/sh
set -e

# Переходим в рабочую директорию приложения
cd /app || exit 1

# Проверяем тип базы данных
if echo "$DATABASE_URL" | grep -q "file:"; then
  echo "🗄️ Используется SQLite база данных"
  # Создаем директорию для SQLite базы данных, если она не существует
  DB_FULL_PATH=$(echo "$DATABASE_URL" | sed 's|file:||')
  DB_DIR=$(dirname "$DB_FULL_PATH")
  if [ -n "$DB_DIR" ] && [ "$DB_DIR" != "." ]; then
    mkdir -p "$DB_DIR" 2>/dev/null || true
    echo "✅ Директория для базы данных создана: $DB_DIR"
  fi
else
  echo "🔄 Ожидание готовности PostgreSQL..."
  until pg_isready -h postgres -U ${POSTGRES_USER:-postgres} || exit 1; do
    sleep 1
  done
fi

echo "📦 Выполнение миграций Prisma..."
npx prisma migrate deploy || true

echo "🔧 Генерация Prisma Client..."
npx prisma generate

echo "🌱 Заполнение базы данных тестовыми данными (если нужно)..."
npx prisma db seed || echo "⚠️ Seed не выполнен (возможно, данные уже есть)"

echo "🚀 Запуск API сервера..."
exec node dist/server.js

