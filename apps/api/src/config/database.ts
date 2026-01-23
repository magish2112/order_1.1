import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { resolve } from 'path';
import env from './env';

// Загружаем .env файл явно из правильной директории
const envPath = resolve(__dirname, '../../.env');
config({ path: envPath });

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Убеждаемся, что DATABASE_URL установлен
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ DATABASE_URL не установлен в переменных окружения');
  console.error('Проверьте файл .env в корне проекта apps/api/');
  console.error('Текущая рабочая директория:', process.cwd());
  console.error('Путь к .env:', envPath);
  process.exit(1);
}

// Проверяем формат DATABASE_URL (поддержка PostgreSQL и SQLite)
if (!databaseUrl.startsWith('postgresql://') && 
    !databaseUrl.startsWith('postgres://') && 
    !databaseUrl.startsWith('file:')) {
  console.error('❌ DATABASE_URL должен начинаться с postgresql://, postgres:// или file:');
  console.error('Текущее значение:', databaseUrl);
  console.error('Для продакшена рекомендуется использовать PostgreSQL');
  process.exit(1);
}

// Явно устанавливаем DATABASE_URL для Prisma
process.env.DATABASE_URL = databaseUrl;

export const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;

