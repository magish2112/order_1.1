import { FastifyInstance } from 'fastify';
import authController from './auth.controller';
import authService from './auth.service';
import { authenticate } from '../../middleware/auth.middleware';
import { authRateLimit } from '../../middleware/auth-rate-limit';

export default async function authRoutes(fastify: FastifyInstance) {
  // Устанавливаем экземпляр Fastify в сервис для работы с JWT
  authService.setFastifyInstance(fastify);
  // Публичные роуты (строгий rate limit: 10 попыток/мин на IP)
  fastify.post('/auth/login', {
    preHandler: [authRateLimit],
    schema: {
      description: 'Аутентификация пользователя',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    role: { type: 'string' },
                  },
                },
                tokens: {
                  type: 'object',
                  properties: {
                    accessToken: { type: 'string' },
                    refreshToken: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  }, authController.login.bind(authController));

  fastify.post('/auth/refresh', {
    preHandler: [authRateLimit],
    schema: {
      description: 'Обновление access token',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
        },
      },
    },
  }, authController.refreshToken.bind(authController));

  // Защищенные роуты
  fastify.get('/auth/me', {
    preHandler: [authenticate],
    schema: {
      description: 'Получение информации о текущем пользователе',
      tags: ['auth'],
      security: [{ bearerAuth: [] }],
    },
  }, authController.me.bind(authController));

  fastify.post('/auth/logout', {
    preHandler: [authenticate],
    schema: {
      description: 'Выход из системы',
      tags: ['auth'],
      security: [{ bearerAuth: [] }],
    },
  }, authController.logout.bind(authController));

  // Административные роуты (строгий rate limit)
  fastify.post('/admin/auth/login', {
    preHandler: [authRateLimit],
    schema: {
      description: 'Аутентификация администратора',
      tags: ['auth', 'admin'],
    },
  }, authController.login.bind(authController));

  fastify.post('/admin/auth/refresh', {
    preHandler: [authRateLimit],
    schema: {
      description: 'Обновление access token (админ)',
      tags: ['auth', 'admin'],
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
        },
      },
    },
  }, authController.refreshToken.bind(authController));

  fastify.get('/admin/auth/me', {
    preHandler: [authenticate],
    schema: {
      description: 'Получение информации о текущем пользователе (админ)',
      tags: ['auth', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, authController.me.bind(authController));

  fastify.post('/admin/auth/logout', {
    preHandler: [authenticate],
    schema: {
      description: 'Выход из системы (админ)',
      tags: ['auth', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, authController.logout.bind(authController));
}


