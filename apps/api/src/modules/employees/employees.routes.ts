import { FastifyInstance } from 'fastify';
import employeesController from './employees.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { UserRole } from '../../constants/roles';

export default async function employeesRoutes(fastify: FastifyInstance) {
  // Публичные роуты
  fastify.get('/employees', {
    schema: {
      description: 'Получить список сотрудников',
      tags: ['employees'],
      querystring: {
        type: 'object',
        properties: {
          department: { type: 'string' },
          isActive: { type: 'boolean' },
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        },
      },
    },
  }, employeesController.getEmployees.bind(employeesController));

  // Административные роуты
  fastify.get('/admin/employees', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER)],
    schema: {
      description: 'Получить список сотрудников (админ)',
      tags: ['employees', 'admin'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          department: { type: 'string' },
          isActive: { type: 'boolean' },
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        },
      },
    },
  }, employeesController.getEmployees.bind(employeesController));

  fastify.get('/admin/employees/:id', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER)],
    schema: {
      description: 'Получить сотрудника по ID',
      tags: ['employees', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, employeesController.getEmployeeById.bind(employeesController));

  fastify.post('/admin/employees', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER)],
    schema: {
      description: 'Создать сотрудника',
      tags: ['employees', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, employeesController.createEmployee.bind(employeesController));

  fastify.put('/admin/employees/:id', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER)],
    schema: {
      description: 'Обновить сотрудника',
      tags: ['employees', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, employeesController.updateEmployee.bind(employeesController));

  fastify.delete('/admin/employees/:id', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN)],
    schema: {
      description: 'Удалить сотрудника',
      tags: ['employees', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, employeesController.deleteEmployee.bind(employeesController));
}


