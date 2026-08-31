import { z } from 'zod';

export const numericalSchema = z.object({
  type: z.literal('numerical'),
  answer: z.number(),
  // tolerancia: |respuesta - correcta| <= tolerance → correcta
  tolerance: z.number().min(0).default(0),
  unit: z.string().optional(), // ej: "kg", "m/s" (informativo por ahora)
});
