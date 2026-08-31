'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';
import { quizConfigSchema, validateQuizWindow } from '../schemas/quiz.schema';
import { syncQuizEvents } from '@/features/calendar/services/event-generator';
import { revalidatePath } from 'next/cache';

export async function createQuiz(courseId: string, input: unknown) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, instructorId: true },
  });
  if (!course) return { success: false as const, error: 'Curso no encontrado' };
  if (course.instructorId !== user.id && user.role !== 'ADMIN') {
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

  const quiz = await prisma.$transaction(async (tx) => {
    const q = await tx.quiz.create({
      data: {
        courseId,
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

    // Crear el GradeItem vinculado en el gradebook (Fase 5).
    await tx.gradeItem.create({
      data: {
        courseId,
        name: title,
        maxScore: 100,
        weight: 1,
        sourceType: 'quiz',
        sourceId: q.id,
        position: 0,
      },
    });

    return q;
  });

  // Generar eventos de calendario automáticos (Fase 6B)
  try {
    await syncQuizEvents(quiz.id, courseId, title, openAt ? new Date(openAt) : null, closeAt ? new Date(closeAt) : null);
  } catch {
    // El calendario no debe romper la creación del quiz.
  }

  revalidatePath(`/dashboard/courses/${courseId}`);
  return { success: true as const, quizId: quiz.id };
}
