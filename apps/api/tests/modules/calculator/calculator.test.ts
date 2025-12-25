import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import {
  createTestApp,
  closeTestApp,
  createTestUser,
  getAuthToken,
} from '../../helpers';
import prisma from '../../../src/config/database';

describe('Calculator Module', () => {
  let app: FastifyInstance;
  let adminToken: string;

  beforeAll(async () => {
    app = await createTestApp();

    await createTestUser({
      email: 'admin-calculator@test.com',
      password: 'password123',
      role: 'ADMIN',
    });

    const adminAuth = await getAuthToken(app, 'admin-calculator@test.com', 'password123');
    adminToken = adminAuth.accessToken;
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe('GET /api/v1/calculator/config', () => {
    it('должен вернуть конфигурацию калькулятора', async () => {
      // Создаем тестовую конфигурацию
      await prisma.calculatorConfig.create({
        data: {
          name: 'Default Config',
          basePriceCosmetic: 3000,
          basePriceCapital: 5000,
          basePriceDesign: 8000,
          basePriceElite: 12000,
          coefficients: {
            newBuilding: 0.9,
            secondary: 1.0,
          },
        },
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/calculator/config',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('basePriceCosmetic');
      expect(body.data).toHaveProperty('basePriceCapital');
    });
  });

  describe('POST /api/v1/calculator/calculate', () => {
    it('должен рассчитать стоимость ремонта', async () => {
      // Создаем конфигурацию
      await prisma.calculatorConfig.create({
        data: {
          name: 'Test Config',
          basePriceCosmetic: 3000,
          basePriceCapital: 5000,
          basePriceDesign: 8000,
          basePriceElite: 12000,
          coefficients: {
            newBuilding: 0.9,
            secondary: 1.0,
          },
        },
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/calculator/calculate',
        payload: {
          propertyType: 'apartment',
          housingType: 'newBuilding',
          rooms: 2,
          area: 50,
          repairType: 'cosmetic',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('totalPrice');
      expect(body.data).toHaveProperty('pricePerSquareMeter');
      expect(typeof body.data.totalPrice).toBe('number');
      expect(body.data.totalPrice).toBeGreaterThan(0);
    });

    it('должен валидировать входные данные', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/calculator/calculate',
        payload: {
          propertyType: 'apartment',
          // остальные обязательные поля отсутствуют
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('должен обработать разные типы ремонта', async () => {
      await prisma.calculatorConfig.create({
        data: {
          name: 'Test Config',
          basePriceCosmetic: 3000,
          basePriceCapital: 5000,
          basePriceDesign: 8000,
          basePriceElite: 12000,
          coefficients: {
            newBuilding: 0.9,
            secondary: 1.0,
          },
        },
      });

      const types = ['cosmetic', 'capital', 'design', 'elite'];
      for (const type of types) {
        const response = await app.inject({
          method: 'POST',
          url: '/api/v1/calculator/calculate',
          payload: {
            propertyType: 'apartment',
            housingType: 'newBuilding',
            rooms: 2,
            area: 50,
            repairType: type,
          },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.success).toBe(true);
        expect(body.data.totalPrice).toBeGreaterThan(0);
      }
    });
  });

  describe('PUT /api/v1/admin/calculator/config', () => {
    it('должен обновить конфигурацию калькулятора', async () => {
      const config = await prisma.calculatorConfig.create({
        data: {
          name: 'Test Config',
          basePriceCosmetic: 3000,
          basePriceCapital: 5000,
          basePriceDesign: 8000,
          basePriceElite: 12000,
          coefficients: {
            newBuilding: 0.9,
            secondary: 1.0,
          },
        },
      });

      const response = await app.inject({
        method: 'PUT',
        url: '/api/v1/admin/calculator/config',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
        payload: {
          id: config.id,
          basePriceCosmetic: 3500,
          basePriceCapital: 5500,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.basePriceCosmetic).toBe(3500);
      expect(body.data.basePriceCapital).toBe(5500);
    });

    it('должен вернуть 401 без токена', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/v1/admin/calculator/config',
        payload: {
          basePriceCosmetic: 3000,
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });
});

