import bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import { UserRoleType } from '../../constants/roles';
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
  role: UserRoleType;
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
    input.email = (input.email || '').trim().toLowerCase();
    // Временная аутентификация для разработки (ТОЛЬКО если явно установлены переменные окружения)
    // В production этот код не должен работать
    if (env.NODE_ENV === 'development' && env.DEV_ADMIN_EMAIL && env.DEV_ADMIN_PASSWORD) {
      if (input.email === env.DEV_ADMIN_EMAIL && input.password === env.DEV_ADMIN_PASSWORD) {
        // Создаем или получаем dev пользователя из БД
        let devUser = await prisma.user.findUnique({
          where: { email: env.DEV_ADMIN_EMAIL },
        });

        if (!devUser) {
          // Создаем dev пользователя если его нет
          const passwordHash = await this.hashPassword(env.DEV_ADMIN_PASSWORD);
          devUser = await prisma.user.create({
            data: {
              email: env.DEV_ADMIN_EMAIL,
              passwordHash,
              firstName: 'Администратор',
              lastName: 'Системы',
              role: 'SUPER_ADMIN' as UserRoleType,
              isActive: true,
            },
          });
        }

        const tokens = await this.generateTokens(devUser);

        return {
          user: {
            id: devUser.id,
            email: devUser.email,
            firstName: devUser.firstName,
            lastName: devUser.lastName,
            role: devUser.role as UserRoleType,
          },
          tokens,
        };
      }
    }
    // Попытка аутентификации через базу данных (если она доступна)
    try {
      const user = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (!user || !user.isActive) {
        // Логируем неудачную попытку входа
        if (this.fastify) {
          this.fastify.log.warn({
            email: input.email,
            reason: user ? 'inactive_user' : 'user_not_found',
            ip: 'unknown', // Можно добавить из request если доступен
          }, 'Failed login attempt');
        }
        throw new Error('Неверный email или пароль');
      }

      const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
      if (!isValidPassword) {
        // Логируем неудачную попытку входа (неверный пароль)
        if (this.fastify) {
          this.fastify.log.warn({
            email: input.email,
            userId: user.id,
            reason: 'invalid_password',
            ip: 'unknown',
          }, 'Failed login attempt - invalid password');
        }
        throw new Error('Неверный email или пароль');
      }

      // Логируем успешный вход
      if (this.fastify) {
        this.fastify.log.info({
          userId: user.id,
          email: user.email,
          role: user.role,
          ip: 'unknown',
        }, 'User logged in successfully');
      }

      const tokens = await this.generateTokens(user);

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role as UserRoleType,
        },
        tokens,
      };
    } catch (error: unknown) {
      // Если это не наша ошибка, логируем её
      if (error instanceof Error && error.message !== 'Неверный email или пароль') {
        if (this.fastify) {
          this.fastify.log.error({
            email: input.email,
            error: error instanceof Error ? error.message : 'Unknown error',
          }, 'Login error');
        }
      }
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
      const decoded = this.fastify.jwt.verify<{ id: string; email: string; role: UserRoleType }>(refreshToken);

      // Проверяем наличие токена в Redis (если используется)
      if (redis) {
        const storedToken = await redis.get(`refresh_token:${decoded.id}`);
        if (storedToken !== refreshToken) {
          throw new Error('Refresh token недействителен');
        }
        
        // Удаляем использованный refresh token (одноразовость)
        await redis.del(`refresh_token:${decoded.id}`);
      }

      // Проверяем существование пользователя
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user || !user.isActive) {
        throw new Error('Пользователь не найден или неактивен');
      }

      // Генерируем новые токены (включая новый refresh token)
      return this.generateTokens(user);
    } catch (error: unknown) {
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

  /**
   * Logout пользователя - инвалидирует токен
   */
  async logout(accessToken: string): Promise<void> {
    if (!this.fastify || !redis) {
      return; // Если Redis не доступен, просто пропускаем
    }

    try {
      // Декодировать токен чтобы получить время истечения
      const decoded = this.fastify.jwt.verify<{
        id: string;
        email: string;
        role: UserRoleType;
        iat: number;
        exp: number;
      }>(accessToken);

      // Вычислить сколько секунд осталось до истечения токена
      const expiresIn = Math.max(0, decoded.exp - Math.floor(Date.now() / 1000));

      if (expiresIn > 0) {
        // Добавить токен в черный список на время его действия
        await redis.setex(`blacklist:${accessToken}`, expiresIn, '1');
      }

      // Также удалить refresh token из Redis
      const refreshTokenKey = `refresh_token:${decoded.id}`;
      await redis.del(refreshTokenKey);
    } catch (error: unknown) {
      // Ошибка в декодировании - токен уже невалиден
      // Не логируем детали ошибки для безопасности
    }
  }
}

export default new AuthService();

