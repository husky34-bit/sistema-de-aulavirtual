'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';
import { quizConfigSchema, validateQuizWindow } from '../schemas/quiz.schema';
import { revalidatePath } from 'next/cache';

export async function updateQuiz(quizId: string, input: unknown) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { course: { select: { id: true, instructorId: true } } },
  });
  if (!quiz) return { success: false as const, error: 'Cuestionario no encontrado' };
  if (quiz.course.instructorId !== user.id && user.role !== 'ADMIN') {
    return { success: false as const, error: 'No autorizado' };
  }

  const validated = quizConfigSchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const windowError = validateQuizWindow(validated.data);
  if (windowError) {
    return { success: false as const, error: windowError };
  }

  const { title, description, timeLimitMin, maxAttempts, gradeMethod, password, published, openAt, closeAt } = validated.data;

  await prisma.$transaction(async (tx) => {
    await tx.quiz.update({
      where: { id: quizId },
      data: {
        title,
        description,
        timeLimitMin: timeLimitMin ?? null,
        maxAttempts,
        gradeMethod,
        password: password ?? null,
        published,
        openAt: openAt ? new Date(openAt) : null,
        closeAt: closeAt ? new Date(closeAt) : null,
      },
    });

    // Sincronizar el GradeItem vinculado en el gradebook (Fase 5).
    // upsert: crea el ítem si se publica por primera vez; lo actualiza si ya existe.
    await tx.gradeItem.upsert({
      where: { sourceType_sourceId: { sourceType: 'quiz', sourceId: quizId } },
      create: {
        courseId: quiz.course.id,
        name: title,
        maxScore: 100,
        weight: 1,
        sourceType: 'quiz',
        sourceId: quizId,
        position: 0,
      },
      update: {
        name: title,
      },
    });
  });

  revalidatePath(`/dashboard/courses/${quiz.course.id}/quiz/${quizId}`);
  return { success: true as const };
}
