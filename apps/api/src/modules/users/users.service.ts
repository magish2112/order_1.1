import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import prisma from '../../config/database';
import {
  CreateUserInput,
  UpdateUserInput,
  GetUsersQuery,
} from './users.schema';

export class UsersService {
  /**
   * Получить список пользователей
   */
  async getUsers(query: GetUsersQuery) {
    const { page, limit, search, ...filters } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          // Не возвращаем passwordHash
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Получить пользователя по ID
   */
  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Не возвращаем passwordHash
      },
    });

    return user;
  }

  /**
   * Создать пользователя (только менеджера)
   */
  async createUser(input: CreateUserInput) {
    // Проверяем, существует ли пользователь с таким email
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new Error('Пользователь с таким email уже существует');
    }

    // Хешируем пароль
    const passwordHash = await bcrypt.hash(input.password, 10);

    // Создаем пользователя (только MANAGER)
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        role: input.role, // Только MANAGER
        isActive: input.isActive ?? true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Обновить пользователя
   */
  async updateUser(input: UpdateUserInput) {
    const { id, password, ...data } = input;

    const updateData: Prisma.UserUpdateInput = { ...data };

    // Если пароль указан, хешируем его
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    // Проверяем уникальность email, если он изменяется
    if (data.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email,
          NOT: { id },
        },
      });

      if (existingUser) {
        throw new Error('Пользователь с таким email уже существует');
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Удалить пользователя
   */
  async deleteUser(id: string) {
    // Проверяем, что это не последний администратор
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error('Пользователь не найден');
    }

    // Нельзя удалить себя
    // Это проверяется в контроллере

    await prisma.user.delete({ where: { id } });

    return { success: true };
  }
}

export default new UsersService();
