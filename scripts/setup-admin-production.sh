#!/bin/bash
# Настройка админ-панели на production: VITE_API_URL, надёжный пароль, пересборка.
# Запуск на сервере из корня проекта:
#   ./scripts/setup-admin-production.sh [IP_или_домен]
#   bash scripts/setup-admin-production.sh 46.17.102.76
#
# Скрипт: 1) добавляет/обновляет VITE_API_URL в .env; 2) пересобирает API (актуальный create-admin);
# 3) генерирует пароль и обновляет админа в БД; 4) пересобирает и поднимает admin.

set -e

cd "$(dirname "$0")/.."

if [ ! -f docker-compose.yml ]; then
  echo "Запустите скрипт из корня проекта (где docker-compose.yml)."
  exit 1
fi

# 1) Хост для VITE_API_URL
HOST="$1"
if [ -z "$HOST" ]; then
  if [ -f .env ]; then
    HOST=$(grep -E '^VITE_API_URL=' .env 2>/dev/null | sed -n 's|.*://\([^:/]*\).*|\1|p')
    [ -z "$HOST" ] && HOST=$(grep -E '^NEXT_PUBLIC_API_URL=' .env 2>/dev/null | sed -n 's|.*://\([^:/]*\).*|\1|p')
  fi
fi
if [ -z "$HOST" ]; then
  echo "Укажите хост (IP или домен) первым аргументом:"
  echo "  ./scripts/setup-admin-production.sh 46.17.102.76"
  exit 1
fi

VITE_URL="http://${HOST}:4000/api/v1"
echo "VITE_API_URL=$VITE_URL"

# 2) Обновить .env (убираем старый VITE_API_URL, добавляем новый)
grep -v '^VITE_API_URL=' .env 2>/dev/null > .env.tmp || true
echo "VITE_API_URL=$VITE_URL" >> .env.tmp
mv .env.tmp .env
echo "✓ .env: VITE_API_URL=$VITE_URL"

# 3) Генерация пароля (≥16 символов, буквы, цифры, спецсимвол)
if command -v openssl >/dev/null 2>&1; then
  ADMIN_PASSWORD="Er$(openssl rand -base64 16 | tr -d '/+=\n' | head -c 14)9!"
else
  ADMIN_PASSWORD="Eterno$(date +%s | tail -c 7)xY!9"
fi
# убедиться, что длина не меньше 12
while [ ${#ADMIN_PASSWORD} -lt 12 ]; do
  ADMIN_PASSWORD="${ADMIN_PASSWORD}X1!"
done

# 4) Пересборка API (чтобы в контейнере была актуальная create-admin-eterno.js)
echo ""
echo "Пересборка API..."
docker compose build --no-cache api 2>/dev/null || docker-compose build --no-cache api

echo "Запуск API (и зависимостей)..."
docker compose up -d api 2>/dev/null || docker-compose up -d api

echo "Ожидание готовности API (до 60 сек)..."
for i in $(seq 1 30); do
  if curl -sf "http://127.0.0.1:4000/health" >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

# 5) Обновить админа в БД
echo ""
echo "Обновление пароля администратора в БД..."
docker compose exec -T api node create-admin-eterno.js "$ADMIN_PASSWORD" 2>/dev/null || \
  docker-compose exec -T api node create-admin-eterno.js "$ADMIN_PASSWORD"

# 6) Пересборка и запуск admin
echo ""
echo "Пересборка админ-панели (с VITE_API_URL)..."
docker compose build --no-cache admin 2>/dev/null || docker-compose build --no-cache admin

echo "Запуск админ-панели..."
docker compose up -d admin 2>/dev/null || docker-compose up -d admin

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  Настройка завершена."
echo "══════════════════════════════════════════════════════════════"
echo "  Админка:  http://${HOST}:3001"
echo "  Email:    admineterno@yandex.ru"
echo "  Пароль:   $ADMIN_PASSWORD"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "  Сохраните пароль в надёжном месте."
echo ""
