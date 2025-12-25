import { z } from 'zod';

export const calculateSchema = z.object({
  propertyType: z.enum(['apartment', 'house', 'office']),
  housingType: z.enum(['newBuilding', 'secondary']),
  rooms: z.number().int().positive(),
  area: z.number().positive(),
  repairType: z.enum(['cosmetic', 'capital', 'design', 'elite']),
  additionalServices: z.array(z.string()).default([]),
});

export const updateCalculatorConfigSchema = z.object({
  name: z.string().optional(),
  basePriceCosmetic: z.number().positive().optional(),
  basePriceCapital: z.number().positive().optional(),
  basePriceDesign: z.number().positive().optional(),
  basePriceElite: z.number().positive().optional(),
  coefficients: z.record(z.number()).optional(),
  isActive: z.boolean().optional(),
});

export type CalculateInput = z.infer<typeof calculateSchema>;
export type UpdateCalculatorConfigInput = z.infer<typeof updateCalculatorConfigSchema>;

