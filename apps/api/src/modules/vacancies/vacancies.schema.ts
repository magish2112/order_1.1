import { z } from 'zod';

export const createVacancySchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  department: z.string().optional(),
  description: z.string().min(1, 'Описание обязательно'),
  requirements: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  conditions: z.array(z.string()).default([]),
  salaryFrom: z.number().positive().optional(),
  salaryTo: z.number().positive().optional(),
  experience: z.string().optional(),
  employment: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateVacancySchema = createVacancySchema.partial().extend({
  id: z.string(),
});

export const getVacanciesQuerySchema = z.object({
  department: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
});

export type CreateVacancyInput = z.infer<typeof createVacancySchema>;
export type UpdateVacancyInput = z.infer<typeof updateVacancySchema>;
export type GetVacanciesQuery = z.infer<typeof getVacanciesQuerySchema>;

