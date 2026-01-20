import { FastifyInstance } from 'fastify';
import calculatorController from './calculator.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { UserRole } from '../../constants/roles';

export default async function calculatorRoutes(fastify: FastifyInstance) {
  // Публичные роуты
  fastify.get('/calculator/config', {
    schema: {
      description: 'Получить конфигурацию калькулятора',
      tags: ['calculator'],
    },
  }, calculatorController.getConfig.bind(calculatorController));

  fastify.post('/calculator/calculate', {
    schema: {
      description: 'Рассчитать стоимость ремонта',
      tags: ['calculator'],
      body: {
        type: 'object',
        required: ['propertyType', 'housingType', 'rooms', 'area', 'repairType'],
        properties: {
          propertyType: { type: 'string', enum: ['apartment', 'house', 'office'] },
          housingType: { type: 'string', enum: ['newBuilding', 'secondary'] },
          rooms: { type: 'integer', minimum: 1 },
          area: { type: 'number', minimum: 1 },
          repairType: { type: 'string', enum: ['cosmetic', 'capital', 'design', 'elite'] },
          additionalServices: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  }, calculatorController.calculate.bind(calculatorController));

  // Административные роуты
  fastify.get('/admin/calculator/config', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN)],
    schema: {
      description: 'Получить конфигурацию калькулятора (админ)',
      tags: ['calculator', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, calculatorController.getConfig.bind(calculatorController));

  fastify.put('/admin/calculator/config', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN)],
    schema: {
      description: 'Обновить конфигурацию калькулятора',
      tags: ['calculator', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, calculatorController.updateConfig.bind(calculatorController));
}


