import { FastifyInstance } from 'fastify';
import requestsController from './requests.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { UserRole } from '../../constants/roles';

export default async function requestsRoutes(fastify: FastifyInstance) {
  // Публичные роуты
  fastify.post('/requests', {
    schema: {
      description: 'Создать заявку',
      tags: ['requests'],
    },
  }, requestsController.createRequest.bind(requestsController));

  fastify.post('/requests/callback', {
    schema: {
      description: 'Заказ обратного звонка',
      tags: ['requests'],
    },
  }, requestsController.createCallbackRequest.bind(requestsController));

  // Административные роуты
  fastify.get('/admin/requests', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER)],
    schema: {
      description: 'Получить список заявок',
      tags: ['requests', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, requestsController.getRequests.bind(requestsController));

  fastify.get('/admin/requests/:id', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER)],
    schema: {
      description: 'Получить заявку по ID',
      tags: ['requests', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, requestsController.getRequestById.bind(requestsController));

  fastify.patch('/admin/requests/:id/status', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER)],
    schema: {
      description: 'Обновить статус заявки',
      tags: ['requests', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, requestsController.updateRequestStatus.bind(requestsController));

  fastify.patch('/admin/requests/:id/assign', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER)],
    schema: {
      description: 'Назначить заявку менеджеру',
      tags: ['requests', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, requestsController.assignRequest.bind(requestsController));
}


