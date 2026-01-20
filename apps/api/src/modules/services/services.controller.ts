import { FastifyRequest, FastifyReply } from 'fastify';
import servicesService from './services.service';
import {
  createCategorySchema,
  updateCategorySchema,
  createServiceSchema,
  updateServiceSchema,
  getServicesQuerySchema,
} from './services.schema';

export class ServicesController {
  // ==================== КАТЕГОРИИ ====================

  async getCategoriesTree(
    request: FastifyRequest<{ Querystring: { isActive?: boolean } }>,
    reply: FastifyReply
  ) {
    const { isActive } = request.query;
    const categories = await servicesService.getCategoriesTree(isActive);

    return reply.status(200).send({
      success: true,
      data: categories,
    });
  }

  async getCategoryBySlug(
    request: FastifyRequest<{ Params: { slug: string } }>,
    reply: FastifyReply
  ) {
    const { slug } = request.params;
    const category = await servicesService.getCategoryBySlug(slug);

    if (!category) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Категория не найдена',
      });
    }

    return reply.status(200).send({
      success: true,
      data: category,
    });
  }

  async getCategoriesList(
    request: FastifyRequest<{ Querystring: { isActive?: boolean } }>,
    reply: FastifyReply
  ) {
    const { isActive } = request.query;
    const categories = await servicesService.getCategoriesList(isActive);

    return reply.status(200).send({
      success: true,
      data: categories,
    });
  }

  async getCategoryById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const category = await servicesService.getCategoryById(id);

    if (!category) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Категория не найдена',
      });
    }

    return reply.status(200).send({
      success: true,
      data: category,
    });
  }

  async createCategory(
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply
  ) {
    const validated = createCategorySchema.parse(request.body);
    const category = await servicesService.createCategory(validated);

    return reply.status(201).send({
      success: true,
      data: category,
    });
  }

  async updateCategory(
    request: FastifyRequest<{ Params: { id: string }; Body: unknown }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const validated = updateCategorySchema.parse({ ...request.body, id });
    const category = await servicesService.updateCategory(validated);

    return reply.status(200).send({
      success: true,
      data: category,
    });
  }

  async deleteCategory(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    await servicesService.deleteCategory(id);

    return reply.status(200).send({
      success: true,
      message: 'Категория удалена',
    });
  }

  // ==================== УСЛУГИ ====================

  async getServices(
    request: FastifyRequest<{ Querystring: unknown }>,
    reply: FastifyReply
  ) {
    const query = getServicesQuerySchema.parse(request.query);
    const result = await servicesService.getServices(query);

    return reply.status(200).send({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  }

  async getServiceBySlug(
    request: FastifyRequest<{ Params: { slug: string } }>,
    reply: FastifyReply
  ) {
    const { slug } = request.params;
    const service = await servicesService.getServiceBySlug(slug);

    if (!service) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Услуга не найдена',
      });
    }

    return reply.status(200).send({
      success: true,
      data: service,
    });
  }

  async getServiceById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const service = await servicesService.getServiceById(id);

    if (!service) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Услуга не найдена',
      });
    }

    return reply.status(200).send({
      success: true,
      data: service,
    });
  }

  async createService(
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply
  ) {
    const validated = createServiceSchema.parse(request.body);
    const service = await servicesService.createService(validated);

    return reply.status(201).send({
      success: true,
      data: service,
    });
  }

  async updateService(
    request: FastifyRequest<{ Params: { id: string }; Body: unknown }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const validated = updateServiceSchema.parse({ ...request.body, id });
    const service = await servicesService.updateService(validated);

    return reply.status(200).send({
      success: true,
      data: service,
    });
  }

  async deleteService(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    await servicesService.deleteService(id);

    return reply.status(200).send({
      success: true,
      message: 'Услуга удалена',
    });
  }
}

export default new ServicesController();

