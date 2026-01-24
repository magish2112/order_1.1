import { FastifyInstance } from 'fastify';
import faqsController from './faqs.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { UserRole } from '../../constants/roles';

export default async function faqsRoutes(fastify: FastifyInstance) {
  // Публичные роуты
  fastify.get('/faqs', {
    schema: {
      description: 'Получить список активных FAQ',
      tags: ['faqs'],
      querystring: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        },
      },
    },
  }, faqsController.getFaqs.bind(faqsController));

  // Административные роуты
  fastify.get('/admin/faqs', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER)],
    schema: {
      description: 'Получить список FAQ (админ)',
      tags: ['faqs', 'admin'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          isActive: { type: 'boolean' },
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        },
      },
    },
  }, faqsController.getFaqsAdmin.bind(faqsController));

  fastify.get('/admin/faqs/:id', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER)],
    schema: {
      description: 'Получить FAQ по ID',
      tags: ['faqs', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, faqsController.getFaqById.bind(faqsController));

  fastify.post('/admin/faqs', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER)],
    schema: {
      description: 'Создать FAQ',
      tags: ['faqs', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, faqsController.createFaq.bind(faqsController));

  fastify.put('/admin/faqs/:id', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER)],
    schema: {
      description: 'Обновить FAQ',
      tags: ['faqs', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, faqsController.updateFaq.bind(faqsController));

  fastify.delete('/admin/faqs/:id', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN)],
    schema: {
      description: 'Удалить FAQ',
      tags: ['faqs', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, faqsController.deleteFaq.bind(faqsController));
}


