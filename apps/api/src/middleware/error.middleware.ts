import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import env from '../config/env';

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Логирование ошибки
  request.log.error(error);

  // Ошибки валидации Zod
  if (error.validation || error instanceof ZodError) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Validation Error',
      message: 'Ошибка валидации данных',
      details: (error as { validation?: unknown }).validation ?? (error instanceof ZodError ? error.errors : undefined),
    });
  }

  // Ошибки Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return reply.status(409).send({
          statusCode: 409,
          error: 'Conflict',
          message: 'Запись с такими данными уже существует',
        });
      case 'P2025':
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Запись не найдена',
        });
      default:
        return reply.status(500).send({
          statusCode: 500,
          error: 'Database Error',
          message: 'Ошибка базы данных',
        });
    }
  }

  // JWT ошибки
  if (error.statusCode === 401) {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: error.message || 'Требуется аутентификация',
    });
  }

  // 404 ошибки
  if (error.statusCode === 404) {
    return reply.status(404).send({
      statusCode: 404,
      error: 'Not Found',
      message: error.message || 'Ресурс не найден',
    });
  }

  // Остальные ошибки
  const statusCode = error.statusCode || 500;
  const message =
    env.NODE_ENV === 'production'
      ? 'Внутренняя ошибка сервера'
      : error.message;

  return reply.status(statusCode).send({
    statusCode,
    error: error.name || 'Internal Server Error',
    message,
    ...(env.NODE_ENV === 'development' && { stack: error.stack }),
  });
}

