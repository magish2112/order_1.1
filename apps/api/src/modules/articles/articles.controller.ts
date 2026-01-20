import { FastifyRequest, FastifyReply } from 'fastify';
import articlesService from './articles.service';
import {
  createArticleSchema,
  updateArticleSchema,
  getArticlesQuerySchema,
  createArticleCategorySchema,
  updateArticleCategorySchema,
} from './articles.schema';

export class ArticlesController {
  async getArticles(
    request: FastifyRequest<{ Querystring: unknown }>,
    reply: FastifyReply
  ) {
    const query = getArticlesQuerySchema.parse(request.query);
    const result = await articlesService.getArticles(query);

    return reply.status(200).send({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  }

  async getArticleCategories(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const categories = await articlesService.getArticleCategories();

    return reply.status(200).send({
      success: true,
      data: categories,
    });
  }

  async getArticleBySlug(
    request: FastifyRequest<{ Params: { slug: string } }>,
    reply: FastifyReply
  ) {
    const { slug } = request.params;
    const article = await articlesService.getArticleBySlug(slug, true);

    if (!article) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Статья не найдена',
      });
    }

    return reply.status(200).send({
      success: true,
      data: article,
    });
  }

  async createArticle(
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply
  ) {
    const validated = createArticleSchema.parse(request.body);
    const userId = request.user?.id;
    const article = await articlesService.createArticle(validated, userId);

    return reply.status(201).send({
      success: true,
      data: article,
    });
  }

  async updateArticle(
    request: FastifyRequest<{ Params: { id: string }; Body: unknown }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const validated = updateArticleSchema.parse({ ...request.body, id });
    const article = await articlesService.updateArticle(validated);

    return reply.status(200).send({
      success: true,
      data: article,
    });
  }

  async deleteArticle(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    await articlesService.deleteArticle(id);

    return reply.status(200).send({
      success: true,
      message: 'Статья удалена',
    });
  }

  async publishArticle(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const article = await articlesService.publishArticle(id);

    return reply.status(200).send({
      success: true,
      data: article,
    });
  }

  // ✅ НОВЫЕ МЕТОДЫ ДЛЯ КАТЕГОРИЙ

  async getArticleCategoryBySlug(
    request: FastifyRequest<{ Params: { slug: string } }>,
    reply: FastifyReply
  ) {
    const { slug } = request.params;
    const category = await articlesService.getArticleCategoryBySlug(slug);

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

  async createArticleCategory(
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply
  ) {
    const validated = createArticleCategorySchema.parse(request.body);
    const category = await articlesService.createArticleCategory(validated);

    return reply.status(201).send({
      success: true,
      data: category,
    });
  }

  async updateArticleCategory(
    request: FastifyRequest<{ Params: { id: string }; Body: unknown }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const validated = updateArticleCategorySchema.parse({ ...request.body, id });
    const category = await articlesService.updateArticleCategory(validated);

    return reply.status(200).send({
      success: true,
      data: category,
    });
  }

  async deleteArticleCategory(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    await articlesService.deleteArticleCategory(id);

    return reply.status(200).send({
      success: true,
      message: 'Категория удалена',
    });
  }
}

export default new ArticlesController();

