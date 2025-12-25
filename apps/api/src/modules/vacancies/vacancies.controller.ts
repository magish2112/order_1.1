import { FastifyRequest, FastifyReply } from 'fastify';
import vacanciesService from './vacancies.service';
import {
  createVacancySchema,
  updateVacancySchema,
  getVacanciesQuerySchema,
} from './vacancies.schema';

export class VacanciesController {
  async getVacancies(
    request: FastifyRequest<{ Querystring: unknown }>,
    reply: FastifyReply
  ) {
    const query = getVacanciesQuerySchema.parse(request.query);
    const result = await vacanciesService.getVacancies(query, true);

    return reply.status(200).send({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  }

  async getVacancyById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const vacancy = await vacanciesService.getVacancyById(id);

    if (!vacancy) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Вакансия не найдена',
      });
    }

    return reply.status(200).send({
      success: true,
      data: vacancy,
    });
  }

  async createVacancy(
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply
  ) {
    const validated = createVacancySchema.parse(request.body);
    const vacancy = await vacanciesService.createVacancy(validated);

    return reply.status(201).send({
      success: true,
      data: vacancy,
    });
  }

  async updateVacancy(
    request: FastifyRequest<{ Params: { id: string }; Body: unknown }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const validated = updateVacancySchema.parse({ ...request.body, id });
    const vacancy = await vacanciesService.updateVacancy(validated);

    return reply.status(200).send({
      success: true,
      data: vacancy,
    });
  }

  async deleteVacancy(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    await vacanciesService.deleteVacancy(id);

    return reply.status(200).send({
      success: true,
      message: 'Вакансия удалена',
    });
  }
}

export default new VacanciesController();

