import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import {
  createTestApp,
  closeTestApp,
  createTestUser,
  createTestVacancy,
  getAuthToken,
} from '../../helpers';

describe('Vacancies Module', () => {
  let app: FastifyInstance;
  let adminToken: string;
  let managerToken: string;

  beforeAll(async () => {
    app = await createTestApp();

    await createTestUser({
      email: 'admin-vacancies@test.com',
      password: 'password123',
      role: 'ADMIN',
    });

    await createTestUser({
      email: 'manager-vacancies@test.com',
      password: 'password123',
      role: 'MANAGER',
    });

    const adminAuth = await getAuthToken(app, 'admin-vacancies@test.com', 'password123');
    const managerAuth = await getAuthToken(app, 'manager-vacancies@test.com', 'password123');
    adminToken = adminAuth.accessToken;
    managerToken = managerAuth.accessToken;
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe('GET /api/v1/vacancies', () => {
    it('должен вернуть список активных вакансий', async () => {
      await createTestVacancy({ isActive: true });
      await createTestVacancy({ isActive: true, title: 'Vacancy 2' });
      await createTestVacancy({ isActive: false });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/vacancies',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      // Только активные вакансии
      body.data.forEach((vacancy: any) => {
        expect(vacancy.isActive).toBe(true);
      });
    });

    it('должен фильтровать по отделу', async () => {
      await createTestVacancy({ department: 'Design', isActive: true });
      await createTestVacancy({ department: 'Development', isActive: true });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/vacancies?department=Design',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      body.data.forEach((vacancy: any) => {
        expect(vacancy.department).toBe('Design');
      });
    });

    it('должен поддерживать поиск', async () => {
      await createTestVacancy({ title: 'Senior Designer', isActive: true });
      await createTestVacancy({ title: 'Junior Developer', isActive: true });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/vacancies?search=Designer',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.some((v: any) => v.title.includes('Designer'))).toBe(true);
    });
  });

  describe('GET /api/v1/vacancies/:id', () => {
    it('должен вернуть вакансию по ID', async () => {
      const vacancy = await createTestVacancy({ isActive: true });

      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/vacancies/${vacancy.id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(vacancy.id);
    });

    it('должен вернуть 404 для несуществующей вакансии', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/vacancies/non-existent-id',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('POST /api/v1/admin/vacancies', () => {
    it('должен создать вакансию', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/vacancies',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
        payload: {
          title: 'Senior Designer',
          department: 'Design',
          description: 'We are looking for a senior designer',
          requirements: ['5+ years experience', 'Portfolio'],
          responsibilities: ['Design interfaces', 'Lead design team'],
          conditions: ['Remote work', 'Flexible schedule'],
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.title).toBe('Senior Designer');
    });

    it('должен валидировать обязательные поля', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/vacancies',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
        payload: {
          department: 'Design',
          // title и description отсутствуют
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('PUT /api/v1/admin/vacancies/:id', () => {
    it('должен обновить вакансию', async () => {
      const vacancy = await createTestVacancy();

      const response = await app.inject({
        method: 'PUT',
        url: `/api/v1/admin/vacancies/${vacancy.id}`,
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
        payload: {
          title: 'Updated Vacancy',
          description: 'Updated description',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.title).toBe('Updated Vacancy');
    });
  });

  describe('DELETE /api/v1/admin/vacancies/:id', () => {
    it('должен удалить вакансию', async () => {
      const vacancy = await createTestVacancy();

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/v1/admin/vacancies/${vacancy.id}`,
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it('должен вернуть 403 для MANAGER', async () => {
      const vacancy = await createTestVacancy();

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/v1/admin/vacancies/${vacancy.id}`,
        headers: {
          authorization: `Bearer ${managerToken}`,
        },
      });

      expect(response.statusCode).toBe(403);
    });
  });
});

