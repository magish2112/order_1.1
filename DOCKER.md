# Docker инструкции

## Быстрый старт

### 1. Создайте файл `.env` в корне проекта

```bash
cp .env.example .env
```

Отредактируйте `.env` и установите:
- `JWT_SECRET` - минимум 32 символа
- `JWT_REFRESH_SECRET` - минимум 32 символа
- `POSTGRES_PASSWORD` - пароль для PostgreSQL

### 2. Запустите проект

```bash
docker-compose up -d --build
```

### 3. Проверьте статус

```bash
docker-compose ps
```

Все сервисы должны быть в состоянии "healthy" или "running".

## Структура Docker конфигурации

### Dockerfile для каждого приложения

- `apps/api/Dockerfile` - Backend API (Fastify)
- `apps/web/Dockerfile` - Публичный сайт (Next.js)
- `apps/admin/Dockerfile` - Админ-панель (React + Vite)

### Docker Compose файлы

- `docker-compose.yml` - Production конфигурация
- `docker-compose.dev.yml` - Development конфигурация (overrides)

## Сервисы

### PostgreSQL
- Порт: 5432 (по умолчанию)
- База данных: `order_db` (настраивается через `.env`)
- Volume: `postgres_data`

### Redis
- Порт: 6379 (по умолчанию)
- Volume: `redis_data`

### MinIO
- API порт: 9000
- Console порт: 9001
- Volume: `minio_data`
- Доступ: http://localhost:9001 (minioadmin/minioadmin)

### API
- Порт: 4000
- Healthcheck: `/health`
- Автоматически выполняет миграции Prisma при запуске

### Web
- Порт: 3000
- Next.js standalone режим

### Admin
- Порт: 3001
- Nginx для статики

## Полезные команды

### Просмотр логов

```bash
# Все логи
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f postgres
```

### Перезапуск сервисов

```bash
# Все сервисы
docker-compose restart

# Конкретный сервис
docker-compose restart api
```

### Остановка и очистка

```bash
# Остановка
docker-compose down

# Остановка с удалением volumes (удалит все данные!)
docker-compose down -v

# Пересборка без кеша
docker-compose build --no-cache
```

### Выполнение команд в контейнерах

```bash
# Prisma команды
docker-compose exec api npx prisma studio
docker-compose exec api npx prisma migrate dev

# Shell доступ
docker-compose exec api sh
docker-compose exec postgres psql -U postgres -d order_db
```

## Разработка

Для разработки используйте `docker-compose.dev.yml`:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

Или запустите только инфраструктуру (БД, Redis, MinIO):

```bash
docker-compose up -d postgres redis minio
```

Затем запускайте приложения локально для hot-reload.

## Troubleshooting

### Проблемы с портами

Если порты заняты, измените их в `.env`:

```env
WEB_PORT=3000
ADMIN_PORT=3001
API_PORT=4000
POSTGRES_PORT=5432
```

### Проблемы с миграциями

```bash
# Принудительный запуск миграций
docker-compose exec api npx prisma migrate deploy

# Сброс базы данных (ОСТОРОЖНО!)
docker-compose exec api npx prisma migrate reset
```

### Проблемы с Prisma Client

```bash
# Перегенерация
docker-compose exec api npx prisma generate
```

### Очистка и пересборка

```bash
# Остановка
docker-compose down

# Удаление volumes
docker-compose down -v

# Пересборка
docker-compose build --no-cache

# Запуск
docker-compose up -d
```

## Production деплой

Для production:

1. Обновите переменные окружения в `.env`
2. Измените `CORS_ORIGIN` на домены вашего сайта
3. Используйте внешние сервисы для PostgreSQL, Redis и S3
4. Настройте SSL через Nginx или другой reverse proxy
5. Используйте Docker secrets для чувствительных данных

## Volumes

Проект использует именованные volumes для персистентности данных:

- `postgres_data` - данные PostgreSQL
- `redis_data` - данные Redis
- `minio_data` - файлы MinIO
- `api_uploads` - загруженные файлы API

Для резервного копирования:

```bash
# Backup PostgreSQL
docker-compose exec postgres pg_dump -U postgres order_db > backup.sql

# Restore PostgreSQL
docker-compose exec -T postgres psql -U postgres order_db < backup.sql
```

