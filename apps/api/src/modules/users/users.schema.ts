import { z } from 'zod';
import { UserRole } from '../../constants/roles';

export const createUserSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .regex(/[A-Z]/, 'Пароль должен содержать хотя бы одну заглавную букву')
    .regex(/[a-z]/, 'Пароль должен содержать хотя бы одну строчную букву')
    .regex(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру'),
  firstName: z.string().min(1, 'Имя обязательно'),
  lastName: z.string().min(1, 'Фамилия обязательна'),
  role: z.enum([UserRole.MANAGER], {
    errorMap: () => ({ message: 'Можно создать только менеджера' }),
  }),
  isActive: z.boolean().default(true),
});

export const updateUserSchema = z.object({
  id: z.string(),
  email: z.string().email('Некорректный email').optional(),
  password: z.string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .regex(/[A-Z]/, 'Пароль должен содержать хотя бы одну заглавную букву')
    .regex(/[a-z]/, 'Пароль должен содержать хотя бы одну строчную букву')
    .regex(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру')
    .optional(),
  firstName: z.string().min(1, 'Имя обязательно').optional(),
  lastName: z.string().min(1, 'Фамилия обязательна').optional(),
  role: z.enum([UserRole.MANAGER]).optional(),
  isActive: z.boolean().optional(),
});

export const getUsersQuerySchema = z.object({
  role: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;
