import { defineConfig } from 'vitest/config';
import path from 'path';
import { config } from 'dotenv';

// Загружаем переменные окружения для тестов
config({ path: '.env.test' });
config({ path: '.env' }); // Fallback на основной .env

// Устанавливаем значения по умолчанию для тестов, если они не заданы
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/test_db';
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-jwt-secret-key-minimum-32-characters-long-for-testing';
}
if (!process.env.JWT_REFRESH_SECRET) {
  process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-minimum-32-characters-long-for-testing';
}
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test';
}

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '**/*.config.*',
        '**/*.d.ts',
        'prisma/',
      ],
    },
    testTimeout: 10000,
    env: {
      NODE_ENV: 'test',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

