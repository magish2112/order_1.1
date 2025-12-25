import { Prisma } from '@prisma/client';
import prisma from '../../config/database';
import redis from '../../config/redis';
import {
  CreateReviewInput,
  UpdateReviewInput,
  GetReviewsQuery,
} from './reviews.schema';

export class ReviewsService {
  /**
   * Получить список отзывов
   */
  async getReviews(query: GetReviewsQuery, onlyApproved = true) {
    const { page, limit, ...filters } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ReviewWhereInput = {};

    if (onlyApproved || filters.isApproved === true) {
      where.isApproved = true;
    } else if (filters.isApproved !== undefined) {
      where.isApproved = filters.isApproved;
    }

    if (filters.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters.source) {
      where.source = filters.source;
    }

    if (filters.rating) {
      where.rating = filters.rating;
    }

    const cacheKey = `reviews:${JSON.stringify({ ...query, onlyApproved })}`;

    if (redis && onlyApproved) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const [items, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.count({ where }),
    ]);

    const result = {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    if (redis && onlyApproved) {
      await redis.setex(cacheKey, 300, JSON.stringify(result)); // 5 минут
    }

    return result;
  }

  /**
   * Получить отзыв по ID
   */
  async getReviewById(id: string) {
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverImage: true,
            afterImages: true,
            beforeImages: true,
            location: true,
          },
        },
      },
    });

    return review;
  }

  /**
   * Создать отзыв
   */
  async createReview(input: CreateReviewInput) {
    const review = await prisma.review.create({
      data: input,
    });

    await this.invalidateReviewsCache();

    return review;
  }

  /**
   * Обновить отзыв
   */
  async updateReview(input: UpdateReviewInput) {
    const { id, ...data } = input;

    const review = await prisma.review.update({
      where: { id },
      data,
    });

    await this.invalidateReviewsCache();

    return review;
  }

  /**
   * Удалить отзыв
   */
  async deleteReview(id: string) {
    await prisma.review.delete({ where: { id } });
    await this.invalidateReviewsCache();

    return { success: true };
  }

  /**
   * Одобрить отзыв
   */
  async approveReview(id: string) {
    const review = await prisma.review.update({
      where: { id },
      data: { isApproved: true },
    });

    await this.invalidateReviewsCache();

    return review;
  }

  /**
   * Инвалидация кеша отзывов
   */
  private async invalidateReviewsCache() {
    if (!redis) return;

    const keys = await redis.keys('reviews:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}

export default new ReviewsService();

