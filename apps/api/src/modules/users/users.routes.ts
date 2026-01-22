import { FastifyInstance } from 'fastify';
import usersController from './users.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { UserRole } from '../../constants/roles';

export default async function usersRoutes(fastify: FastifyInstance) {
  // Административные роуты (только для SUPER_ADMIN и ADMIN)
  fastify.get('/admin/users', {
    preHandler: [authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN)],
    schema: {
      description: 'Получить список пользователей',
      tags: ['users', 'admin'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          role: { type: 'string' },
          isActive: { type: 'boolean' },
          search: { type: 'string' },
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        },
      },
    },
  }, usersController.getUsers.bind(usersController));

  fastify.get('/admin/users/:id', {
    preHandler: [authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN)],
    schema: {
      description: 'Получить пользователя по ID',
      tags: ['users', 'admin'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, usersController.getUserById.bind(usersController));

  fastify.post('/admin/users', {
    preHandler: [authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN)],
    schema: {
      description: 'Создать пользователя (только менеджера)',
      tags: ['users', 'admin'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['email', 'password', 'firstName', 'lastName'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { 
            type: 'string', 
            minLength: 8,
            description: 'Пароль должен содержать минимум 8 символов, заглавную и строчную буквы, цифру'
          },
          firstName: { type: 'string', minLength: 1 },
          lastName: { type: 'string', minLength: 1 },
          role: { 
            type: 'string', 
            enum: ['MANAGER'],
            description: 'Можно создать только менеджера'
          },
          isActive: { type: 'boolean', default: true },
        },
      },
    },
  }, usersController.createUser.bind(usersController));

  fastify.put('/admin/users/:id', {
    preHandler: [authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN)],
    schema: {
      description: 'Обновить пользователя',
      tags: ['users', 'admin'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, usersController.updateUser.bind(usersController));

  fastify.delete('/admin/users/:id', {
    preHandler: [authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN)],
    schema: {
      description: 'Удалить пользователя',
      tags: ['users', 'admin'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, usersController.deleteUser.bind(usersController));
}
