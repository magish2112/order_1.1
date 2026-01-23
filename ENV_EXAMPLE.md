# 📝 ПРИМЕР ФАЙЛА .env ДЛЯ ПРОДАКШЕНА

Создайте файл `.env` в корне проекта и в `apps/api/` с таким содержимым:

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

# CORS - укажите домены вашего сайта
CORS_ORIGIN=https://yourdomain.com,https://admin.yourdomain.com

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
PUBLIC_UPLOAD_URL=/uploads

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
