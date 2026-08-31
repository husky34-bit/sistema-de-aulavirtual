'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';
import { saveAnswerSchema } from '../schemas/attempt.schema';
import { isAttemptExpired } from '../services/attempt-engine';

// Autosave por pregunta: verifica propiedad, estado in_progress y que el
// temporizador no haya expirado. Las respuestas posteriores a la expiración
// se rechazan; el intento debe auto-finalizarse.
export async function saveAnswer(input: unknown) {
  const user = await requireAuth();

  const validated = saveAnswerSchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const { attemptId, quizQuestionId, response } = validated.data;

  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    select: {
      id: true,
      userId: true,
      state: true,
      startedAt: true,
      quiz: { select: { id: true, timeLimitMin: true, course: { select: { id: true } } } },
    },
  });
  if (!attempt) return { success: false as const, error: 'Intento no encontrado' };
  if (attempt.userId !== user.id) return { success: false as const, error: 'No autorizado' };
  if (attempt.state !== 'in_progress') {
    return { success: false as const, error: 'El intento ya no está en curso' };
  }

  // Prevención de expiración: rechazar respuestas tras el límite de tiempo
  if (
    isAttemptExpired({
      startedAt: attempt.startedAt,
      state: attempt.state,
      timeLimitMin: attempt.quiz.timeLimitMin,
    })
  ) {
    return { success: false as const, error: 'El tiempo del intento ha expirado' };
  }

  await prisma.quizAnswer.updateMany({
    where: { attemptId, quizQuestionId },
    data: { response: response as object },
  });

  return { success: true as const };
}
