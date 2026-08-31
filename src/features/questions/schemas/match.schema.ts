import { z } from 'zod';

export const matchSchema = z.object({
  type: z.literal('match'),
  shuffle: z.boolean().default(true),
  pairs: z.array(
    z.object({
      left: z.string().min(1),   // concepto
      right: z.string().min(1),  // pareja correcta
    })
  ).min(2, 'Mínimo 2 pares'),
  // distractores: opciones extra en la columna derecha que no emparejan con nada
  distractors: z.array(z.string()).default([]),
});
