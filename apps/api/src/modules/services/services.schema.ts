import { z } from 'zod';

// Схемы для категорий услуг
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  slug: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  image: z.string().optional(),
  icon: z.string().optional(),
  parentId: z.string().optional(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.string(),
});

// Схемы для услуг
export const createServiceSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  slug: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  shortDescription: z.string().optional(),
  priceFrom: z.number().positive().optional(),
  priceTo: z.number().positive().optional(),
  priceUnit: z.string().optional(),
  image: z.string().optional(),
  gallery: z.array(z.string()).default([]),
  duration: z.string().optional(),
  features: z.record(z.any()).optional(),
  categoryId: z.string().min(1, 'Категория обязательна'),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
});

export const updateServiceSchema = createServiceSchema.partial().extend({
  id: z.string(),
});

// Схемы для запросов
export const getServicesQuerySchema = z.object({
  categoryId: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type GetServicesQuery = z.infer<typeof getServicesQuerySchema>;

