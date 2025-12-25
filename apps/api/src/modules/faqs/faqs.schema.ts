import { z } from 'zod';

export const createFaqSchema = z.object({
  question: z.string().min(1, 'Вопрос обязателен'),
  answer: z.string().min(1, 'Ответ обязателен'),
  category: z.string().optional(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateFaqSchema = createFaqSchema.partial().extend({
  id: z.string(),
});

export const getFaqsQuerySchema = z.object({
  category: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export type CreateFaqInput = z.infer<typeof createFaqSchema>;
export type UpdateFaqInput = z.infer<typeof updateFaqSchema>;
export type GetFaqsQuery = z.infer<typeof getFaqsQuerySchema>;

