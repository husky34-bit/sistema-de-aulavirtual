'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

// Carga el intento activo con sus preguntas y respuestas precargadas,
// para alimentar AttemptClient. Solo el dueño o personal autorizado.
export async function getActiveAttemptData(attemptId: string) {
  const user = await requireAuth();

  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    select: {
      id: true,
      userId: true,
      state: true,
      startedAt: true,
      datasetSnapshots: true,
      quiz: { select: { id: true, timeLimitMin: true, course: { select: { id: true } } } },
      answers: {
        select: {
          quizQuestionId: true,
          response: true,
          quizQuestion: {
            select: {
              id: true,
              position: true,
              score: true,
              questionVersion: {
                select: { id: true, type: true, text: true, data: true },
              },
            },
          },
        },
        orderBy: { quizQuestion: { position: 'asc' } },
      },
    },
  });

  if (!attempt) return null;
  const isOwner = attempt.userId === user.id;
  const isStaff = user.role === 'ADMIN' || user.role === 'TEACHER' || user.role === 'MANAGER';
  if (!isOwner && !isStaff) return null;

  return attempt;
}
