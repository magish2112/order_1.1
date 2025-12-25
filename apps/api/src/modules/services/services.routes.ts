import { FastifyInstance } from 'fastify';
import servicesController from './services.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

export default async function servicesRoutes(fastify: FastifyInstance) {
  // ==================== ПУБЛИЧНЫЕ РОУТЫ ====================

  // Категории
  fastify.get('/categories', {
    schema: {
      description: 'Получить дерево категорий услуг',
      tags: ['services'],
      querystring: {
        type: 'object',
        properties: {
          isActive: { type: 'boolean' },
        },
      },
    },
  }, servicesController.getCategoriesTree.bind(servicesController));

  fastify.get('/categories/:slug', {
    schema: {
      description: 'Получить категорию по slug',
      tags: ['services'],
      params: {
        type: 'object',
        required: ['slug'],
        properties: {
          slug: { type: 'string' },
        },
      },
    },
  }, servicesController.getCategoryBySlug.bind(servicesController));

  // Услуги
  fastify.get('/services', {
    schema: {
      description: 'Получить список услуг',
      tags: ['services'],
      querystring: {
        type: 'object',
        properties: {
          categoryId: { type: 'string' },
          isActive: { type: 'boolean' },
          isFeatured: { type: 'boolean' },
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          search: { type: 'string' },
        },
      },
    },
  }, servicesController.getServices.bind(servicesController));

  fastify.get('/services/:slug', {
    schema: {
      description: 'Получить услугу по slug',
      tags: ['services'],
      params: {
        type: 'object',
        required: ['slug'],
        properties: {
          slug: { type: 'string' },
        },
      },
    },
  }, servicesController.getServiceBySlug.bind(servicesController));

  // ==================== АДМИНИСТРАТИВНЫЕ РОУТЫ ====================

  // Категории
  fastify.post('/admin/categories', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER)],
    schema: {
      description: 'Создать категорию',
      tags: ['services', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, servicesController.createCategory.bind(servicesController));

  fastify.put('/admin/categories/:id', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER)],
    schema: {
      description: 'Обновить категорию',
      tags: ['services', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, servicesController.updateCategory.bind(servicesController));

  fastify.delete('/admin/categories/:id', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN)],
    schema: {
      description: 'Удалить категорию',
      tags: ['services', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, servicesController.deleteCategory.bind(servicesController));

  // Услуги
  fastify.post('/admin/services', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER)],
    schema: {
      description: 'Создать услугу',
      tags: ['services', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, servicesController.createService.bind(servicesController));

  fastify.put('/admin/services/:id', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER)],
    schema: {
      description: 'Обновить услугу',
      tags: ['services', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, servicesController.updateService.bind(servicesController));

  fastify.delete('/admin/services/:id', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN)],
    schema: {
      description: 'Удалить услугу',
      tags: ['services', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, servicesController.deleteService.bind(servicesController));
}

