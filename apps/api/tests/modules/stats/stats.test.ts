import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import {
  createTestApp,
  closeTestApp,
  createTestUser,
  createTestProject,
  createTestRequest,
  createTestArticle,
  getAuthToken,
} from '../../helpers';
import prisma from '../../../src/config/database';

describe('Stats Module', () => {
  let app: FastifyInstance;
  let adminToken: string;
  let managerToken: string;

  beforeAll(async () => {
    app = await createTestApp();

    await createTestUser({
      email: 'admin-stats@test.com',
      password: 'password123',
      role: 'ADMIN',
    });

    await createTestUser({
      email: 'manager-stats@test.com',
      password: 'password123',
      role: 'MANAGER',
    });

    const adminAuth = await getAuthToken(app, 'admin-stats@test.com', 'password123');
    const managerAuth = await getAuthToken(app, 'manager-stats@test.com', 'password123');
    adminToken = adminAuth.accessToken;
    managerToken = managerAuth.accessToken;
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe('GET /api/v1/stats/homepage', () => {
    it('должен вернуть статистику для главной страницы', async () => {
      // Создаем тестовые данные
      await createTestProject({ isActive: true });
      await createTestProject({ isActive: true });
      await createTestRequest();
      await createTestRequest();

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/stats/homepage',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('projectsCount');
      expect(body.data).toHaveProperty('requestsCount');
      expect(typeof body.data.projectsCount).toBe('number');
      expect(typeof body.data.requestsCount).toBe('number');
    });
  });

  describe('GET /api/v1/admin/stats/dashboard', () => {
    it('должен вернуть статистику для dashboard (ADMIN)', async () => {
      // Создаем тестовые данные
      await createTestRequest({ status: 'NEW' });
      await createTestRequest({ status: 'IN_PROGRESS' });
      await createTestRequest({ status: 'CONVERTED' });
      await createTestProject();
      await createTestArticle({ isPublished: true });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/stats/dashboard',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('requests');
      expect(body.data).toHaveProperty('projects');
      expect(body.data).toHaveProperty('articles');
    });

    it('должен вернуть статистику для dashboard (MANAGER)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/stats/dashboard',
        headers: {
          authorization: `Bearer ${managerToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it('должен вернуть 401 без токена', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/stats/dashboard',
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/v1/admin/stats/views', () => {
    it('должен вернуть статистику просмотров', async () => {
      // Создаем проекты с просмотрами
      const project1 = await createTestProject();
      const project2 = await createTestProject();
      
      // Обновляем счетчики просмотров
      await prisma.project.update({
        where: { id: project1.id },
        data: { viewsCount: 100 },
      });
      
      await prisma.project.update({
        where: { id: project2.id },
        data: { viewsCount: 50 },
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/stats/views',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('totalViews');
      expect(typeof body.data.totalViews).toBe('number');
    });

    it('должен вернуть 401 без токена', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/stats/views',
      });

      expect(response.statusCode).toBe(401);
    });
  });
});


