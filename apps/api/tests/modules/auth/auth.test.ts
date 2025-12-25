import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createTestApp, closeTestApp, createTestUser, getAuthToken } from '../../helpers';
import prisma from '../../../src/config/database';

describe('Auth Module', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe('POST /api/v1/auth/login', () => {
    it('должен успешно авторизовать пользователя с правильными данными', async () => {
      await createTestUser({
        email: 'user@test.com',
        password: 'password123',
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'user@test.com',
          password: 'password123',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('user');
      expect(body.data).toHaveProperty('tokens');
      expect(body.data.user.email).toBe('user@test.com');
      expect(body.data.tokens).toHaveProperty('accessToken');
      expect(body.data.tokens).toHaveProperty('refreshToken');
    });

    it('должен вернуть ошибку при неверном email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'wrong@test.com',
          password: 'password123',
        },
      });

      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.body);
      expect(body.message).toContain('Неверный email или пароль');
    });

    it('должен вернуть ошибку при неверном пароле', async () => {
      await createTestUser({
        email: 'user2@test.com',
        password: 'password123',
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'user2@test.com',
          password: 'wrongpassword',
        },
      });

      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.body);
      expect(body.message).toContain('Неверный email или пароль');
    });

    it('должен вернуть ошибку при неактивном пользователе', async () => {
      await createTestUser({
        email: 'inactive@test.com',
        password: 'password123',
        isActive: false,
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'inactive@test.com',
          password: 'password123',
        },
      });

      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.body);
      expect(body.message).toContain('Неверный email или пароль');
    });

    it('должен валидировать входные данные', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'invalid-email',
          password: '123',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('должен успешно обновить access token', async () => {
      await createTestUser({
        email: 'refresh@test.com',
        password: 'password123',
      });

      const { refreshToken } = await getAuthToken(app, 'refresh@test.com', 'password123');

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/refresh',
        payload: {
          refreshToken,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('accessToken');
      expect(body.data).toHaveProperty('refreshToken');
      expect(body.data.accessToken).not.toBe(refreshToken);
    });

    it('должен вернуть ошибку при недействительном refresh token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/refresh',
        payload: {
          refreshToken: 'invalid-token',
        },
      });

      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.body);
      expect(body.message).toContain('Недействительный refresh token');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('должен вернуть информацию о текущем пользователе', async () => {
      await createTestUser({
        email: 'me@test.com',
        password: 'password123',
      });

      const { accessToken } = await getAuthToken(app, 'me@test.com', 'password123');

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('id');
      expect(body.data).toHaveProperty('email');
      expect(body.data.email).toBe('me@test.com');
    });

    it('должен вернуть ошибку без токена', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.message).toContain('Требуется аутентификация');
    });

    it('должен вернуть ошибку при недействительном токене', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
        headers: {
          authorization: 'Bearer invalid-token',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('должен успешно выполнить выход', async () => {
      await createTestUser({
        email: 'logout@test.com',
        password: 'password123',
      });

      const { accessToken } = await getAuthToken(app, 'logout@test.com', 'password123');

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/logout',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.message).toContain('Выход выполнен успешно');
    });
  });
});

