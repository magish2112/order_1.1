import { FastifyRequest, FastifyReply } from 'fastify';
import reviewsService from './reviews.service';
import {
  createReviewSchema,
  updateReviewSchema,
  getReviewsQuerySchema,
} from './reviews.schema';

export class ReviewsController {
  async getReviews(
    request: FastifyRequest<{ Querystring: unknown }>,
    reply: FastifyReply
  ) {
    const query = getReviewsQuerySchema.parse(request.query);
    const result = await reviewsService.getReviews(query, true);

    return reply.status(200).send({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  }

  async getReviewById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const review = await reviewsService.getReviewById(id);

    if (!review) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Отзыв не найден',
      });
    }

    return reply.status(200).send({
      success: true,
      data: review,
    });
  }

  async createReview(
    request: FastifyRequest<{ Body: unknown }>,
    reply: FastifyReply
  ) {
    const validated = createReviewSchema.parse(request.body);
    const review = await reviewsService.createReview(validated);

    return reply.status(201).send({
      success: true,
      data: review,
    });
  }

  async updateReview(
    request: FastifyRequest<{ Params: { id: string }; Body: unknown }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const validated = updateReviewSchema.parse({ ...request.body, id });
    const review = await reviewsService.updateReview(validated);

    return reply.status(200).send({
      success: true,
      data: review,
    });
  }

  async deleteReview(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    await reviewsService.deleteReview(id);

    return reply.status(200).send({
      success: true,
      message: 'Отзыв удален',
    });
  }

  async approveReview(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;
    const review = await reviewsService.approveReview(id);

    return reply.status(200).send({
      success: true,
      data: review,
    });
  }
}

export default new ReviewsController();

