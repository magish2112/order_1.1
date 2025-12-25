import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import {
  createTestApp,
  closeTestApp,
  createTestUser,
  createTestSetting,
  getAuthToken,
} from '../../helpers';

describe('Settings Module', () => {
  let app: FastifyInstance;
  let adminToken: string;

  beforeAll(async () => {
    app = await createTestApp();

    await createTestUser({
      email: 'admin-settings@test.com',
      password: 'password123',
      role: 'ADMIN',
    });

    const adminAuth = await getAuthToken(app, 'admin-settings@test.com', 'password123');
    adminToken = adminAuth.accessToken;
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe('GET /api/v1/settings/public', () => {
    it('должен вернуть публичные настройки', async () => {
      await createTestSetting({ key: 'contact.phone', value: '+79991234567', group: 'contacts' });
      await createTestSetting({ key: 'contact.email', value: 'info@example.com', group: 'contacts' });
      await createTestSetting({ key: 'social.vk', value: 'https://vk.com/company', group: 'social' });
      await createTestSetting({ key: 'internal.setting', value: 'secret', group: 'internal' });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/settings/public',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      // Должны быть только публичные настройки (contacts, social)
      const keys = body.data.map((s: any) => s.key);
      expect(keys).toContain('contact.phone');
      expect(keys).toContain('social.vk');
      expect(keys).not.toContain('internal.setting');
    });
  });

  describe('GET /api/v1/admin/settings', () => {
    it('должен вернуть все настройки', async () => {
      await createTestSetting({ key: 'setting1', value: 'value1' });
      await createTestSetting({ key: 'setting2', value: 'value2' });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/settings',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('должен фильтровать по группе', async () => {
      await createTestSetting({ key: 'contacts.phone', value: '+79991234567', group: 'contacts' });
      await createTestSetting({ key: 'social.vk', value: 'https://vk.com', group: 'social' });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/settings?group=contacts',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      body.data.forEach((setting: any) => {
        expect(setting.group).toBe('contacts');
      });
    });

    it('должен вернуть 401 без токена', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/settings',
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/v1/admin/settings/:key', () => {
    it('должен вернуть настройку по ключу', async () => {
      await createTestSetting({ key: 'test.setting', value: 'test value' });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/settings/test.setting',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.key).toBe('test.setting');
      expect(body.data.value).toBe('test value');
    });
  });

  describe('PUT /api/v1/admin/settings', () => {
    it('должен обновить одну настройку', async () => {
      const setting = await createTestSetting({ key: 'update.test', value: 'old value' });

      const response = await app.inject({
        method: 'PUT',
        url: '/api/v1/admin/settings',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
        payload: {
          key: 'update.test',
          value: 'new value',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.value).toBe('new value');
    });

    it('должен обновить несколько настроек', async () => {
      await createTestSetting({ key: 'multi.1', value: 'value1' });
      await createTestSetting({ key: 'multi.2', value: 'value2' });

      const response = await app.inject({
        method: 'PUT',
        url: '/api/v1/admin/settings',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
        payload: [
          { key: 'multi.1', value: 'updated1' },
          { key: 'multi.2', value: 'updated2' },
        ],
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });
  });
});

