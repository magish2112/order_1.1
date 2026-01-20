import { FastifyInstance } from 'fastify';
import mediaController from './media.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { UserRole } from '../../constants/roles';

export default async function mediaRoutes(fastify: FastifyInstance) {
  // Административные роуты (только для админов)
  fastify.post('/admin/media/upload', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.EDITOR)],
    schema: {
      description: 'Загрузить медиафайл',
      tags: ['media', 'admin'],
      security: [{ bearerAuth: [] }],
      consumes: ['multipart/form-data'],
      querystring: {
        type: 'object',
        properties: {
          folder: { type: 'string' },
        },
      },
    },
  }, mediaController.uploadFile.bind(mediaController));

  fastify.get('/admin/media', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.EDITOR)],
    schema: {
      description: 'Получить список медиафайлов',
      tags: ['media', 'admin'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          folder: { type: 'string' },
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
        },
      },
    },
  }, mediaController.getMediaFiles.bind(mediaController));

  fastify.get('/admin/media/:id', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.EDITOR)],
    schema: {
      description: 'Получить медиафайл по ID',
      tags: ['media', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, mediaController.getMediaById.bind(mediaController));

  fastify.delete('/admin/media/:id', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN)],
    schema: {
      description: 'Удалить медиафайл',
      tags: ['media', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, mediaController.deleteMedia.bind(mediaController));
}


