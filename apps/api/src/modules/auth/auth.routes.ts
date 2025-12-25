import { FastifyInstance } from 'fastify';
import authController from './auth.controller';
import authService from './auth.service';
import { authenticate } from '../../middleware/auth.middleware';

export default async function authRoutes(fastify: FastifyInstance) {
  // Устанавливаем экземпляр Fastify в сервис для работы с JWT
  authService.setFastifyInstance(fastify);
  // Публичные роуты
  fastify.post('/auth/login', {
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

  // Административные роуты
  fastify.post('/admin/auth/login', {
    schema: {
      description: 'Аутентификация администратора',
      tags: ['auth', 'admin'],
    },
  }, authController.login.bind(authController));
}

