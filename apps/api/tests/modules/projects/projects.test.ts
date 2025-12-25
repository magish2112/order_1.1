import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import {
  createTestApp,
  closeTestApp,
  createTestUser,
  createTestCategory,
  createTestProject,
  getAuthToken,
} from '../../helpers';

describe('Projects Module', () => {
  let app: FastifyInstance;
  let adminToken: string;
  let editorToken: string;

  beforeAll(async () => {
    app = await createTestApp();

    await createTestUser({
      email: 'admin-projects@test.com',
      password: 'password123',
      role: 'ADMIN',
    });

    await createTestUser({
      email: 'editor-projects@test.com',
      password: 'password123',
      role: 'EDITOR',
    });

    const adminAuth = await getAuthToken(app, 'admin-projects@test.com', 'password123');
    const editorAuth = await getAuthToken(app, 'editor-projects@test.com', 'password123');
    adminToken = adminAuth.accessToken;
    editorToken = editorAuth.accessToken;
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe('GET /api/v1/projects', () => {
    it('должен вернуть список проектов', async () => {
      const category = await createTestCategory();
      await createTestProject({ categoryId: category.id });
      await createTestProject({ categoryId: category.id, title: 'Project 2' });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/projects',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body).toHaveProperty('pagination');
    });

    it('должен фильтровать по категории', async () => {
      const cat1 = await createTestCategory({ name: 'Cat 1', slug: 'cat1' });
      const cat2 = await createTestCategory({ name: 'Cat 2', slug: 'cat2' });
      await createTestProject({ categoryId: cat1.id, title: 'Project 1' });
      await createTestProject({ categoryId: cat2.id, title: 'Project 2' });

      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/projects?categoryId=${cat1.id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      body.data.forEach((project: any) => {
        expect(project.categoryId).toBe(cat1.id);
      });
    });

    it('должен фильтровать избранные проекты', async () => {
      const category = await createTestCategory();
      await createTestProject({ categoryId: category.id, isFeatured: true });
      await createTestProject({ categoryId: category.id, isFeatured: false });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/projects?isFeatured=true',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      body.data.forEach((project: any) => {
        expect(project.isFeatured).toBe(true);
      });
    });

    it('должен поддерживать пагинацию', async () => {
      const category = await createTestCategory();
      for (let i = 0; i < 5; i++) {
        await createTestProject({ categoryId: category.id, title: `Project ${i}` });
      }

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/projects?page=1&limit=2',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.length).toBeLessThanOrEqual(2);
      expect(body.pagination.page).toBe(1);
    });
  });

  describe('GET /api/v1/projects/featured', () => {
    it('должен вернуть избранные проекты', async () => {
      const category = await createTestCategory();
      await createTestProject({ categoryId: category.id, isFeatured: true });
      await createTestProject({ categoryId: category.id, isFeatured: false });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/projects/featured',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      body.data.forEach((project: any) => {
        expect(project.isFeatured).toBe(true);
      });
    });
  });

  describe('GET /api/v1/projects/:slug', () => {
    it('должен вернуть проект по slug', async () => {
      const category = await createTestCategory();
      const project = await createTestProject({
        categoryId: category.id,
        title: 'Test Project',
        slug: 'test-project',
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/projects/${project.slug}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.slug).toBe('test-project');
      expect(body.data.title).toBe('Test Project');
    });

    it('должен вернуть 404 для несуществующего проекта', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/projects/non-existent',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('POST /api/v1/admin/projects', () => {
    it('должен создать проект (ADMIN)', async () => {
      const category = await createTestCategory();

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/projects',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
        payload: {
          title: 'New Project',
          description: 'Project description',
          categoryId: category.id,
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.title).toBe('New Project');
    });

    it('должен создать проект (EDITOR)', async () => {
      const category = await createTestCategory();

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/projects',
        headers: {
          authorization: `Bearer ${editorToken}`,
        },
        payload: {
          title: 'Editor Project',
          description: 'Project description',
          categoryId: category.id,
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it('должен вернуть 401 без токена', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/projects',
        payload: {
          title: 'Unauthorized Project',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('PUT /api/v1/admin/projects/:id', () => {
    it('должен обновить проект', async () => {
      const category = await createTestCategory();
      const project = await createTestProject({ categoryId: category.id });

      const response = await app.inject({
        method: 'PUT',
        url: `/api/v1/admin/projects/${project.id}`,
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
        payload: {
          title: 'Updated Project',
          description: 'Updated description',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.title).toBe('Updated Project');
    });
  });

  describe('DELETE /api/v1/admin/projects/:id', () => {
    it('должен удалить проект', async () => {
      const category = await createTestCategory();
      const project = await createTestProject({ categoryId: category.id });

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/v1/admin/projects/${project.id}`,
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it('должен вернуть 403 для EDITOR', async () => {
      const category = await createTestCategory();
      const project = await createTestProject({ categoryId: category.id });

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/v1/admin/projects/${project.id}`,
        headers: {
          authorization: `Bearer ${editorToken}`,
        },
      });

      expect(response.statusCode).toBe(403);
    });
  });
});

