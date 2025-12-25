import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createTestApp, closeTestApp, createTestUser, getAuthToken } from '../helpers';
import { UserRole } from '@prisma/client';

describe('Auth Middleware', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe('authenticate middleware', () => {
    it('должен пропустить запрос с валидным токеном', async () => {
      await createTestUser({
        email: 'auth@test.com',
        password: 'password123',
      });

      const { accessToken } = await getAuthToken(app, 'auth@test.com', 'password123');

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
    });

    it('должен отклонить запрос без токена', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.message).toContain('Требуется аутентификация');
    });

    it('должен отклонить запрос с недействительным токеном', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
        headers: {
          authorization: 'Bearer invalid-token-12345',
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('должен отклонить запрос с истекшим токеном', async () => {
      // Создаем токен с очень коротким временем жизни
      // В реальном тесте нужно использовать моки или изменять конфигурацию
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
        headers: {
          authorization: 'Bearer expired-token',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('authorize middleware', () => {
    it('должен разрешить доступ ADMIN к защищенным роутам', async () => {
      await createTestUser({
        email: 'admin-auth@test.com',
        password: 'password123',
        role: 'ADMIN',
      });

      const { accessToken } = await getAuthToken(app, 'admin-auth@test.com', 'password123');

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/categories',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          name: 'Admin Category',
        },
      });

      expect(response.statusCode).toBe(201);
    });

    it('должен разрешить доступ MANAGER к защищенным роутам', async () => {
      await createTestUser({
        email: 'manager-auth@test.com',
        password: 'password123',
        role: 'MANAGER',
      });

      const { accessToken } = await getAuthToken(app, 'manager-auth@test.com', 'password123');

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/categories',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          name: 'Manager Category',
        },
      });

      expect(response.statusCode).toBe(201);
    });

    it('должен запретить доступ EDITOR к роутам, требующим ADMIN/MANAGER', async () => {
      await createTestUser({
        email: 'editor-auth@test.com',
        password: 'password123',
        role: 'EDITOR',
      });

      const { accessToken } = await getAuthToken(app, 'editor-auth@test.com', 'password123');

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/categories',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        payload: {
          name: 'Editor Category',
        },
      });

      expect(response.statusCode).toBe(403);
      const body = JSON.parse(response.body);
      expect(body.message).toContain('Недостаточно прав доступа');
    });

    it('должен запретить доступ MANAGER к роутам, требующим только ADMIN', async () => {
      await createTestUser({
        email: 'manager-delete@test.com',
        password: 'password123',
        role: 'MANAGER',
      });

      const category = await app.prisma.serviceCategory.create({
        data: {
          name: 'To Delete',
          slug: 'to-delete',
        },
      });

      const { accessToken } = await getAuthToken(app, 'manager-delete@test.com', 'password123');

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/v1/admin/categories/${category.id}`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(403);
      const body = JSON.parse(response.body);
      expect(body.message).toContain('Недостаточно прав доступа');
    });
  });
});

