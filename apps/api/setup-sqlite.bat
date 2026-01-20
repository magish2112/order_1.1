@echo off
REM Скрипт для настройки SQLite базы данных (Windows)

echo 🔄 Настройка SQLite базы данных...
echo.

REM Удаляем старую папку миграций PostgreSQL
if exist "prisma\migrations" (
    echo 📦 Удаляем старые миграции PostgreSQL...
    rmdir /s /q "prisma\migrations"
)

REM Удаляем старую базу данных (если есть)
if exist "dev.db" (
    echo 🗑️  Удаляем старую базу dev.db...
    del /f /q "dev.db"
)

if exist "production.db" (
    echo 🗑️  Удаляем старую базу production.db...
    del /f /q "production.db"
)

echo.
echo 🔨 Создание новых миграций для SQLite...
call npx prisma migrate dev --name init_sqlite

echo.
echo ⚙️  Генерация Prisma Client...
call npx prisma generate

echo.
echo 🌱 Заполнение базы данных...
call npm run prisma:seed

echo.
echo ✅ SQLite база данных настроена!
echo.
echo 📊 База данных создана: dev.db
echo 👤 Администратор: admin@example.com / admin123
echo.
echo 🚀 Запустите сервер: npm run dev
pause
