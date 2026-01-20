import { FastifyInstance } from 'fastify';
import settingsController from './settings.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { UserRole } from '../../constants/roles';

export default async function settingsRoutes(fastify: FastifyInstance) {
  // Публичные роуты
  fastify.get('/settings/public', {
    schema: {
      description: 'Получить публичные настройки (контакты, соцсети)',
      tags: ['settings'],
    },
  }, settingsController.getPublicSettings.bind(settingsController));

  // Административные роуты
  fastify.get('/admin/settings', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN)],
    schema: {
      description: 'Получить все настройки',
      tags: ['settings', 'admin'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          group: { type: 'string' },
        },
      },
    },
  }, settingsController.getAllSettings.bind(settingsController));

  fastify.get('/admin/settings/:key', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN)],
    schema: {
      description: 'Получить настройку по ключу',
      tags: ['settings', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, settingsController.getSettingByKey.bind(settingsController));

  fastify.put('/admin/settings', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN)],
    schema: {
      description: 'Обновить одну или несколько настроек',
      tags: ['settings', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, settingsController.updateSettings.bind(settingsController));

  fastify.post('/admin/settings/logo', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN)],
    schema: {
      description: 'Загрузить логотип сайта',
      tags: ['settings', 'admin'],
      security: [{ bearerAuth: [] }],
      consumes: ['multipart/form-data'],
    },
  }, settingsController.uploadLogo.bind(settingsController));
}


