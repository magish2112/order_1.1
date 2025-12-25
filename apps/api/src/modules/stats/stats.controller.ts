import { FastifyRequest, FastifyReply } from 'fastify';
import statsService from './stats.service';

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
}

export default new StatsController();

