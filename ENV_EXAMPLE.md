# 📝 ПРИМЕР ФАЙЛА .env ДЛЯ ПРОДАКШЕНА

Создайте файл `.env` в **корне проекта** (для docker-compose) и при необходимости в `apps/api/` для запуска API отдельно.

## Корень проекта .env (для docker-compose)

Переменные, которые читает `docker compose` (или `docker-compose`) при `up`/`build`:

```env
POSTGRES_PASSWORD=надёжный_пароль
MINIO_ROOT_PASSWORD=надёжный_пароль
JWT_SECRET=минимум_32_символа
JWT_REFRESH_SECRET=другой_минимум_32_символа

# CORS — origins сайта и админки (через запятую)
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
# Деплой по IP: CORS_ORIGIN=http://46.17.102.76:3000,http://46.17.102.76:3001

# URL сайта (для логотипа, изображений, canonical)
NEXT_PUBLIC_SITE_URL=https://eternostroy.ru

# URL API для браузера — встраивается в Web при сборке. Должен быть доступен из браузера!
NEXT_PUBLIC_API_URL=https://eternostroy.ru
# При доступе по IP: NEXT_PUBLIC_API_URL=http://46.17.102.76:4000

# URL API для Админ-панели (Vite, встраивается при сборке). Должен заканчиваться на /api/v1
VITE_API_URL=http://46.17.102.76:4000/api/v1
# С доменом: VITE_API_URL=https://api.yourdomain.com/api/v1
```

После смены `NEXT_PUBLIC_API_URL`, `VITE_API_URL` или `CORS_ORIGIN` нужно **пересобрать** соответствующий образ:
- Web: `docker compose build --no-cache web && ./scripts/compose.sh up -d web`
- Admin: `docker compose build --no-cache admin && ./scripts/compose.sh up -d admin`

---

## apps/api/.env (Production)

```env
# Environment
NODE_ENV=production
PORT=4000
HOST=0.0.0.0

# Database - PostgreSQL (рекомендуется для продакшена)
# Формат: postgresql://user:password@host:port/database
DATABASE_URL=postgresql://postgres:your_secure_password@postgres:5432/order_db

# Или для локальной разработки можно использовать SQLite:
# DATABASE_URL=file:./dev.db

# JWT - ОБЯЗАТЕЛЬНО ПОМЕНЯЙТЕ В ПРОДАКШЕНЕ!
JWT_SECRET=change-this-to-random-32-characters-or-more
JWT_REFRESH_SECRET=change-this-to-different-random-32-characters-or-more
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS - укажите домены или IP вашего сайта и админки
CORS_ORIGIN=https://yourdomain.com,https://admin.yourdomain.com
# Пример по IP: CORS_ORIGIN=http://46.17.102.76:3000,http://46.17.102.76:3001

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
PUBLIC_UPLOAD_URL=/uploads

# Создание первого администратора (только для create-admin-eterno)
# ADMIN_INITIAL_PASSWORD=надёжный_пароль_при_первом_запуске

# Email (опционально - для отправки уведомлений)
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@yourdomain.com
```

## apps/api/.env (Development)

```env
# Environment
NODE_ENV=development
PORT=4000
HOST=0.0.0.0

# Database - PostgreSQL (рекомендуется) или SQLite для разработки
# PostgreSQL:
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/order_db
# Или SQLite для быстрой разработки:
# DATABASE_URL=file:./dev.db

# JWT
JWT_SECRET=development-jwt-secret-key-minimum-32-characters-long-for-security
JWT_REFRESH_SECRET=development-jwt-refresh-secret-key-minimum-32-characters-long-for-security
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3003

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
PUBLIC_UPLOAD_URL=/uploads
API_BASE_URL=http://localhost:4000
```

## ⚠️ ВАЖНО ДЛЯ ПРОДАКШЕНА

1. **JWT_SECRET и JWT_REFRESH_SECRET**
   - Должны быть разные
   - Минимум 32 символа
   - Случайные и уникальные
   - Сгенерировать можно командой:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **CORS_ORIGIN**
   - Укажите реальные домены вашего сайта
   - Разделяйте запятой без пробелов
   - Пример: `https://mysite.ru,https://admin.mysite.ru`

3. **DATABASE_URL**
   - Для продакшена: `postgresql://user:password@host:5432/database`
   - Для разработки можно использовать SQLite: `file:./dev.db`
   - Пример PostgreSQL: `postgresql://postgres:mypassword@localhost:5432/order_db`

4. **База данных PostgreSQL**
   - Регулярно делайте backup базы данных
   - Используйте `pg_dump` для создания резервных копий
   - Настройте автоматический backup через cron или pgBackRest
   - Храните бэкапы в безопасном месте

5. **Админ-панель: «Неверный email или пароль»**
   - **Автоматически:** по SSH на сервере, в корне проекта:  
     `bash scripts/setup-admin-production.sh 46.17.102.76`  
     (добавит `VITE_API_URL` в `.env`, пересоберёт API и admin, сгенерирует пароль, выведет данные для входа).
   - **Вручную:**
     - В `.env` задайте `VITE_API_URL=http://ВАШ_IP:4000/api/v1` и пересоберите админку:  
       `docker compose build --no-cache admin && docker compose up -d admin`  
       Иначе форма логина обращается к `localhost:4000`, а не к вашему API.
     - Задайте надёжный пароль и обновите админа в БД:
       ```bash
       docker compose exec -T api node create-admin-eterno.js 'ВашНадёжныйПароль12!@'
       ```
     Email: `admineterno@yandex.ru`. После смены пароля сохраните его в надёжном месте.
