import { z } from 'zod';

export const calculatedSchema = z.object({
  type: z.literal('calculated'),
  formula: z.string().min(1, 'Fórmula requerida'), // ej: "{a} + {b} * 2"
  tolerance: z.number().min(0).default(0.01),
  variables: z.array(
    z.object({
      name: z.string().regex(/^[a-z]$/, 'Variables de una letra minúscula'),
      min: z.number(),
      max: z.number(),
      decimals: z.number().int().min(0).max(6).default(2),
    })
  ).min(1, 'Define al menos una variable'),
});
