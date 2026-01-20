import { z } from 'zod';

export const updateSettingSchema = z.object({
  key: z.string().min(1, 'Ключ обязателен'),
  value: z.string(),
  type: z.enum(['string', 'number', 'json', 'boolean']).default('string'),
  group: z.string().nullish(),
});

export const updateSettingsSchema = z.array(updateSettingSchema);

export const getSettingsQuerySchema = z.object({
  group: z.string().optional(),
});

export type UpdateSettingInput = z.infer<typeof updateSettingSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type GetSettingsQuery = z.infer<typeof getSettingsQuerySchema>;

