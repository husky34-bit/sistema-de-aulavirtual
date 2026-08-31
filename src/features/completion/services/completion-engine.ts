// Motor de finalización de actividades. Marca una actividad como
// completada para un usuario mediante upsert.

import { prisma } from '@/lib/prisma';

export type ActivityType =
  | 'quiz'
  | 'assign'
  | 'resource'
  | 'page'
  | 'book'
  | 'forum'
  | 'url';

export interface MarkCompleteInput {
  userId: string;
  activityType: ActivityType;
  activityId: string;
  courseId: string;
}

/**
 * Marca una actividad como completada (upsert).
 * Si ya existe el registro, actualiza completedAt si era null.
 */
export async function markComplete(input: MarkCompleteInput): Promise<void> {
  const now = new Date();
  await prisma.activityCompletion.upsert({
    where: {
      userId_activityType_activityId: {
        userId: input.userId,
        activityType: input.activityType,
        activityId: input.activityId,
      },
    },
    create: {
      userId: input.userId,
      activityType: input.activityType,
      activityId: input.activityId,
      courseId: input.courseId,
      completedAt: now,
    },
    update: {
      completedAt: now,
    },
  });
}

/**
 * Verifica si una actividad está completada por el usuario.
 */
export async function isCompleted(
  userId: string,
  activityType: ActivityType,
  activityId: string,
): Promise<boolean> {
  const record = await prisma.activityCompletion.findUnique({
    where: {
      userId_activityType_activityId: { userId, activityType, activityId },
    },
    select: { completedAt: true },
  });
  return record?.completedAt !== null && record?.completedAt !== undefined;
}

/**
 * Cuenta cuántas actividades de un curso ha completado el usuario.
 */
export async function countCompleted(
  userId: string,
  courseId: string,
): Promise<{ completed: number; total: number }> {
  const [completed, quizzes, assignments, resources, pages, books, urls] =
    await Promise.all([
      prisma.activityCompletion.count({
        where: { userId, courseId, completedAt: { not: null } },
      }),
      prisma.quiz.count({ where: { courseId, published: true } }),
      prisma.assignment.count({ where: { courseId, published: true } }),
      prisma.resource.count({ where: { courseId, published: true } }),
      prisma.contentPage.count({ where: { courseId, published: true } }),
      prisma.book.count({ where: { courseId, published: true } }),
      prisma.urlResource.count({ where: { courseId, published: true } }),
    ]);
  const total = quizzes + assignments + resources + pages + books + urls;
  return { completed, total };
}
