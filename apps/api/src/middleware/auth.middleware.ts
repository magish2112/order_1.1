import { FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '@prisma/client';
import redis from '../config/redis';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
      role: UserRole;
    };
  }
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // ✅ Получить токен для проверки черного списка
    const token = request.headers.authorization?.split(' ')[1];

    // ✅ Проверить черный список
    if (token && redis) {
      const isBlacklisted = await redis.get(`blacklist:${token}`);
      if (isBlacklisted) {
        return reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Токен был инвалидирован',
        });
      }
    }

    // Стандартная верификация
    await request.jwtVerify();
    // После успешной верификации токена, данные пользователя доступны через request.user
    // fastify-jwt автоматически добавляет decoded данные в request.user
  } catch (err) {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Требуется аутентификация',
    });
  }
}

export function authorize(...roles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Требуется аутентификация',
      });
    }

    if (!roles.includes(request.user.role)) {
      return reply.status(403).send({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Недостаточно прав доступа',
      });
    }
  };
}

