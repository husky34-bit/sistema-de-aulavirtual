'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

// Historial de intentos de un usuario en un quiz, ordenado por número.
export async function getAttemptHistory(quizId: string) {
  const user = await requireAuth();

  return prisma.quizAttempt.findMany({
    where: { quizId, userId: user.id },
    orderBy: { attemptNumber: 'asc' },
    select: {
      id: true,
      attemptNumber: true,
      state: true,
      startedAt: true,
      finishedAt: true,
      totalScore: true,
      maxScore: true,
      needsManualGrading: true,
    },
  });
}

// Intento activo en curso del usuario (si existe).
export async function getActiveAttempt(quizId: string) {
  const user = await requireAuth();

  return prisma.quizAttempt.findFirst({
    where: { quizId, userId: user.id, state: 'in_progress' },
    select: { id: true, attemptNumber: true, startedAt: true },
  });
}
