import { FastifyRequest, FastifyReply } from 'fastify';
import usersService from './users.service';
import {
  createUserSchema,
  updateUserSchema,
  getUsersQuerySchema,
} from './users.schema';

export class UsersController {
  async getUsers(
    request: FastifyRequest<{ Querystring: unknown }>,
    reply: FastifyReply
  ) {
    const query = getUsersQuerySchema.parse(request.query);
    const result = await usersService.getUsers(query);

    return reply.status(200).send({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  }

  async getUserById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const user = await usersService.getUserById(id);

    if (!user) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Пользователь не найден',
      });
    }

    return reply.status(200).send({
      success: true,
      data: user,
    });
  }

  async createUser(
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply
  ) {
    const validated = createUserSchema.parse(request.body);
    const user = await usersService.createUser(validated);

    return reply.status(201).send({
      success: true,
      data: user,
      message: 'Пользователь успешно создан',
    });
  }

  async updateUser(
    request: FastifyRequest<{ Params: { id: string }; Body: unknown }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const body = request.body as Record<string, unknown>;
    const validated = updateUserSchema.parse({ ...body, id });
    const user = await usersService.updateUser(validated);

    return reply.status(200).send({
      success: true,
      data: user,
      message: 'Пользователь успешно обновлен',
    });
  }

  async deleteUser(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const currentUserId = (request.user as { id: string } | undefined)?.id;

    // Нельзя удалить себя
    if (id === currentUserId) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Нельзя удалить самого себя',
      });
    }

    await usersService.deleteUser(id);

    return reply.status(200).send({
      success: true,
      message: 'Пользователь удален',
    });
  }
}

export default new UsersController();
