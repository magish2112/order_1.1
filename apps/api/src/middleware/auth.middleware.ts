import { FastifyRequest, FastifyReply } from 'fastify';
import { UserRoleType } from '../constants/roles';
import redis from '../config/redis';

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

export function authorize(...roles: UserRoleType[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: string; email: string; role: string } | undefined;
    if (!user) {
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Требуется аутентификация',
      });
    }

    if (!roles.includes(user.role as UserRoleType)) {
      return reply.status(403).send({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Недостаточно прав доступа',
      });
    }
  };
}

