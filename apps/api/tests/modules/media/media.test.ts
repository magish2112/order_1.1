import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import {
  createTestApp,
  closeTestApp,
  createTestUser,
  getAuthToken,
} from '../../helpers';
import prisma from '../../../src/config/database';

describe('Media Module', () => {
  let app: FastifyInstance;
  let adminToken: string;
  let editorToken: string;

  beforeAll(async () => {
    app = await createTestApp();

    await createTestUser({
      email: 'admin-media@test.com',
      password: 'password123',
      role: 'ADMIN',
    });

    await createTestUser({
      email: 'editor-media@test.com',
      password: 'password123',
      role: 'EDITOR',
    });

    const adminAuth = await getAuthToken(app, 'admin-media@test.com', 'password123');
    const editorAuth = await getAuthToken(app, 'editor-media@test.com', 'password123');
    adminToken = adminAuth.accessToken;
    editorToken = editorAuth.accessToken;
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe('POST /api/v1/admin/media/upload', () => {
    it('должен вернуть ошибку без файла', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/media/upload',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      });

      // Без файла запрос должен вернуть ошибку
      expect([400, 500]).toContain(response.statusCode);
    });

    it('должен вернуть 401 без токена', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/media/upload',
      });

      expect(response.statusCode).toBe(401);
    });

    it('(security) отклоняет запрещённый MIME-тип', async () => {
      const body =
        '--b\r\n' +
        'Content-Disposition: form-data; name="file"; filename="evil.exe"\r\n' +
        'Content-Type: application/x-msdownload\r\n\r\n' +
        'x\r\n' +
        '--b--\r\n';
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/media/upload',
        headers: {
          authorization: `Bearer ${adminToken}`,
          'content-type': 'multipart/form-data; boundary=b',
        },
        payload: Buffer.from(body, 'utf8'),
      });
      expect(response.statusCode).toBe(400);
      const res = JSON.parse(response.body);
      expect(res.message || '').toMatch(/тип файла|MIME|Недопустимый/i);
    });

    it('(security) отклоняет запрещённое расширение при разрешённом MIME', async () => {
      const body =
        '--b\r\n' +
        'Content-Disposition: form-data; name="file"; filename="evil.exe"\r\n' +
        'Content-Type: image/jpeg\r\n\r\n' +
        'x\r\n' +
        '--b--\r\n';
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/media/upload',
        headers: {
          authorization: `Bearer ${adminToken}`,
          'content-type': 'multipart/form-data; boundary=b',
        },
        payload: Buffer.from(body, 'utf8'),
      });
      expect(response.statusCode).toBe(400);
      const res = JSON.parse(response.body);
      expect(res.message || '').toMatch(/расширен|Недопустимый/i);
    });

    it('(security) отклоняет path traversal в folder', async () => {
      const body =
        '--b\r\n' +
        'Content-Disposition: form-data; name="file"; filename="t.jpg"\r\n' +
        'Content-Type: image/jpeg\r\n\r\n' +
        'x\r\n' +
        '--b--\r\n';
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/media/upload?folder=../../../etc',
        headers: {
          authorization: `Bearer ${adminToken}`,
          'content-type': 'multipart/form-data; boundary=b',
        },
        payload: Buffer.from(body, 'utf8'),
      });
      expect([400, 500]).toContain(response.statusCode);
      const res = JSON.parse(response.body);
      expect(res.message || '').toMatch(/путь|Недопустимый|Ошибка загрузки/i);
    });
  });

  describe('GET /api/v1/admin/media', () => {
    it('должен вернуть список медиафайлов', async () => {
      // Создаем тестовые медиафайлы
      await prisma.media.create({
        data: {
          filename: 'test1.jpg',
          originalName: 'test1.jpg',
          mimeType: 'image/jpeg',
          size: 1024,
          url: '/uploads/test1.jpg',
        },
      });

      await prisma.media.create({
        data: {
          filename: 'test2.png',
          originalName: 'test2.png',
          mimeType: 'image/png',
          size: 2048,
          url: '/uploads/test2.png',
        },
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/media',
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

    it('должен поддерживать пагинацию', async () => {
      for (let i = 0; i < 5; i++) {
        await prisma.media.create({
          data: {
            filename: `test${i}.jpg`,
            originalName: `test${i}.jpg`,
            mimeType: 'image/jpeg',
            size: 1024,
            url: `/uploads/test${i}.jpg`,
          },
        });
      }

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/media?page=1&limit=2',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.length).toBeLessThanOrEqual(2);
      expect(body.pagination.page).toBe(1);
    });

    it('должен фильтровать по папке', async () => {
      await prisma.media.create({
        data: {
          filename: 'folder1.jpg',
          originalName: 'folder1.jpg',
          mimeType: 'image/jpeg',
          size: 1024,
          url: '/uploads/folder1.jpg',
          folder: 'projects',
        },
      });

      await prisma.media.create({
        data: {
          filename: 'folder2.jpg',
          originalName: 'folder2.jpg',
          mimeType: 'image/jpeg',
          size: 1024,
          url: '/uploads/folder2.jpg',
          folder: 'articles',
        },
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/media?folder=projects',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      body.data.forEach((media: any) => {
        expect(media.folder).toBe('projects');
      });
    });
  });

  describe('GET /api/v1/admin/media/:id', () => {
    it('должен вернуть медиафайл по ID', async () => {
      const media = await prisma.media.create({
        data: {
          filename: 'test.jpg',
          originalName: 'test.jpg',
          mimeType: 'image/jpeg',
          size: 1024,
          url: '/uploads/test.jpg',
        },
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/admin/media/${media.id}`,
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(media.id);
      expect(body.data.filename).toBe('test.jpg');
    });
  });

  describe('DELETE /api/v1/admin/media/:id', () => {
    it('должен удалить медиафайл', async () => {
      const media = await prisma.media.create({
        data: {
          filename: 'delete.jpg',
          originalName: 'delete.jpg',
          mimeType: 'image/jpeg',
          size: 1024,
          url: '/uploads/delete.jpg',
        },
      });

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/v1/admin/media/${media.id}`,
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it('должен вернуть 403 для EDITOR', async () => {
      const media = await prisma.media.create({
        data: {
          filename: 'delete2.jpg',
          originalName: 'delete2.jpg',
          mimeType: 'image/jpeg',
          size: 1024,
          url: '/uploads/delete2.jpg',
        },
      });

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/v1/admin/media/${media.id}`,
        headers: {
          authorization: `Bearer ${editorToken}`,
        },
      });

      expect(response.statusCode).toBe(403);
    });
  });
});

