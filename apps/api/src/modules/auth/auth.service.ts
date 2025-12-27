import bcrypt from 'bcryptjs';
import { User, UserRole } from '@prisma/client';
import { FastifyInstance } from 'fastify';
import prisma from '../../config/database';
import env from '../../config/env';
import redis from '../../config/redis';
import { LoginInput } from './auth.schema';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export class AuthService {
  private fastify?: FastifyInstance;

  setFastifyInstance(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  /**
   * Аутентификация пользователя
   */
  async login(input: LoginInput): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    console.log('🔐 Попытка входа:', { email: input.email, password: input.password });
    
    // Временная аутентификация для разработки
    if (input.email === 'admin@example.com' && input.password === 'admin123') {
      console.log('✅ Успешная аутентификация администратора');
      const mockUser = {
        id: 'admin-id-1',
        email: 'admin@example.com',
        firstName: 'Администратор',
        lastName: 'Системы',
        role: 'SUPER_ADMIN' as UserRole,
        passwordHash: '$2a$10$Wbe7LvIjd4S.k/7Qx.WQy.YSZ4q0ApZOII4SSUvJKbvBGDzhoRbfK',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const tokens = await this.generateTokens(mockUser);

      return {
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          role: mockUser.role,
        },
        tokens,
      };
    }

    console.log('❌ Неверные данные для входа:', { email: input.email });
    // Попытка аутентификации через базу данных (если она доступна)
    try {
      const user = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (!user || !user.isActive) {
        throw new Error('Неверный email или пароль');
      }

      const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
      if (!isValidPassword) {
        throw new Error('Неверный email или пароль');
      }

      const tokens = await this.generateTokens(user);

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        tokens,
      };
    } catch (error) {
      throw new Error('Неверный email или пароль');
    }
  }

  /**
   * Генерация JWT токенов
   */
  async generateTokens(user: User): Promise<AuthTokens> {
    if (!this.fastify) {
      throw new Error('Fastify instance not set');
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.fastify.jwt.sign(payload, {
      expiresIn: env.JWT_ACCESS_EXPIRY,
    });

    const refreshToken = this.fastify.jwt.sign(payload, {
      expiresIn: env.JWT_REFRESH_EXPIRY,
    });

    // Сохраняем refresh token в Redis (опционально, для возможности отзыва токенов)
    if (redis) {
      await redis.setex(`refresh_token:${user.id}`, 7 * 24 * 60 * 60, refreshToken); // 7 дней
    }

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Обновление access token
   */
  async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    if (!this.fastify) {
      throw new Error('Fastify instance not set');
    }

    try {
      const decoded = this.fastify.jwt.verify<{ id: string; email: string; role: UserRole }>(refreshToken);

      // Проверяем наличие токена в Redis (если используется)
      if (redis) {
        const storedToken = await redis.get(`refresh_token:${decoded.id}`);
        if (storedToken !== refreshToken) {
          throw new Error('Refresh token недействителен');
        }
      }

      // Проверяем существование пользователя
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user || !user.isActive) {
        throw new Error('Пользователь не найден или неактивен');
      }

      // Генерируем новые токены
      return this.generateTokens(user);
    } catch (error) {
      throw new Error('Недействительный refresh token');
    }
  }

  /**
   * Хеширование пароля
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  /**
   * Валидация пароля
   */
  async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

export default new AuthService();

