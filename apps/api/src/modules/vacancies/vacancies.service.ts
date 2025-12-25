import { Prisma } from '@prisma/client';
import prisma from '../../config/database';
import redis from '../../config/redis';
import {
  CreateVacancyInput,
  UpdateVacancyInput,
  GetVacanciesQuery,
} from './vacancies.schema';

export class VacanciesService {
  /**
   * Получить список вакансий
   */
  async getVacancies(query: GetVacanciesQuery, onlyActive = true) {
    const { page, limit, search, ...filters } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.VacancyWhereInput = {};

    if (onlyActive || filters.isActive === true) {
      where.isActive = true;
    } else if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.department) {
      where.department = filters.department;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } },
      ];
    }

    const cacheKey = `vacancies:${JSON.stringify({ ...query, onlyActive })}`;

    if (redis && onlyActive) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const [items, total] = await Promise.all([
      prisma.vacancy.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.vacancy.count({ where }),
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
   * Получить вакансию по ID
   */
  async getVacancyById(id: string) {
    const vacancy = await prisma.vacancy.findUnique({
      where: { id },
    });

    return vacancy;
  }

  /**
   * Создать вакансию
   */
  async createVacancy(input: CreateVacancyInput) {
    const vacancy = await prisma.vacancy.create({
      data: input,
    });

    await this.invalidateVacanciesCache();

    return vacancy;
  }

  /**
   * Обновить вакансию
   */
  async updateVacancy(input: UpdateVacancyInput) {
    const { id, ...data } = input;

    const vacancy = await prisma.vacancy.update({
      where: { id },
      data,
    });

    await this.invalidateVacanciesCache();

    return vacancy;
  }

  /**
   * Удалить вакансию
   */
  async deleteVacancy(id: string) {
    await prisma.vacancy.delete({ where: { id } });
    await this.invalidateVacanciesCache();

    return { success: true };
  }

  /**
   * Инвалидация кеша вакансий
   */
  private async invalidateVacanciesCache() {
    if (!redis) return;

    const keys = await redis.keys('vacancies:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}

export default new VacanciesService();

