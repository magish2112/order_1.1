import { z } from 'zod';

export const createEmployeeSchema = z.object({
  firstName: z.string().min(1, 'Имя обязательно'),
  lastName: z.string().min(1, 'Фамилия обязательна'),
  position: z.string().min(1, 'Должность обязательна'),
  department: z.string().optional(),
  photo: z.string().optional(),
  bio: z.string().optional(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateEmployeeSchema = createEmployeeSchema.partial().extend({
  id: z.string(),
});

export const getEmployeesQuerySchema = z.object({
  department: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type GetEmployeesQuery = z.infer<typeof getEmployeesQuerySchema>;

