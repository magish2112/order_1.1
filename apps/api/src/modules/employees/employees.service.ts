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
    const where: Prisma.EmployeeWhereInput = {};

    if (query.department) {
      where.department = query.department;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const cacheKey = `employees:${JSON.stringify(query)}`;

    if (redis && query.isActive === true) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const employees = await prisma.employee.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { lastName: 'asc' },
        { firstName: 'asc' },
      ],
    });

    if (redis && query.isActive === true) {
      await redis.setex(cacheKey, 600, JSON.stringify(employees)); // 10 минут
    }

    return employees;
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

    // Обрабатываем null значения для опциональных полей
    const updateData: any = { ...data };
    if (updateData.department === null || updateData.department === undefined) {
      updateData.department = null;
    }
    if (updateData.photo === null || updateData.photo === undefined) {
      updateData.photo = null;
    }
    if (updateData.bio === null || updateData.bio === undefined) {
      updateData.bio = null;
    }

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

