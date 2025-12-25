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

  // Health check
  app.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: await prisma.$queryRaw`SELECT 1`.then(() => 'connected').catch(() => 'disconnected'),
      redis: redis ? (redis.status === 'ready' ? 'connected' : 'disconnected') : 'disabled',
    };
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

