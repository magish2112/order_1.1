import { z } from 'zod';

export const createArticleSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1, 'Содержание обязательно'),
  coverImage: z.string().optional(),
  authorId: z.string().optional(),
  categoryId: z.string().optional(),
  tagNames: z.array(z.string()).default([]),
  isPublished: z.boolean().default(false),
  publishedAt: z.string().datetime().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
});

export const updateArticleSchema = createArticleSchema.partial().extend({
  id: z.string(),
});

export const getArticlesQuerySchema = z.object({
  categoryId: z.string().optional(),
  authorId: z.string().optional(),
  tag: z.string().optional(),
  isPublished: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'publishedAt', 'viewsCount']).default('publishedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
});

// ✅ Schemas для категорий статей
export const createArticleCategorySchema = z.object({
  name: z.string().min(3, 'Минимум 3 символа'),
  slug: z.string().min(3, 'Минимум 3 символа').optional(),
  description: z.string().optional(),
  order: z.number().int().default(0),
});

export const updateArticleCategorySchema = createArticleCategorySchema.partial().extend({
  id: z.string(),
});

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
export type GetArticlesQuery = z.infer<typeof getArticlesQuerySchema>;
export type CreateArticleCategoryInput = z.infer<typeof createArticleCategorySchema>;
export type UpdateArticleCategoryInput = z.infer<typeof updateArticleCategorySchema>;

