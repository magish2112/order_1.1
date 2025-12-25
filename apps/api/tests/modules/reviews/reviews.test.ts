import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import {
  createTestApp,
  closeTestApp,
  createTestUser,
  createTestProject,
  createTestReview,
  getAuthToken,
} from '../../helpers';

describe('Reviews Module', () => {
  let app: FastifyInstance;
  let adminToken: string;
  let managerToken: string;

  beforeAll(async () => {
    app = await createTestApp();

    await createTestUser({
      email: 'admin-reviews@test.com',
      password: 'password123',
      role: 'ADMIN',
    });

    await createTestUser({
      email: 'manager-reviews@test.com',
      password: 'password123',
      role: 'MANAGER',
    });

    const adminAuth = await getAuthToken(app, 'admin-reviews@test.com', 'password123');
    const managerAuth = await getAuthToken(app, 'manager-reviews@test.com', 'password123');
    adminToken = adminAuth.accessToken;
    managerToken = managerAuth.accessToken;
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe('GET /api/v1/reviews', () => {
    it('должен вернуть список одобренных отзывов', async () => {
      await createTestReview({ isApproved: true });
      await createTestReview({ isApproved: true, authorName: 'User 2' });
      await createTestReview({ isApproved: false });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/reviews',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      // Только одобренные отзывы
      body.data.forEach((review: any) => {
        expect(review.isApproved).toBe(true);
      });
    });

    it('должен фильтровать по проекту', async () => {
      const project = await createTestProject();
      await createTestReview({ projectId: project.id, isApproved: true });
      await createTestReview({ isApproved: true });

      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/reviews?projectId=${project.id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      body.data.forEach((review: any) => {
        expect(review.projectId).toBe(project.id);
      });
    });

    it('должен фильтровать по рейтингу', async () => {
      await createTestReview({ rating: 5, isApproved: true });
      await createTestReview({ rating: 4, isApproved: true });
      await createTestReview({ rating: 3, isApproved: true });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/reviews?rating=5',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      body.data.forEach((review: any) => {
        expect(review.rating).toBe(5);
      });
    });
  });

  describe('POST /api/v1/admin/reviews', () => {
    it('должен создать отзыв', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/reviews',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
        payload: {
          authorName: 'Test User',
          content: 'Great service!',
          rating: 5,
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.authorName).toBe('Test User');
      expect(body.data.rating).toBe(5);
    });
  });

  describe('PUT /api/v1/admin/reviews/:id', () => {
    it('должен обновить отзыв', async () => {
      const review = await createTestReview();

      const response = await app.inject({
        method: 'PUT',
        url: `/api/v1/admin/reviews/${review.id}`,
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
        payload: {
          content: 'Updated review content',
          rating: 4,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.content).toBe('Updated review content');
    });
  });

  describe('PATCH /api/v1/admin/reviews/:id/approve', () => {
    it('должен одобрить отзыв', async () => {
      const review = await createTestReview({ isApproved: false });

      const response = await app.inject({
        method: 'PATCH',
        url: `/api/v1/admin/reviews/${review.id}/approve`,
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.isApproved).toBe(true);
    });
  });

  describe('DELETE /api/v1/admin/reviews/:id', () => {
    it('должен удалить отзыв', async () => {
      const review = await createTestReview();

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/v1/admin/reviews/${review.id}`,
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

