import { FastifyRequest, FastifyReply } from 'fastify';
import faqsService from './faqs.service';
import {
  createFaqSchema,
  updateFaqSchema,
  getFaqsQuerySchema,
} from './faqs.schema';

export class FaqsController {
  async getFaqs(
    request: FastifyRequest<{ Querystring: unknown }>,
    reply: FastifyReply
  ) {
    const query = getFaqsQuerySchema.parse(request.query);
    const faqs = await faqsService.getFaqs(query, true);

    return reply.status(200).send({
      success: true,
      data: faqs,
    });
  }

  async getFaqById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const faq = await faqsService.getFaqById(id);

    if (!faq) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'FAQ не найден',
      });
    }

    return reply.status(200).send({
      success: true,
      data: faq,
    });
  }

  async createFaq(
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply
  ) {
    const validated = createFaqSchema.parse(request.body);
    const faq = await faqsService.createFaq(validated);

    return reply.status(201).send({
      success: true,
      data: faq,
    });
  }

  async updateFaq(
    request: FastifyRequest<{ Params: { id: string }; Body: unknown }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const validated = updateFaqSchema.parse({ ...request.body, id });
    const faq = await faqsService.updateFaq(validated);

    return reply.status(200).send({
      success: true,
      data: faq,
    });
  }

  async deleteFaq(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    await faqsService.deleteFaq(id);

    return reply.status(200).send({
      success: true,
      message: 'FAQ удален',
    });
  }
}

export default new FaqsController();

