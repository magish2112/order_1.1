import { Prisma } from '@prisma/client';
import prisma from '../../config/database';
import redis from '../../config/redis';
import {
  CreateFaqInput,
  UpdateFaqInput,
  GetFaqsQuery,
} from './faqs.schema';

export class FaqsService {
  /**
   * Получить список FAQ
   */
  async getFaqs(query: GetFaqsQuery, onlyActive = true) {
    const { page, limit, ...filters } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.FaqWhereInput = {};

    if (onlyActive || filters.isActive === true) {
      where.isActive = true;
    } else if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.category) {
      where.category = filters.category;
    }

    const cacheKey = `faqs:${JSON.stringify({ ...query, onlyActive })}`;

    if (redis && onlyActive) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const [items, total] = await Promise.all([
      prisma.faq.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { order: 'asc' },
          { createdAt: 'desc' },
        ],
      }),
      prisma.faq.count({ where }),
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

    if (redis && onlyActive) {
      await redis.setex(cacheKey, 600, JSON.stringify(result)); // 10 минут
    }

    return result;
  }

  /**
   * Получить FAQ по ID
   */
  async getFaqById(id: string) {
    const faq = await prisma.faq.findUnique({
      where: { id },
    });

    return faq;
  }

  /**
   * Создать FAQ
   */
  async createFaq(input: CreateFaqInput) {
    const faq = await prisma.faq.create({
      data: input,
    });

    await this.invalidateFaqsCache();

    return faq;
  }

  /**
   * Обновить FAQ
   */
  async updateFaq(input: UpdateFaqInput) {
    const { id, ...data } = input;

    const faq = await prisma.faq.update({
      where: { id },
      data,
    });

    await this.invalidateFaqsCache();

    return faq;
  }

  /**
   * Удалить FAQ
   */
  async deleteFaq(id: string) {
    await prisma.faq.delete({ where: { id } });
    await this.invalidateFaqsCache();

    return { success: true };
  }

  /**
   * Инвалидация кеша FAQ
   */
  private async invalidateFaqsCache() {
    if (!redis) return;

    const keys = await redis.keys('faqs:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}

export default new FaqsService();

