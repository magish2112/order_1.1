# Backend API

Backend API для сайта ремонтно-строительной компании на базе Fastify, TypeScript и Prisma.

## Технологический стек

- **Node.js** 20.x
- **Fastify** 4.x - веб-фреймворк
- **TypeScript** 5.x - типизация
- **Prisma** 5.x - ORM для работы с БД
- **PostgreSQL** 16.x - база данных
- **Redis** 7.x - кеширование (опционально)
- **Zod** 3.x - валидация данных
- **JWT** - аутентификация
- **Pino** - логирование

## Установка

1. Установите зависимости:
```bash
npm install
```

2. Скопируйте файл `.env.example` в `.env` и заполните переменные окружения:
```bash
cp .env.example .env
```

3. Настройте подключение к базе данных в `.env`:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/magass?schema=public"
```

4. Запустите миграции Prisma:
```bash
npm run prisma:migrate
```

5. (Опционально) Заполните базу данных тестовыми данными:
```bash
npm run prisma:seed
```

6. Сгенерируйте Prisma Client:
```bash
npm run prisma:generate
```

## Запуск

### Разработка
```bash
npm run dev
```

### Продакшн
```bash
npm run build
npm start
```

## API Документация

После запуска сервера документация доступна по адресу:
- Swagger UI: http://localhost:4000/api/docs

## Структура проекта

```
apps/api/
├── prisma/
│   ├── schema.prisma       # Prisma схема БД
│   ├── migrations/         # Миграции БД
│   └── seed.ts            # Seed скрипт
├── src/
│   ├── config/            # Конфигурация (env, db, redis)
│   ├── middleware/        # Middleware (auth, validation, error)
│   ├── modules/           # Модули приложения
│   │   ├── auth/          # Аутентификация
│   │   ├── services/      # Услуги
│   │   ├── projects/      # Проекты
│   │   ├── articles/      # Статьи
│   │   └── ...           # Другие модули
│   ├── utils/             # Утилиты
│   ├── app.ts            # Настройка Fastify приложения
│   └── server.ts         # Точка входа
└── package.json
```

## Переменные окружения

Основные переменные окружения (см. `.env.example`):

- `DATABASE_URL` - URL подключения к PostgreSQL
- `REDIS_URL` - URL подключения к Redis (опционально)
- `JWT_SECRET` - Секретный ключ для JWT токенов
- `JWT_REFRESH_SECRET` - Секретный ключ для refresh токенов
- `PORT` - Порт сервера (по умолчанию 4000)
- `NODE_ENV` - Окружение (development/production)

## API Endpoints

### Публичные эндпоинты
- `GET /api/v1/services` - Список услуг
- `GET /api/v1/projects` - Портфолио
- `GET /api/v1/articles` - Статьи
- `POST /api/v1/requests` - Создание заявки

### Административные эндпоинты (требуют аутентификации)
- `POST /api/v1/admin/auth/login` - Вход в админку
- `GET /api/v1/admin/auth/me` - Информация о текущем пользователе
- CRUD операции для всех сущностей

Полный список эндпоинтов см. в Swagger документации.

## Разработка

### Создание новой миграции
```bash
npm run prisma:migrate
```

### Открыть Prisma Studio
```bash
npm run prisma:studio
```

### Проверка типов TypeScript
```bash
npm run typecheck
```

### Линтинг
```bash
npm run lint
```

