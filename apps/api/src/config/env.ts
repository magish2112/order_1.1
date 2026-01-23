import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default('0.0.0.0'),
  
  DATABASE_URL: z.string(), // PostgreSQL URL (рекомендуется для продакшена) или SQLite file: путь (для разработки)
  REDIS_URL: z.string().optional(), // Redis URL (redis://host:port) - может не быть валидным URL при парсинге, поэтому не применяем .url()
  
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email().optional().or(z.literal('')),
  
  MAX_FILE_SIZE: z.coerce.number().default(10485760), // 10MB
  UPLOAD_DIR: z.string().default('./uploads'),
  PUBLIC_UPLOAD_URL: z.string().default('/uploads'), // Путь для доступа к статическим файлам
  
  S3_ENDPOINT: z.string().url().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_USE_SSL: z.coerce.boolean().default(false),
  
  CORS_ORIGIN: z.string().default('http://localhost:3000,http://localhost:3001'),
  
  // Admin URL для ссылок в email уведомлениях
  ADMIN_URL: z.string().url().optional().or(z.literal('')),
  
  // Тестовые credentials (только для development)
  DEV_ADMIN_EMAIL: z.string().email().optional(),
  DEV_ADMIN_PASSWORD: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    // В тестовом окружении не завершаем процесс, а устанавливаем значения по умолчанию
    if (process.env.NODE_ENV === 'test') {
      // Устанавливаем значения по умолчанию для тестов
      const defaultEnv: Record<string, unknown> = {
        NODE_ENV: 'test',
        PORT: 4000,
        HOST: '0.0.0.0',
        DATABASE_URL: process.env.DATABASE_URL || process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/test_db',
        JWT_SECRET: process.env.JWT_SECRET || 'test-jwt-secret-key-minimum-32-characters-long-for-testing',
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'test-jwt-refresh-secret-key-minimum-32-characters-long-for-testing',
        JWT_ACCESS_EXPIRY: '15m',
        JWT_REFRESH_EXPIRY: '7d',
        CORS_ORIGIN: 'http://localhost:3000,http://localhost:3001',
        MAX_FILE_SIZE: 10485760,
        UPLOAD_DIR: './uploads',
        PUBLIC_UPLOAD_URL: '/uploads',
      };
      env = envSchema.parse(defaultEnv);
    } else {
      console.error('❌ Ошибка валидации переменных окружения:');
      error.errors.forEach((err) => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
  } else {
    throw error;
  }
}

export default env;

