import { FastifyRequest, FastifyReply } from 'fastify';
import authService from './auth.service';
import { loginSchema, refreshTokenSchema } from './auth.schema';

export class AuthController {
  async login(
    request: FastifyRequest<{ Body: { email: string; password: string } }>,
    reply: FastifyReply
  ) {
    const validated = loginSchema.parse(request.body);

    const result = await authService.login(validated);

    return reply.status(200).send({
      success: true,
      data: result,
    });
  }

  async refreshToken(
    request: FastifyRequest<{ Body: { refreshToken: string } }>,
    reply: FastifyReply
  ) {
    const validated = refreshTokenSchema.parse(request.body);

    const tokens = await authService.refreshAccessToken(validated.refreshToken);

    return reply.status(200).send({
      success: true,
      data: tokens,
    });
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    // Пользователь уже извлечен из токена в middleware
    return reply.status(200).send({
      success: true,
      data: request.user,
    });
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    // TODO: Добавить в blacklist refresh token
    return reply.status(200).send({
      success: true,
      message: 'Выход выполнен успешно',
    });
  }
}

export default new AuthController();

