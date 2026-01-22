import { FastifyRequest, FastifyReply } from 'fastify';
import statsService from './stats.service';
import requestsService from '../requests/requests.service';

export class StatsController {
  async getHomepageStats(request: FastifyRequest, reply: FastifyReply) {
    const stats = await statsService.getHomepageStats();

    return reply.status(200).send({
      success: true,
      data: stats,
    });
  }

  async getDashboardStats(request: FastifyRequest, reply: FastifyReply) {
    const stats = await statsService.getDashboardStats();

    return reply.status(200).send({
      success: true,
      data: stats,
    });
  }

  async getViewsStats(request: FastifyRequest, reply: FastifyReply) {
    const stats = await statsService.getViewsStats();

    return reply.status(200).send({
      success: true,
      data: stats,
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

export default new StatsController();

