import { beforeAll, afterAll, beforeEach } from 'vitest';
import { execSync } from 'child_process';
import prisma from '../src/config/database';

beforeAll(async () => {
  // Запускаем миграции для тестовой БД
  const testDbUrl = (globalThis as any).process?.env?.TEST_DATABASE_URL;
  if (testDbUrl) {
    try {
      execSync('npx prisma migrate deploy', {
        env: { ...(globalThis as any).process.env, DATABASE_URL: testDbUrl },
        stdio: 'inherit',
      });
    } catch (error) {
      console.warn('Миграции не выполнены, возможно БД уже актуальна');
    }
  }
});

beforeEach(async () => {
  // Очищаем БД перед каждым тестом
  // Внимание: это удалит все данные!
  const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;

  for (const { tablename } of tablenames) {
    if (tablename !== '_prisma_migrations') {
      try {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
      } catch (error) {
        console.log({ error });
      }
    }
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

// Экспортируем для использования в тестах
export { prisma };

