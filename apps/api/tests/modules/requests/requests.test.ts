import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import {
  createTestApp,
  closeTestApp,
  createTestUser,
  createTestRequest,
  getAuthToken,
} from '../../helpers';
import { RequestStatus } from '@prisma/client';

describe('Requests Module', () => {
  let app: FastifyInstance;
  let adminToken: string;
  let managerToken: string;

  beforeAll(async () => {
    app = await createTestApp();

    await createTestUser({
      email: 'admin-requests@test.com',
      password: 'password123',
      role: 'ADMIN',
    });

    await createTestUser({
      email: 'manager-requests@test.com',
      password: 'password123',
      role: 'MANAGER',
    });

    const adminAuth = await getAuthToken(app, 'admin-requests@test.com', 'password123');
    const managerAuth = await getAuthToken(app, 'manager-requests@test.com', 'password123');
    adminToken = adminAuth.accessToken;
    managerToken = managerAuth.accessToken;
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe('POST /api/v1/requests', () => {
    it('должен создать заявку', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/requests',
        payload: {
          name: 'Test User',
          phone: '+79991234567',
          email: 'test@example.com',
          message: 'I need help with renovation',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.name).toBe('Test User');
      expect(body.data.status).toBe('NEW');
    });

    it('должен валидировать обязательные поля', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/requests',
        payload: {
          email: 'test@example.com',
          // name и phone отсутствуют
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /api/v1/requests/callback', () => {
    it('должен создать заявку на обратный звонок', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/requests/callback',
        payload: {
          name: 'Callback User',
          phone: '+79991234567',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.source).toBe('callback');
    });
  });

  describe('GET /api/v1/admin/requests', () => {
    it('должен вернуть список заявок', async () => {
      await createTestRequest();
      await createTestRequest({ name: 'Request 2' });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/requests',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body).toHaveProperty('pagination');
    });

    it('должен фильтровать по статусу', async () => {
      await createTestRequest({ status: 'NEW' });
      await createTestRequest({ status: 'IN_PROGRESS' });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/requests?status=NEW',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      body.data.forEach((request: any) => {
        expect(request.status).toBe('NEW');
      });
    });

    it('должен вернуть 401 без токена', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/requests',
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/v1/admin/requests/:id', () => {
    it('должен вернуть заявку по ID', async () => {
      const request = await createTestRequest();

      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/admin/requests/${request.id}`,
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(request.id);
    });
  });

  describe('PATCH /api/v1/admin/requests/:id/status', () => {
    it('должен обновить статус заявки', async () => {
      const request = await createTestRequest({ status: 'NEW' });

      const response = await app.inject({
        method: 'PATCH',
        url: `/api/v1/admin/requests/${request.id}/status`,
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
        payload: {
          status: 'IN_PROGRESS',
          notes: 'Working on it',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('IN_PROGRESS');
    });
  });

  describe('PATCH /api/v1/admin/requests/:id/assign', () => {
    it('должен назначить заявку менеджеру', async () => {
      const manager = await createTestUser({
        email: 'assign-manager@test.com',
        password: 'password123',
        role: 'MANAGER',
      });
      const request = await createTestRequest();

      const response = await app.inject({
        method: 'PATCH',
        url: `/api/v1/admin/requests/${request.id}/assign`,
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
        payload: {
          handledById: manager.id,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.handledById).toBe(manager.id);
    });
  });
});

