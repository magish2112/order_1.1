import { FastifyInstance } from 'fastify';
import statsController from './stats.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { UserRole } from '../../constants/roles';

export default async function statsRoutes(fastify: FastifyInstance) {
  // Публичный роут для счетчиков Hero секции
  fastify.get('/stats/homepage', {
    schema: {
      description: 'Получить статистику для главной страницы (счетчики достижений)',
      tags: ['stats'],
    },
  }, statsController.getHomepageStats.bind(statsController));

  // Административные роуты
  fastify.get('/admin/stats/dashboard', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER)],
    schema: {
      description: 'Получить статистику для dashboard',
      tags: ['stats', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, statsController.getDashboardStats.bind(statsController));

  fastify.get('/admin/stats/views', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER)],
    schema: {
      description: 'Получить статистику просмотров',
      tags: ['stats', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, statsController.getViewsStats.bind(statsController));
}


