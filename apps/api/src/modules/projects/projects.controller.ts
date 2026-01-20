import { FastifyRequest, FastifyReply } from 'fastify';
import projectsService from './projects.service';
import {
  createProjectSchema,
  updateProjectSchema,
  getProjectsQuerySchema,
} from './projects.schema';

export class ProjectsController {
  async getProjects(
    request: FastifyRequest<{ Querystring: unknown }>,
    reply: FastifyReply
  ) {
    const query = getProjectsQuerySchema.parse(request.query);
    const result = await projectsService.getProjects(query);

    return reply.status(200).send({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  }

  async getFeaturedProjects(
    request: FastifyRequest<{ Querystring: { limit?: number } }>,
    reply: FastifyReply
  ) {
    const limit = request.query.limit || 10;
    const projects = await projectsService.getFeaturedProjects(limit);

    return reply.status(200).send({
      success: true,
      data: projects,
    });
  }

  async getProjectBySlug(
    request: FastifyRequest<{ Params: { slug: string } }>,
    reply: FastifyReply
  ) {
    const { slug } = request.params;
    const project = await projectsService.getProjectBySlug(slug, true); // Увеличиваем просмотры

    if (!project) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Проект не найден',
      });
    }

    return reply.status(200).send({
      success: true,
      data: project,
    });
  }

  async getProjectById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const project = await projectsService.getProjectById(id);

    if (!project) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Проект не найден',
      });
    }

    return reply.status(200).send({
      success: true,
      data: project,
    });
  }

  async createProject(
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply
  ) {
    const validated = createProjectSchema.parse(request.body);
    const userId = request.user?.id;
    const project = await projectsService.createProject(validated, userId);

    return reply.status(201).send({
      success: true,
      data: project,
    });
  }

  async updateProject(
    request: FastifyRequest<{ Params: { id: string }; Body: unknown }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const validated = updateProjectSchema.parse({ ...request.body, id });
    const project = await projectsService.updateProject(validated);

    return reply.status(200).send({
      success: true,
      data: project,
    });
  }

  async deleteProject(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    await projectsService.deleteProject(id);

    return reply.status(200).send({
      success: true,
      message: 'Проект удален',
    });
  }
}

export default new ProjectsController();

