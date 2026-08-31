'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';
import { overrideSchema } from '../schemas/override.schema';
import { revalidatePath } from 'next/cache';

// Crea o actualiza una excepción (override) de tiempo, intentos o fechas
// para un estudiante concreto en un quiz.
export async function saveOverride(input: unknown) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);

  const validated = overrideSchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const { quizId, userId, timeLimitMin, maxAttempts, openAt, closeAt } = validated.data;

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { course: { select: { id: true, instructorId: true } } },
  });
  if (!quiz) return { success: false as const, error: 'Cuestionario no encontrado' };
  if (quiz.course.instructorId !== user.id && user.role !== 'ADMIN') {
    return { success: false as const, error: 'No autorizado' };
  }

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) return { success: false as const, error: 'Estudiante no encontrado' };

  await prisma.quizOverride.upsert({
    where: { quizId_userId: { quizId, userId } },
    create: {
      quizId,
      userId,
      timeLimitMin: timeLimitMin ?? null,
      maxAttempts: maxAttempts ?? null,
      openAt: openAt ? new Date(openAt) : null,
      closeAt: closeAt ? new Date(closeAt) : null,
    },
    update: {
      timeLimitMin: timeLimitMin ?? null,
      maxAttempts: maxAttempts ?? null,
      openAt: openAt ? new Date(openAt) : null,
      closeAt: closeAt ? new Date(closeAt) : null,
    },
  });

  revalidatePath(`/dashboard/courses/${quiz.course.id}/quiz/${quizId}`);
  return { success: true as const };
}

// Elimina una excepción existente.
export async function deleteOverride(quizId: string, userId: string) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { course: { select: { id: true, instructorId: true } } },
  });
  if (!quiz) return { success: false as const, error: 'Cuestionario no encontrado' };
  if (quiz.course.instructorId !== user.id && user.role !== 'ADMIN') {
    return { success: false as const, error: 'No autorizado' };
  }

  await prisma.quizOverride.deleteMany({
    where: { quizId, userId },
  });

  revalidatePath(`/dashboard/courses/${quiz.course.id}/quiz/${quizId}`);
  return { success: true as const };
}

// Lista las excepciones configuradas para un quiz.
export async function getOverrides(quizId: string) {
  await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);

  return prisma.quizOverride.findMany({
    where: { quizId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
}
