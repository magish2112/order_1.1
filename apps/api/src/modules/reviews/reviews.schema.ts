import { z } from 'zod';

export const createReviewSchema = z.object({
  authorName: z.string().min(1, 'Имя автора обязательно'),
  authorPhoto: z.string().optional(),
  content: z.string().min(1, 'Содержание обязательно'),
  rating: z.number().int().min(1).max(5).default(5),
  projectId: z.string().optional(),
  source: z.enum(['yandex', 'google', 'internal']).optional(),
  sourceUrl: z.string().url().optional(),
  isApproved: z.boolean().default(false),
});

export const updateReviewSchema = createReviewSchema.partial().extend({
  id: z.string(),
});

export const getReviewsQuerySchema = z.object({
  projectId: z.string().optional(),
  source: z.string().optional(),
  isApproved: z.coerce.boolean().optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type GetReviewsQuery = z.infer<typeof getReviewsQuerySchema>;

