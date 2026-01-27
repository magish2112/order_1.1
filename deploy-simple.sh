#!/bin/bash
set -e

echo "=== Eterno Deploy ===="
cd /home/magish/eterno

echo "1. Останавливаю контейнеры..."
docker compose down 2>/dev/null || true

echo "2. Очистка..."
docker system prune -f

echo "3. Копирование minimal docker-compose..."
cp docker-compose.minimal.yml docker-compose.yml

echo "4. Запуск PostgreSQL и Redis..."
docker compose up -d postgres redis

echo "5. Ожидание 15 секунд..."
sleep 15

echo "6. Запуск API..."
docker compose up -d --build api

echo "7. Ожидание 30 секунд..."
sleep 30

echo "8. Проверка контейнеров..."
docker compose ps

echo "9. Миграции БД..."
docker compose exec -T api npx prisma migrate deploy || echo "Миграции не требуются"

echo "10. Создание админа..."
docker compose exec -T api node create-admin-eterno.js

echo "11. Health check..."
curl -s http://localhost:4000/health || curl -s http://localhost/health

echo "=== Готово! ==="
docker compose ps
