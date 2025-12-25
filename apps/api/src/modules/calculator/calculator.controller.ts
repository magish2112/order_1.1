import { FastifyRequest, FastifyReply } from 'fastify';
import calculatorService from './calculator.service';
import {
  calculateSchema,
  updateCalculatorConfigSchema,
} from './calculator.schema';

export class CalculatorController {
  async getConfig(request: FastifyRequest, reply: FastifyReply) {
    const config = await calculatorService.getConfig();

    return reply.status(200).send({
      success: true,
      data: config,
    });
  }

  async updateConfig(
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply
  ) {
    const validated = updateCalculatorConfigSchema.parse(request.body);
    const config = await calculatorService.updateConfig(validated);

    return reply.status(200).send({
      success: true,
      data: config,
    });
  }

  async calculate(
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply
  ) {
    const validated = calculateSchema.parse(request.body);
    const result = await calculatorService.calculate(validated);

    return reply.status(200).send({
      success: true,
      data: result,
    });
  }
}

export default new CalculatorController();

