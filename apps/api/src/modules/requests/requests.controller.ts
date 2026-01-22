import { FastifyRequest, FastifyReply } from 'fastify';
import requestsService from './requests.service';
import {
  createRequestSchema,
  updateRequestStatusSchema,
  assignRequestSchema,
  getRequestsQuerySchema,
} from './requests.schema';

export class RequestsController {
  async createRequest(
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply
  ) {
    const validated = createRequestSchema.parse(request.body);
    const requestData = await requestsService.createRequest(validated);

    return reply.status(201).send({
      success: true,
      data: requestData,
    });
  }

  async createCallbackRequest(
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply
  ) {
    const validated = createRequestSchema.parse(request.body);
    // Устанавливаем source='callback' для заказа звонка
    const requestData = await requestsService.createRequest(validated, 'callback');

    return reply.status(201).send({
      success: true,
      data: requestData,
    });
  }

  async getRequests(
    request: FastifyRequest<{ Querystring: unknown }>,
    reply: FastifyReply
  ) {
    const query = getRequestsQuerySchema.parse(request.query);
    const result = await requestsService.getRequests(query);

    return reply.status(200).send({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  }

  async getRequestById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const requestData = await requestsService.getRequestById(id);

    if (!requestData) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Заявка не найдена',
      });
    }

    return reply.status(200).send({
      success: true,
      data: requestData,
    });
  }

  async updateRequestStatus(
    request: FastifyRequest<{ Params: { id: string }; Body: unknown }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const validated = updateRequestStatusSchema.parse(request.body);
    const userId = (request.user as { id: string } | undefined)?.id;
    const requestData = await requestsService.updateRequestStatus(id, validated, userId);

    return reply.status(200).send({
      success: true,
      data: requestData,
    });
  }

  async assignRequest(
    request: FastifyRequest<{ Params: { id: string }; Body: unknown }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const validated = assignRequestSchema.parse(request.body);
    const requestData = await requestsService.assignRequest(id, validated);

    return reply.status(200).send({
      success: true,
      data: requestData,
    });
  }

  async getRequestsStats(
    request: FastifyRequest<{ Querystring: { dateFrom?: string; dateTo?: string } }>,
    reply: FastifyReply
  ) {
    const { dateFrom, dateTo } = request.query;
    const stats = await requestsService.getRequestsStats(
      dateFrom ? new Date(dateFrom) : undefined,
      dateTo ? new Date(dateTo) : undefined
    );

    return reply.status(200).send({
      success: true,
      data: stats,
    });
  }
}

export default new RequestsController();
