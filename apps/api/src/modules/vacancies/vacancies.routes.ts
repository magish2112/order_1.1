import { FastifyInstance } from 'fastify';
import vacanciesController from './vacancies.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

export default async function vacanciesRoutes(fastify: FastifyInstance) {
  // Публичные роуты
  fastify.get('/vacancies', {
    schema: {
      description: 'Получить список активных вакансий',
      tags: ['vacancies'],
      querystring: {
        type: 'object',
        properties: {
          department: { type: 'string' },
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          search: { type: 'string' },
        },
      },
    },
  }, vacanciesController.getVacancies.bind(vacanciesController));

  fastify.get('/vacancies/:id', {
    schema: {
      description: 'Получить вакансию по ID',
      tags: ['vacancies'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, vacanciesController.getVacancyById.bind(vacanciesController));

  // Административные роуты
  fastify.post('/admin/vacancies', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER)],
    schema: {
      description: 'Создать вакансию',
      tags: ['vacancies', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, vacanciesController.createVacancy.bind(vacanciesController));

  fastify.put('/admin/vacancies/:id', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER)],
    schema: {
      description: 'Обновить вакансию',
      tags: ['vacancies', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, vacanciesController.updateVacancy.bind(vacanciesController));

  fastify.delete('/admin/vacancies/:id', {
    preHandler: [authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN)],
    schema: {
      description: 'Удалить вакансию',
      tags: ['vacancies', 'admin'],
      security: [{ bearerAuth: [] }],
    },
  }, vacanciesController.deleteVacancy.bind(vacanciesController));
}

