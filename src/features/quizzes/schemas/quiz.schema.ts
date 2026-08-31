import { z } from 'zod';

// Métodos de calificación sobre intentos finalizados (mod/quiz)
export const gradeMethodSchema = z.enum(['highest', 'average', 'first', 'last']);

export const quizConfigSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(120),
  description: z.string().max(2000).optional(),
  // null = sin límite de tiempo
  timeLimitMin: z.number().int().min(1).max(600).nullable().optional(),
  // 0 = intentos ilimitados
  maxAttempts: z.number().int().min(0).max(99).default(1),
  gradeMethod: gradeMethodSchema.default('highest'),
  password: z.string().max(100).optional(),
  published: z.boolean().default(false),
  // ventana de disponibilidad
  openAt: z.string().datetime().optional(),
  closeAt: z.string().datetime().optional(),
});

export type QuizConfigInput = z.infer<typeof quizConfigSchema>;

// Validación de coherencia de fechas (no la impone Zod por defecto)
export function validateQuizWindow(input: QuizConfigInput): string | null {
  if (input.openAt && input.closeAt) {
    if (new Date(input.openAt) >= new Date(input.closeAt)) {
      return 'La fecha de cierre debe ser posterior a la de apertura';
    }
  }
  return null;
}
