import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import {
  createTestApp,
  closeTestApp,
  createTestUser,
  createTestCategory,
  createTestService,
  getAuthToken,
} from '../helpers';

describe('API Integration Tests', () => {
  let app: FastifyInstance;
  let adminToken: string;

  beforeAll(async () => {
    app = await createTestApp();

    await createTestUser({
      email: 'integration@test.com',
      password: 'password123',
      role: 'ADMIN',
    });

    const auth = await getAuthToken(app, 'integration@test.com', 'password123');
    adminToken = auth.accessToken;
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe('Health Check', () => {
    it('должен вернуть статус здоровья сервиса', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('ok');
      expect(body).toHaveProperty('timestamp');
      expect(body).toHaveProperty('database');
      expect(body).toHaveProperty('redis');
    });
  });

  describe('Полный цикл работы с категориями и услугами', () => {
    it('должен создать категорию, затем услугу, затем получить их', async () => {
      // 1. Создание категории
      const createCategoryResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/categories',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
        payload: {
          name: 'Integration Category',
          description: 'Category for integration test',
        },
      });

      expect(createCategoryResponse.statusCode).toBe(201);
      const category = JSON.parse(createCategoryResponse.body).data;

      // 2. Получение категории по slug
      const getCategoryResponse = await app.inject({
        method: 'GET',
        url: `/api/v1/categories/${category.slug}`,
      });

      expect(getCategoryResponse.statusCode).toBe(200);
      const fetchedCategory = JSON.parse(getCategoryResponse.body).data;
      expect(fetchedCategory.id).toBe(category.id);

      // 3. Создание услуги в категории
      const createServiceResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/services',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
        payload: {
          name: 'Integration Service',
          description: 'Service for integration test',
          categoryId: category.id,
        },
      });

      expect(createServiceResponse.statusCode).toBe(201);
      const service = JSON.parse(createServiceResponse.body).data;

      // 4. Получение услуги по slug
      const getServiceResponse = await app.inject({
        method: 'GET',
        url: `/api/v1/services/${service.slug}`,
      });

      expect(getServiceResponse.statusCode).toBe(200);
      const fetchedService = JSON.parse(getServiceResponse.body).data;
      expect(fetchedService.id).toBe(service.id);
      expect(fetchedService.categoryId).toBe(category.id);

      // 5. Получение списка услуг с фильтром по категории
      const listServicesResponse = await app.inject({
        method: 'GET',
        url: `/api/v1/services?categoryId=${category.id}`,
      });

      expect(listServicesResponse.statusCode).toBe(200);
      const servicesList = JSON.parse(listServicesResponse.body).data;
      expect(servicesList.some((s: any) => s.id === service.id)).toBe(true);
    });
  });

  describe('Аутентификация и авторизация', () => {
    it('должен выполнить полный цикл: логин -> получение профиля -> обновление токена -> выход', async () => {
      await createTestUser({
        email: 'fullcycle@test.com',
        password: 'password123',
      });

      // 1. Логин
      const loginResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'fullcycle@test.com',
          password: 'password123',
        },
      });

      expect(loginResponse.statusCode).toBe(200);
      const loginData = JSON.parse(loginResponse.body).data;
      const { accessToken, refreshToken } = loginData.tokens;

      // 2. Получение профиля
      const meResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(meResponse.statusCode).toBe(200);
      const userData = JSON.parse(meResponse.body).data;
      expect(userData.email).toBe('fullcycle@test.com');

      // 3. Обновление токена
      const refreshResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/refresh',
        payload: {
          refreshToken,
        },
      });

      expect(refreshResponse.statusCode).toBe(200);
      const refreshData = JSON.parse(refreshResponse.body).data;
      expect(refreshData).toHaveProperty('accessToken');
      expect(refreshData).toHaveProperty('refreshToken');

      // 4. Выход
      const logoutResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/logout',
        headers: {
          authorization: `Bearer ${refreshData.accessToken}`,
        },
      });

      expect(logoutResponse.statusCode).toBe(200);
    });
  });

  describe('Пагинация и фильтрация', () => {
    it('должен корректно работать с пагинацией услуг', async () => {
      const category = await createTestCategory();

      // Создаем несколько услуг
      for (let i = 0; i < 15; i++) {
        await createTestService({
          categoryId: category.id,
          name: `Service ${i}`,
          slug: `service-${i}`,
        });
      }

      // Первая страница
      const page1Response = await app.inject({
        method: 'GET',
        url: '/api/v1/services?page=1&limit=5',
      });

      expect(page1Response.statusCode).toBe(200);
      const page1Data = JSON.parse(page1Response.body);
      expect(page1Data.data.length).toBe(5);
      expect(page1Data.pagination.page).toBe(1);
      expect(page1Data.pagination.limit).toBe(5);
      expect(page1Data.pagination.total).toBeGreaterThanOrEqual(15);

      // Вторая страница
      const page2Response = await app.inject({
        method: 'GET',
        url: '/api/v1/services?page=2&limit=5',
      });

      expect(page2Response.statusCode).toBe(200);
      const page2Data = JSON.parse(page2Response.body);
      expect(page2Data.data.length).toBe(5);
      expect(page2Data.pagination.page).toBe(2);
    });
  });

  describe('Дерево категорий', () => {
    it('должен корректно строить иерархию категорий', async () => {
      const parent = await createTestCategory({
        name: 'Parent Category',
        slug: 'parent-category',
      });

      const child1 = await createTestCategory({
        name: 'Child 1',
        slug: 'child-1',
        parentId: parent.id,
      });

      const child2 = await createTestCategory({
        name: 'Child 2',
        slug: 'child-2',
        parentId: parent.id,
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/categories',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);

      // Находим родительскую категорию в дереве
      const parentInTree = body.data.find((cat: any) => cat.id === parent.id);
      expect(parentInTree).toBeDefined();
      expect(parentInTree.children).toBeDefined();
      expect(parentInTree.children.length).toBeGreaterThanOrEqual(2);
    });
  });
});

