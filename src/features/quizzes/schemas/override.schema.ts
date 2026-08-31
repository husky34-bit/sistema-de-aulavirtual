import { z } from 'zod';

// Excepciones de tiempo, intentos o fechas por estudiante
export const overrideSchema = z.object({
  quizId: z.string().min(1),
  userId: z.string().min(1),
  timeLimitMin: z.number().int().min(1).max(600).nullable().optional(),
  maxAttempts: z.number().int().min(0).max(99).nullable().optional(),
  openAt: z.string().datetime().nullable().optional(),
  closeAt: z.string().datetime().nullable().optional(),
});

export type OverrideInput = z.infer<typeof overrideSchema>;
