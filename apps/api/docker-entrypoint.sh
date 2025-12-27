#!/bin/sh
set -e

echo "🔄 Ожидание готовности PostgreSQL..."
until pg_isready -h postgres -U ${POSTGRES_USER:-postgres} || exit 1; do
  sleep 1
done

echo "📦 Выполнение миграций Prisma..."
npx prisma migrate deploy || true

echo "🔧 Генерация Prisma Client..."
npx prisma generate

echo "🌱 Заполнение базы данных тестовыми данными (если нужно)..."
npx prisma db seed || echo "⚠️ Seed не выполнен (возможно, данные уже есть)"

echo "🚀 Запуск API сервера..."
exec node dist/server.js

