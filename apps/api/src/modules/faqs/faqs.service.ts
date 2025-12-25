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
    const where: Prisma.FaqWhereInput = {};

    if (onlyActive || query.isActive === true) {
      where.isActive = true;
    } else if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.category) {
      where.category = query.category;
    }

    const cacheKey = `faqs:${JSON.stringify({ ...query, onlyActive })}`;

    if (redis && onlyActive) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const faqs = await prisma.faq.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    if (redis && onlyActive) {
      await redis.setex(cacheKey, 600, JSON.stringify(faqs)); // 10 минут
    }

    return faqs;
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

