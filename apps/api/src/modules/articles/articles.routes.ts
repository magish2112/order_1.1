import { FastifyInstance } from 'fastify';
import articlesController from './articles.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { UserRole } from '../../constants/roles';

export default async function articlesRoutes(fastify: FastifyInstance) {
  // Публичные роуты
  fastify.get('/articles', {
    schema: {
      description: 'Получить список статей',
      tags: ['articles'],
      querystring: {
        type: 'object',
        properties: {
          categoryId: { type: 'string' },
          authorId: { type: 'string' },
          tag: { type: 'string' },
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          sortBy: { type: 'string', enum: ['createdAt', 'publishedAt', 'viewsCount'], default: 'publishedAt' },
          sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
          search: { type: 'string' },
        },
      },
    },
  }, articlesController.getArticles.bind(articlesController));

  fastify.get('/articles/categories', {
    schema: {
      description: 'Получить категории статей',
      tags: ['articles'],
    },
  }, articlesController.getArticleCategories.bind(articlesController));

  // ✅ НОВЫЙ: Получить категорию статей по slug с её статьями
  fastify.get<{ Params: { slug: string } }>('/articles/categories/:slug', {
    schema: {
      description: 'Получить категорию статей по slug с публикациями',
      tags: ['articles'],
      params: {
        type: 'object',
        required: ['slug'],
        properties: {
          slug: { type: 'string' },
        },
      },
    },
  }, articlesController.getArticleCategoryBySlug.bind(articlesController));

  fastify.get('/articles/:slug', {
    schema: {
      description: 'Получить статью по slug',
      tags: ['articles'],
      params: {
        type: 'object',
        required: ['slug'],
        properties: {
          slug: { type: 'string' },
        },
      },
    },
  }, articlesController.getArticleBySlug.bind(articlesController));

  // Административные роуты
  fastify.get('/admin/articles', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.EDITOR)],
    schema: {
      description: 'Получить список статей (админ)',
      tags: ['articles', 'admin'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          categoryId: { type: 'string' },
          authorId: { type: 'string' },
          tag: { type: 'string' },
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          sortBy: { type: 'string', enum: ['createdAt', 'publishedAt', 'viewsCount'], default: 'publishedAt' },
          sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
          search: { type: 'string' },
          isPublished: { type: 'boolean' },
        },
      },
    },
  }, articlesController.getArticlesAdmin.bind(articlesController));

  fastify.get('/admin/articles/:id', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.EDITOR)],
    schema: {
      description: 'Получить статью по ID (админ)',
      tags: ['articles', 'admin'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, articlesController.getArticleById.bind(articlesController));

  fastify.post('/admin/articles', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.EDITOR)],
    schema: {
      description: 'Создать статью',
      tags: ['articles', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, articlesController.createArticle.bind(articlesController));

  fastify.put('/admin/articles/:id', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.EDITOR)],
    schema: {
      description: 'Обновить статью',
      tags: ['articles', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, articlesController.updateArticle.bind(articlesController));

  fastify.delete('/admin/articles/:id', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN)],
    schema: {
      description: 'Удалить статью',
      tags: ['articles', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, articlesController.deleteArticle.bind(articlesController));

  fastify.patch('/admin/articles/:id/publish', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.EDITOR)],
    schema: {
      description: 'Опубликовать статью',
      tags: ['articles', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, articlesController.publishArticle.bind(articlesController));

  // ✅ НОВЫЕ ENDPOINTS ДЛЯ УПРАВЛЕНИЯ КАТЕГОРИЯМИ

  fastify.post('/admin/articles/categories', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN)],
    schema: {
      description: 'Создать категорию статей',
      tags: ['articles', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, articlesController.createArticleCategory.bind(articlesController));

  fastify.put<{ Params: { id: string } }>('/admin/articles/categories/:id', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN)],
    schema: {
      description: 'Обновить категорию статей',
      tags: ['articles', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, articlesController.updateArticleCategory.bind(articlesController));

  fastify.delete<{ Params: { id: string } }>('/admin/articles/categories/:id', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN)],
    schema: {
      description: 'Удалить категорию статей',
      tags: ['articles', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, articlesController.deleteArticleCategory.bind(articlesController));
}


