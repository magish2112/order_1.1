import { FastifyInstance } from 'fastify';
import reviewsController from './reviews.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

export default async function reviewsRoutes(fastify: FastifyInstance) {
  // Публичные роуты
  fastify.get('/reviews', {
    schema: {
      description: 'Получить список одобренных отзывов',
      tags: ['reviews'],
      querystring: {
        type: 'object',
        properties: {
          projectId: { type: 'string' },
          source: { type: 'string' },
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        },
      },
    },
  }, reviewsController.getReviews.bind(reviewsController));

  // Административные роуты
  fastify.get('/admin/reviews/:id', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER)],
    schema: {
      description: 'Получить отзыв по ID',
      tags: ['reviews', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, reviewsController.getReviewById.bind(reviewsController));

  fastify.post('/admin/reviews', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER)],
    schema: {
      description: 'Создать отзыв',
      tags: ['reviews', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, reviewsController.createReview.bind(reviewsController));

  fastify.put('/admin/reviews/:id', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER)],
    schema: {
      description: 'Обновить отзыв',
      tags: ['reviews', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, reviewsController.updateReview.bind(reviewsController));

  fastify.delete('/admin/reviews/:id', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN)],
    schema: {
      description: 'Удалить отзыв',
      tags: ['reviews', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, reviewsController.deleteReview.bind(reviewsController));

  fastify.patch('/admin/reviews/:id/approve', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER)],
    schema: {
      description: 'Одобрить отзыв',
      tags: ['reviews', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, reviewsController.approveReview.bind(reviewsController));
}

