import { z } from 'zod';

export const multichoiceOptionSchema = z.object({
  text: z.string().min(1),
  // fracción del puntaje: 1 = correcta, 0 = incorrecta, 0.5 = parcial
  fraction: z.number().min(0).max(1),
  feedback: z.string().optional(),
});

export const multichoiceSchema = z.object({
  type: z.literal('multichoice'),
  single: z.boolean().default(true), // una sola correcta o varias
  shuffle: z.boolean().default(true),
  options: z.array(multichoiceOptionSchema).min(2, 'Mínimo 2 opciones'),
});
