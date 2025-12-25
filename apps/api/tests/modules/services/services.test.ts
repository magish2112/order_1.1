import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import {
  createTestApp,
  closeTestApp,
  createTestUser,
  createTestCategory,
  createTestService,
  getAuthToken,
} from '../../helpers';
import { UserRole } from '@prisma/client';

describe('Services Module', () => {
  let app: FastifyInstance;
  let adminToken: string;
  let managerToken: string;

  beforeAll(async () => {
    app = await createTestApp();

    // Создаем пользователей для тестов
    await createTestUser({
      email: 'admin@test.com',
      password: 'password123',
      role: 'ADMIN',
    });

    await createTestUser({
      email: 'manager@test.com',
      password: 'password123',
      role: 'MANAGER',
    });

    const adminAuth = await getAuthToken(app, 'admin@test.com', 'password123');
    const managerAuth = await getAuthToken(app, 'manager@test.com', 'password123');
    adminToken = adminAuth.accessToken;
    managerToken = managerAuth.accessToken;
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe('Categories - Public Routes', () => {
    describe('GET /api/v1/categories', () => {
      it('должен вернуть дерево категорий', async () => {
        const parent = await createTestCategory({ name: 'Parent Category', slug: 'parent' });
        await createTestCategory({ name: 'Child Category', slug: 'child', parentId: parent.id });

        const response = await app.inject({
          method: 'GET',
          url: '/api/v1/categories',
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(Array.isArray(body.data)).toBe(true);
      });

      it('должен фильтровать по isActive', async () => {
        await createTestCategory({ name: 'Active', slug: 'active', isActive: true });
        await createTestCategory({ name: 'Inactive', slug: 'inactive', isActive: false });

        const response = await app.inject({
          method: 'GET',
          url: '/api/v1/categories?isActive=true',
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        body.data.forEach((cat: any) => {
          expect(cat.isActive).toBe(true);
        });
      });
    });

    describe('GET /api/v1/categories/:slug', () => {
      it('должен вернуть категорию по slug', async () => {
        const category = await createTestCategory({ name: 'Test Category', slug: 'test-cat' });

        const response = await app.inject({
          method: 'GET',
          url: `/api/v1/categories/${category.slug}`,
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data.slug).toBe('test-cat');
        expect(body.data.name).toBe('Test Category');
      });

      it('должен вернуть 404 для несуществующей категории', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/v1/categories/non-existent',
        });

        expect(response.statusCode).toBe(404);
        const body = JSON.parse(response.body);
        expect(body.message).toContain('Категория не найдена');
      });
    });
  });

  describe('Categories - Admin Routes', () => {
    describe('POST /api/v1/admin/categories', () => {
      it('должен создать категорию (ADMIN)', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/v1/admin/categories',
          headers: {
            authorization: `Bearer ${adminToken}`,
          },
          payload: {
            name: 'New Category',
            description: 'Test description',
            isActive: true,
          },
        });

        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data.name).toBe('New Category');
        expect(body.data).toHaveProperty('slug');
      });

      it('должен создать категорию (MANAGER)', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/v1/admin/categories',
          headers: {
            authorization: `Bearer ${managerToken}`,
          },
          payload: {
            name: 'Manager Category',
            description: 'Test description',
          },
        });

        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
      });

      it('должен вернуть 403 для неавторизованного пользователя', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/v1/admin/categories',
          payload: {
            name: 'Unauthorized Category',
          },
        });

        expect(response.statusCode).toBe(401);
      });

      it('должен валидировать входные данные', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/v1/admin/categories',
          headers: {
            authorization: `Bearer ${adminToken}`,
          },
          payload: {
            name: '', // Пустое имя
          },
        });

        expect(response.statusCode).toBe(400);
      });
    });

    describe('PUT /api/v1/admin/categories/:id', () => {
      it('должен обновить категорию', async () => {
        const category = await createTestCategory({ name: 'Original', slug: 'original' });

        const response = await app.inject({
          method: 'PUT',
          url: `/api/v1/admin/categories/${category.id}`,
          headers: {
            authorization: `Bearer ${adminToken}`,
          },
          payload: {
            name: 'Updated Category',
            description: 'Updated description',
          },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data.name).toBe('Updated Category');
      });
    });

    describe('DELETE /api/v1/admin/categories/:id', () => {
      it('должен удалить категорию', async () => {
        const category = await createTestCategory({ name: 'To Delete', slug: 'to-delete' });

        const response = await app.inject({
          method: 'DELETE',
          url: `/api/v1/admin/categories/${category.id}`,
          headers: {
            authorization: `Bearer ${adminToken}`,
          },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
      });

      it('должен вернуть ошибку при удалении категории с дочерними категориями', async () => {
        const parent = await createTestCategory({ name: 'Parent', slug: 'parent' });
        await createTestCategory({ name: 'Child', slug: 'child', parentId: parent.id });

        const response = await app.inject({
          method: 'DELETE',
          url: `/api/v1/admin/categories/${parent.id}`,
          headers: {
            authorization: `Bearer ${adminToken}`,
          },
        });

        expect(response.statusCode).toBe(500);
        const body = JSON.parse(response.body);
        expect(body.message).toContain('дочерними категориями');
      });

      it('должен вернуть ошибку при удалении категории с услугами', async () => {
        const category = await createTestCategory({ name: 'With Services', slug: 'with-services' });
        await createTestService({ categoryId: category.id });

        const response = await app.inject({
          method: 'DELETE',
          url: `/api/v1/admin/categories/${category.id}`,
          headers: {
            authorization: `Bearer ${adminToken}`,
          },
        });

        expect(response.statusCode).toBe(500);
        const body = JSON.parse(response.body);
        expect(body.message).toContain('услугами');
      });
    });
  });

  describe('Services - Public Routes', () => {
    describe('GET /api/v1/services', () => {
      it('должен вернуть список услуг', async () => {
        const category = await createTestCategory();
        await createTestService({ categoryId: category.id });
        await createTestService({ categoryId: category.id, name: 'Service 2' });

        const response = await app.inject({
          method: 'GET',
          url: '/api/v1/services',
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(Array.isArray(body.data)).toBe(true);
        expect(body).toHaveProperty('pagination');
      });

      it('должен поддерживать пагинацию', async () => {
        const category = await createTestCategory();
        for (let i = 0; i < 5; i++) {
          await createTestService({ categoryId: category.id, name: `Service ${i}` });
        }

        const response = await app.inject({
          method: 'GET',
          url: '/api/v1/services?page=1&limit=2',
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.data.length).toBeLessThanOrEqual(2);
        expect(body.pagination.page).toBe(1);
        expect(body.pagination.limit).toBe(2);
      });

      it('должен фильтровать по категории', async () => {
        const cat1 = await createTestCategory({ name: 'Cat 1', slug: 'cat1' });
        const cat2 = await createTestCategory({ name: 'Cat 2', slug: 'cat2' });
        await createTestService({ categoryId: cat1.id, name: 'Service 1' });
        await createTestService({ categoryId: cat2.id, name: 'Service 2' });

        const response = await app.inject({
          method: 'GET',
          url: `/api/v1/services?categoryId=${cat1.id}`,
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        body.data.forEach((service: any) => {
          expect(service.categoryId).toBe(cat1.id);
        });
      });

      it('должен поддерживать поиск', async () => {
        const category = await createTestCategory();
        await createTestService({ categoryId: category.id, name: 'Unique Service Name' });
        await createTestService({ categoryId: category.id, name: 'Other Service' });

        const response = await app.inject({
          method: 'GET',
          url: '/api/v1/services?search=Unique',
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data.some((s: any) => s.name.includes('Unique'))).toBe(true);
      });
    });

    describe('GET /api/v1/services/:slug', () => {
      it('должен вернуть услугу по slug', async () => {
        const category = await createTestCategory();
        const service = await createTestService({
          categoryId: category.id,
          name: 'Test Service',
          slug: 'test-service',
        });

        const response = await app.inject({
          method: 'GET',
          url: `/api/v1/services/${service.slug}`,
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data.slug).toBe('test-service');
        expect(body.data.name).toBe('Test Service');
      });

      it('должен вернуть 404 для несуществующей услуги', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/v1/services/non-existent',
        });

        expect(response.statusCode).toBe(404);
        const body = JSON.parse(response.body);
        expect(body.message).toContain('Услуга не найдена');
      });
    });
  });

  describe('Services - Admin Routes', () => {
    describe('POST /api/v1/admin/services', () => {
      it('должен создать услугу', async () => {
        const category = await createTestCategory();

        const response = await app.inject({
          method: 'POST',
          url: '/api/v1/admin/services',
          headers: {
            authorization: `Bearer ${adminToken}`,
          },
          payload: {
            name: 'New Service',
            description: 'Service description',
            categoryId: category.id,
            isActive: true,
          },
        });

        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data.name).toBe('New Service');
        expect(body.data.categoryId).toBe(category.id);
      });

      it('должен валидировать обязательные поля', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/v1/admin/services',
          headers: {
            authorization: `Bearer ${adminToken}`,
          },
          payload: {
            name: 'Service without category',
            // categoryId отсутствует
          },
        });

        expect(response.statusCode).toBe(400);
      });
    });

    describe('PUT /api/v1/admin/services/:id', () => {
      it('должен обновить услугу', async () => {
        const category = await createTestCategory();
        const service = await createTestService({ categoryId: category.id });

        const response = await app.inject({
          method: 'PUT',
          url: `/api/v1/admin/services/${service.id}`,
          headers: {
            authorization: `Bearer ${adminToken}`,
          },
          payload: {
            name: 'Updated Service',
            description: 'Updated description',
          },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data.name).toBe('Updated Service');
      });
    });

    describe('DELETE /api/v1/admin/services/:id', () => {
      it('должен удалить услугу', async () => {
        const category = await createTestCategory();
        const service = await createTestService({ categoryId: category.id });

        const response = await app.inject({
          method: 'DELETE',
          url: `/api/v1/admin/services/${service.id}`,
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
});

