import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import {
  createTestApp,
  closeTestApp,
  createTestUser,
  createTestFaq,
  getAuthToken,
} from '../../helpers';

describe('FAQs Module', () => {
  let app: FastifyInstance;
  let adminToken: string;
  let managerToken: string;

  beforeAll(async () => {
    app = await createTestApp();

    await createTestUser({
      email: 'admin-faqs@test.com',
      password: 'password123',
      role: 'ADMIN',
    });

    await createTestUser({
      email: 'manager-faqs@test.com',
      password: 'password123',
      role: 'MANAGER',
    });

    const adminAuth = await getAuthToken(app, 'admin-faqs@test.com', 'password123');
    const managerAuth = await getAuthToken(app, 'manager-faqs@test.com', 'password123');
    adminToken = adminAuth.accessToken;
    managerToken = managerAuth.accessToken;
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe('GET /api/v1/faqs', () => {
    it('должен вернуть список активных FAQ', async () => {
      await createTestFaq({ isActive: true });
      await createTestFaq({ isActive: true, question: 'Question 2?' });
      await createTestFaq({ isActive: false });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/faqs',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      // Только активные FAQ
      body.data.forEach((faq: any) => {
        expect(faq.isActive).toBe(true);
      });
    });

    it('должен фильтровать по категории', async () => {
      await createTestFaq({ category: 'General', isActive: true });
      await createTestFaq({ category: 'Pricing', isActive: true });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/faqs?category=General',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      body.data.forEach((faq: any) => {
        expect(faq.category).toBe('General');
      });
    });
  });

  describe('POST /api/v1/admin/faqs', () => {
    it('должен создать FAQ', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/faqs',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
        payload: {
          question: 'How long does renovation take?',
          answer: 'It depends on the scope of work, typically 2-4 weeks.',
          category: 'General',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.question).toBe('How long does renovation take?');
    });

    it('должен валидировать обязательные поля', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/faqs',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
        payload: {
          question: 'Question?',
          // answer отсутствует
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('PUT /api/v1/admin/faqs/:id', () => {
    it('должен обновить FAQ', async () => {
      const faq = await createTestFaq();

      const response = await app.inject({
        method: 'PUT',
        url: `/api/v1/admin/faqs/${faq.id}`,
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
        payload: {
          question: 'Updated Question?',
          answer: 'Updated Answer',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.question).toBe('Updated Question?');
    });
  });

  describe('DELETE /api/v1/admin/faqs/:id', () => {
    it('должен удалить FAQ', async () => {
      const faq = await createTestFaq();

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/v1/admin/faqs/${faq.id}`,
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it('должен вернуть 403 для MANAGER', async () => {
      const faq = await createTestFaq();

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/v1/admin/faqs/${faq.id}`,
        headers: {
          authorization: `Bearer ${managerToken}`,
        },
      });

      expect(response.statusCode).toBe(403);
    });
  });
});

