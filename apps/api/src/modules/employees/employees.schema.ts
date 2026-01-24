import { z } from 'zod';

export const createEmployeeSchema = z.object({
  firstName: z.string().min(1, 'Имя обязательно'),
  lastName: z.string().min(1, 'Фамилия обязательна'),
  position: z.string().min(1, 'Должность обязательна'),
  department: z.string().nullish(),
  photo: z.string().nullish(),
  bio: z.string().nullish(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateEmployeeSchema = createEmployeeSchema.partial().extend({
  id: z.string(),
});

export const getEmployeesQuerySchema = z.object({
  department: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type GetEmployeesQuery = z.infer<typeof getEmployeesQuerySchema>;

