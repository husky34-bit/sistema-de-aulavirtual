import { z } from 'zod';

// Identificadores usados durante el autosave y finalización del intento
export const saveAnswerSchema = z.object({
  attemptId: z.string().min(1),
  quizQuestionId: z.string().min(1),
  // respuesta serializada según QuestionResponse; cualquier objeto válido
  response: z.record(z.string(), z.unknown()),
});

export const finishAttemptSchema = z.object({
  attemptId: z.string().min(1),
});

export type SaveAnswerInput = z.infer<typeof saveAnswerSchema>;
