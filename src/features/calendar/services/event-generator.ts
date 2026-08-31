// Generador de eventos de calendario automáticos.
// Al crear/editar un quiz o tarea con fechas, crea/actualiza CalendarEvents.

import { prisma } from '@/lib/prisma';

/**
 * Sincroniza eventos de calendario para un quiz.
 * Crea eventos quiz_open (si openAt) y quiz_close (si closeAt).
 */
export async function syncQuizEvents(quizId: string, courseId: string, title: string, openAt: Date | null, closeAt: Date | null): Promise<void> {
  // Eliminar eventos existentes para este quiz
  await prisma.calendarEvent.deleteMany({
    where: { refId: quizId, type: { in: ['quiz_open', 'quiz_close'] } },
  });

  if (openAt) {
    await prisma.calendarEvent.create({
      data: {
        courseId,
        title: `Quiz: ${title} (apertura)`,
        startsAt: openAt,
        type: 'quiz_open',
        refId: quizId,
      },
    });
  }

  if (closeAt) {
    await prisma.calendarEvent.create({
      data: {
        courseId,
        title: `Quiz: ${title} (cierre)`,
        startsAt: closeAt,
        type: 'quiz_close',
        refId: quizId,
      },
    });
  }
}

/**
 * Sincroniza eventos de calendario para una tarea.
 * Crea evento assign_due (si dueAt).
 */
export async function syncAssignmentEvents(assignmentId: string, courseId: string, title: string, dueAt: Date | null): Promise<void> {
  await prisma.calendarEvent.deleteMany({
    where: { refId: assignmentId, type: 'assign_due' },
  });

  if (dueAt) {
    await prisma.calendarEvent.create({
      data: {
        courseId,
        title: `Tarea: ${title} (vence)`,
        startsAt: dueAt,
        type: 'assign_due',
        refId: assignmentId,
      },
    });
  }
}
