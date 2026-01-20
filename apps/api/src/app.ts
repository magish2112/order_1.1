import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { PrismaClient } from '@prisma/client';
import env from './config/env';
import prisma from './config/database';
import redis from './config/redis';

// Импорт роутов
import authRoutes from './modules/auth/auth.routes';
import servicesRoutes from './modules/services/services.routes';
import projectsRoutes from './modules/projects/projects.routes';
import articlesRoutes from './modules/articles/articles.routes';
import requestsRoutes from './modules/requests/requests.routes';
import employeesRoutes from './modules/employees/employees.routes';
import reviewsRoutes from './modules/reviews/reviews.routes';
import vacanciesRoutes from './modules/vacancies/vacancies.routes';
import faqsRoutes from './modules/faqs/faqs.routes';
import calculatorRoutes from './modules/calculator/calculator.routes';
import settingsRoutes from './modules/settings/settings.routes';
import mediaRoutes from './modules/media/media.routes';
import statsRoutes from './modules/stats/stats.routes';
import { errorHandler } from './middleware/error.middleware';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
    redis: typeof redis;
  }
}

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport:
        env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    },
    disableRequestLogging: false,
  });

  // Регистрация Prisma
  app.decorate('prisma', prisma);
  app.decorate('redis', redis);

  // CORS
  await app.register(cors, {
    origin: env.CORS_ORIGIN.split(','),
    credentials: true,
  });

  // JWT
  await app.register(jwt, {
    secret: env.JWT_SECRET,
  });

  // Multipart (загрузка файлов)
  await app.register(multipart, {
    limits: {
      fileSize: env.MAX_FILE_SIZE,
    },
  });

  // Rate limiting
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Swagger документация
  if (env.NODE_ENV !== 'production') {
    await app.register(swagger, {
      swagger: {
        info: {
          title: 'API для сайта ремонтно-строительной компании',
          description: 'API документация',
          version: '1.0.0',
        },
        host: `localhost:${env.PORT}`,
        schemes: ['http', 'https'],
        consumes: ['application/json'],
        produces: ['application/json'],
        tags: [
          { name: 'auth', description: 'Аутентификация' },
          { name: 'services', description: 'Услуги' },
          { name: 'projects', description: 'Проекты' },
          { name: 'articles', description: 'Статьи' },
          { name: 'requests', description: 'Заявки' },
        ],
        securityDefinitions: {
          bearerAuth: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header',
            description: 'JWT токен в формате: Bearer <token>',
          },
        },
      },
    });

    await app.register(swaggerUi, {
      routePrefix: '/api/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: false,
      },
    });
  }

  // Root route
  app.get('/', async () => {
    return {
      message: 'API для сайта ремонтно-строительной компании',
      version: '1.0.0',
      docs: '/api/docs',
      health: '/health',
    };
  });

  // Health check
  app.get('/health', async () => {
    let databaseStatus = 'unknown';
    let redisStatus = 'disabled';

    // Проверка подключения к базе данных (SQLite или PostgreSQL)
    try {
      // Для SQLite и PostgreSQL используется простой запрос
      await prisma.$queryRawUnsafe('SELECT 1');
      databaseStatus = 'connected';
    } catch (error) {
      databaseStatus = 'disconnected';
      app.log.warn({ error }, 'Database health check failed');
    }

    // Проверка подключения к Redis
    if (redis) {
      try {
        const result = await redis.ping();
        redisStatus = result === 'PONG' ? 'connected' : 'disconnected';
      } catch (error) {
        redisStatus = 'disconnected';
        app.log.warn({ error }, 'Redis health check failed');
      }
    }

    const overallStatus = databaseStatus === 'connected' ? 'ok' : 'degraded';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      database: databaseStatus,
      redis: redisStatus,
    };
  });

  // Статические файлы из uploads
  const { resolve } = await import('path');
  const uploadDir = env.UPLOAD_DIR || './uploads';
  const uploadPath = uploadDir.startsWith('/') || uploadDir.match(/^[A-Z]:/) 
    ? uploadDir 
    : resolve(process.cwd(), uploadDir);
  
  const staticPlugin = await import('@fastify/static');
  await app.register(staticPlugin.default, {
    root: uploadPath,
    prefix: env.PUBLIC_UPLOAD_URL || '/uploads',
    decorateReply: false,
  });

  // Регистрация роутов
  await app.register(authRoutes, { prefix: '/api/v1' });
  await app.register(servicesRoutes, { prefix: '/api/v1' });
  await app.register(projectsRoutes, { prefix: '/api/v1' });
  await app.register(articlesRoutes, { prefix: '/api/v1' });
  await app.register(requestsRoutes, { prefix: '/api/v1' });
  await app.register(employeesRoutes, { prefix: '/api/v1' });
  await app.register(reviewsRoutes, { prefix: '/api/v1' });
  await app.register(vacanciesRoutes, { prefix: '/api/v1' });
  await app.register(faqsRoutes, { prefix: '/api/v1' });
  await app.register(calculatorRoutes, { prefix: '/api/v1' });
  await app.register(settingsRoutes, { prefix: '/api/v1' });
  await app.register(mediaRoutes, { prefix: '/api/v1' });
  await app.register(statsRoutes, { prefix: '/api/v1' });

  // Обработка ошибок (должен быть последним)
  app.setErrorHandler(errorHandler);

  return app;
}

