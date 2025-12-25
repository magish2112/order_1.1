import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  slug: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  area: z.number().positive().optional(),
  rooms: z.number().int().positive().optional(),
  duration: z.number().int().positive().optional(),
  price: z.number().positive().optional(),
  location: z.string().optional(),
  completedAt: z.string().datetime().optional(),
  style: z.string().optional(),
  propertyType: z.string().optional(),
  repairType: z.string().optional(),
  coverImage: z.string().optional(),
  beforeImages: z.array(z.string()).default([]),
  afterImages: z.array(z.string()).default([]),
  designImages: z.array(z.string()).default([]),
  videoUrl: z.string().url().optional(),
  clientName: z.string().optional(),
  clientReview: z.string().optional(),
  clientPhoto: z.string().optional(),
  categoryId: z.string().optional(),
  serviceIds: z.array(z.string()).default([]),
  tagNames: z.array(z.string()).default([]),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  id: z.string(),
});

export const getProjectsQuerySchema = z.object({
  categoryId: z.string().optional(),
  serviceId: z.string().optional(),
  propertyType: z.string().optional(),
  style: z.string().optional(),
  repairType: z.string().optional(),
  rooms: z.coerce.number().int().optional(),
  areaFrom: z.coerce.number().positive().optional(),
  areaTo: z.coerce.number().positive().optional(),
  isActive: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  tags: z.string().optional(), // comma-separated
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'completedAt', 'viewsCount', 'price']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type GetProjectsQuery = z.infer<typeof getProjectsQuerySchema>;

