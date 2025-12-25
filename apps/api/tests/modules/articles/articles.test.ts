import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import {
  createTestApp,
  closeTestApp,
  createTestUser,
  createTestArticle,
  getAuthToken,
} from '../../helpers';

describe('Articles Module', () => {
  let app: FastifyInstance;
  let adminToken: string;
  let editorToken: string;

  beforeAll(async () => {
    app = await createTestApp();

    await createTestUser({
      email: 'admin-articles@test.com',
      password: 'password123',
      role: 'ADMIN',
    });

    await createTestUser({
      email: 'editor-articles@test.com',
      password: 'password123',
      role: 'EDITOR',
    });

    const adminAuth = await getAuthToken(app, 'admin-articles@test.com', 'password123');
    const editorAuth = await getAuthToken(app, 'editor-articles@test.com', 'password123');
    adminToken = adminAuth.accessToken;
    editorToken = editorAuth.accessToken;
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe('GET /api/v1/articles', () => {
    it('должен вернуть список опубликованных статей', async () => {
      await createTestArticle({ isPublished: true });
      await createTestArticle({ isPublished: true, title: 'Article 2' });
      await createTestArticle({ isPublished: false });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/articles',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      // Только опубликованные статьи
      body.data.forEach((article: any) => {
        expect(article.isPublished).toBe(true);
      });
    });

    it('должен поддерживать пагинацию', async () => {
      for (let i = 0; i < 5; i++) {
        await createTestArticle({ isPublished: true, title: `Article ${i}` });
      }

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/articles?page=1&limit=2',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.length).toBeLessThanOrEqual(2);
      expect(body.pagination.page).toBe(1);
    });

    it('должен поддерживать поиск', async () => {
      await createTestArticle({ isPublished: true, title: 'Unique Article Title' });
      await createTestArticle({ isPublished: true, title: 'Other Article' });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/articles?search=Unique',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.some((a: any) => a.title.includes('Unique'))).toBe(true);
    });
  });

  describe('GET /api/v1/articles/categories', () => {
    it('должен вернуть категории статей', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/articles/categories',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/articles/:slug', () => {
    it('должен вернуть статью по slug', async () => {
      const article = await createTestArticle({
        title: 'Test Article',
        slug: 'test-article',
        isPublished: true,
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/articles/${article.slug}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.slug).toBe('test-article');
      expect(body.data.title).toBe('Test Article');
    });

    it('должен вернуть 404 для несуществующей статьи', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/articles/non-existent',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('POST /api/v1/admin/articles', () => {
    it('должен создать статью', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/articles',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
        payload: {
          title: 'New Article',
          content: 'Article content here',
          excerpt: 'Article excerpt',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.title).toBe('New Article');
    });

    it('должен валидировать обязательные поля', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/articles',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
        payload: {
          title: 'Article without content',
          // content отсутствует
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('PUT /api/v1/admin/articles/:id', () => {
    it('должен обновить статью', async () => {
      const article = await createTestArticle();

      const response = await app.inject({
        method: 'PUT',
        url: `/api/v1/admin/articles/${article.id}`,
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
        payload: {
          title: 'Updated Article',
          content: 'Updated content',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.title).toBe('Updated Article');
    });
  });

  describe('PATCH /api/v1/admin/articles/:id/publish', () => {
    it('должен опубликовать статью', async () => {
      const article = await createTestArticle({ isPublished: false });

      const response = await app.inject({
        method: 'PATCH',
        url: `/api/v1/admin/articles/${article.id}/publish`,
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.isPublished).toBe(true);
    });
  });

  describe('DELETE /api/v1/admin/articles/:id', () => {
    it('должен удалить статью', async () => {
      const article = await createTestArticle();

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/v1/admin/articles/${article.id}`,
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });
  });
});

