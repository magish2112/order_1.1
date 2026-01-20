import { FastifyInstance } from 'fastify';
import projectsController from './projects.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { UserRole } from '../../constants/roles';

export default async function projectsRoutes(fastify: FastifyInstance) {
  // Публичные роуты
  fastify.get('/projects', {
    schema: {
      description: 'Получить список проектов с фильтрацией',
      tags: ['projects'],
      querystring: {
        type: 'object',
        properties: {
          categoryId: { type: 'string' },
          serviceId: { type: 'string' },
          propertyType: { type: 'string' },
          style: { type: 'string' },
          repairType: { type: 'string' },
          rooms: { type: 'integer' },
          areaFrom: { type: 'number' },
          areaTo: { type: 'number' },
          isActive: { type: 'boolean' },
          isFeatured: { type: 'boolean' },
          tags: { type: 'string' },
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          sortBy: { type: 'string', enum: ['createdAt', 'completedAt', 'viewsCount', 'price'], default: 'createdAt' },
          sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
          search: { type: 'string' },
        },
      },
    },
  }, projectsController.getProjects.bind(projectsController));

  fastify.get('/projects/featured', {
    schema: {
      description: 'Получить избранные проекты',
      tags: ['projects'],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
        },
      },
    },
  }, projectsController.getFeaturedProjects.bind(projectsController));

  fastify.get('/projects/:slug', {
    schema: {
      description: 'Получить проект по slug',
      tags: ['projects'],
      params: {
        type: 'object',
        required: ['slug'],
        properties: {
          slug: { type: 'string' },
        },
      },
    },
  }, projectsController.getProjectBySlug.bind(projectsController));

  // Административные роуты
  fastify.get('/admin/projects', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.EDITOR)],
    schema: {
      description: 'Получить список проектов (админ)',
      tags: ['projects', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, projectsController.getProjects.bind(projectsController));

  fastify.get('/admin/projects/:id', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.EDITOR)],
    schema: {
      description: 'Получить проект по ID (админ)',
      tags: ['projects', 'admin'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, projectsController.getProjectById.bind(projectsController));

  fastify.post('/admin/projects', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.EDITOR)],
    schema: {
      description: 'Создать проект',
      tags: ['projects', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, projectsController.createProject.bind(projectsController));

  fastify.put('/admin/projects/:id', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.EDITOR)],
    schema: {
      description: 'Обновить проект',
      tags: ['projects', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, projectsController.updateProject.bind(projectsController));

  fastify.delete('/admin/projects/:id', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN)],
    schema: {
      description: 'Удалить проект',
      tags: ['projects', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, projectsController.deleteProject.bind(projectsController));
}


