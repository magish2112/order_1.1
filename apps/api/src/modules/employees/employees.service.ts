import { Prisma } from '@prisma/client';
import prisma from '../../config/database';
import redis from '../../config/redis';
import {
  CreateEmployeeInput,
  UpdateEmployeeInput,
  GetEmployeesQuery,
} from './employees.schema';

export class EmployeesService {
  /**
   * Получить список сотрудников
   */
  async getEmployees(query: GetEmployeesQuery) {
    const { page, limit, ...filters } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.EmployeeWhereInput = {};

    if (filters.department) {
      where.department = filters.department;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const cacheKey = `employees:${JSON.stringify(query)}`;

    if (redis && filters.isActive === true) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const [items, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { order: 'asc' },
          { lastName: 'asc' },
          { firstName: 'asc' },
        ],
      }),
      prisma.employee.count({ where }),
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

    if (redis && filters.isActive === true) {
      await redis.setex(cacheKey, 600, JSON.stringify(result)); // 10 минут
    }

    return result;
  }

  /**
   * Получить сотрудника по ID
   */
  async getEmployeeById(id: string) {
    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    return employee;
  }

  /**
   * Создать сотрудника
   */
  async createEmployee(input: CreateEmployeeInput) {
    const employee = await prisma.employee.create({
      data: {
        ...input,
        department: input.department || null,
        photo: input.photo || null,
        bio: input.bio || null,
      },
    });

    await this.invalidateEmployeesCache();

    return employee;
  }

  /**
   * Обновить сотрудника
   */
  async updateEmployee(input: UpdateEmployeeInput) {
    const { id, ...data } = input;

    const updateData: Prisma.EmployeeUpdateInput = {
      ...data,
      department: data.department ?? null,
      photo: data.photo ?? null,
      bio: data.bio ?? null,
    };

    const employee = await prisma.employee.update({
      where: { id },
      data: updateData,
    });

    await this.invalidateEmployeesCache();

    return employee;
  }

  /**
   * Удалить сотрудника
   */
  async deleteEmployee(id: string) {
    await prisma.employee.delete({ where: { id } });
    await this.invalidateEmployeesCache();

    return { success: true };
  }

  /**
   * Инвалидация кеша сотрудников
   */
  private async invalidateEmployeesCache() {
    if (!redis) return;

    const keys = await redis.keys('employees:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}

export default new EmployeesService();

