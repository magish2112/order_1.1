import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import {
  createTestApp,
  closeTestApp,
  createTestUser,
  createTestEmployee,
  getAuthToken,
} from '../../helpers';

describe('Employees Module', () => {
  let app: FastifyInstance;
  let adminToken: string;
  let managerToken: string;

  beforeAll(async () => {
    app = await createTestApp();

    await createTestUser({
      email: 'admin-employees@test.com',
      password: 'password123',
      role: 'ADMIN',
    });

    await createTestUser({
      email: 'manager-employees@test.com',
      password: 'password123',
      role: 'MANAGER',
    });

    const adminAuth = await getAuthToken(app, 'admin-employees@test.com', 'password123');
    const managerAuth = await getAuthToken(app, 'manager-employees@test.com', 'password123');
    adminToken = adminAuth.accessToken;
    managerToken = managerAuth.accessToken;
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe('GET /api/v1/employees', () => {
    it('должен вернуть список активных сотрудников', async () => {
      await createTestEmployee({ isActive: true });
      await createTestEmployee({ isActive: true, firstName: 'Jane' });
      await createTestEmployee({ isActive: false });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/employees',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      // Только активные сотрудники
      body.data.forEach((employee: any) => {
        expect(employee.isActive).toBe(true);
      });
    });

    it('должен фильтровать по отделу', async () => {
      await createTestEmployee({ department: 'Design', isActive: true });
      await createTestEmployee({ department: 'Management', isActive: true });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/employees?department=Design',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      body.data.forEach((employee: any) => {
        expect(employee.department).toBe('Design');
      });
    });
  });

  describe('GET /api/v1/admin/employees/:id', () => {
    it('должен вернуть сотрудника по ID', async () => {
      const employee = await createTestEmployee();

      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/admin/employees/${employee.id}`,
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(employee.id);
    });
  });

  describe('POST /api/v1/admin/employees', () => {
    it('должен создать сотрудника', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/employees',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
        payload: {
          firstName: 'John',
          lastName: 'Doe',
          position: 'Designer',
          department: 'Design',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.firstName).toBe('John');
      expect(body.data.position).toBe('Designer');
    });

    it('должен валидировать обязательные поля', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/employees',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
        payload: {
          firstName: 'John',
          // lastName отсутствует
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('PUT /api/v1/admin/employees/:id', () => {
    it('должен обновить сотрудника', async () => {
      const employee = await createTestEmployee();

      const response = await app.inject({
        method: 'PUT',
        url: `/api/v1/admin/employees/${employee.id}`,
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
        payload: {
          position: 'Senior Designer',
          department: 'Design',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.position).toBe('Senior Designer');
    });
  });

  describe('DELETE /api/v1/admin/employees/:id', () => {
    it('должен удалить сотрудника', async () => {
      const employee = await createTestEmployee();

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/v1/admin/employees/${employee.id}`,
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });

    it('должен вернуть 403 для MANAGER', async () => {
      const employee = await createTestEmployee();

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/v1/admin/employees/${employee.id}`,
        headers: {
          authorization: `Bearer ${managerToken}`,
        },
      });

      expect(response.statusCode).toBe(403);
    });
  });
});

