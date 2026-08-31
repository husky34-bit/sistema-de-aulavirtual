'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

// Devuelve los datos completos de un intento finalizado para la pantalla
// de revisión (respuestas, calificaciones parciales/totales, estados).
export async function getAttemptReview(attemptId: string) {
  const user = await requireAuth();

  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: {
        select: {
          id: true,
          title: true,
          course: { select: { id: true } },
        },
      },
      answers: {
        orderBy: { quizQuestion: { position: 'asc' } },
        include: {
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
      },
    },
  });

  if (!attempt) return null;
  // Solo el dueño del intento o personal autorizado pueden revisar
  const isOwner = attempt.userId === user.id;
  const isStaff = user.role === 'ADMIN' || user.role === 'TEACHER' || user.role === 'MANAGER';
  if (!isOwner && !isStaff) return null;

  return attempt;
}
