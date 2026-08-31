'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-helpers';
import { revalidatePath } from 'next/cache';

// Añade una pregunta del banco al quiz con posición incremental y captura
// la versión vigente de la pregunta en ese momento (snapshot de versión).
export async function addQuestionToQuiz(quizId: string, questionId: string) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { course: { select: { id: true, instructorId: true } } },
  });
  if (!quiz) return { success: false as const, error: 'Cuestionario no encontrado' };
  if (quiz.course.instructorId !== user.id && user.role !== 'ADMIN') {
    return { success: false as const, error: 'No autorizado' };
  }

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: {
      category: { select: { courseId: true } },
      currentVersion: { select: { id: true, defaultScore: true } },
    },
  });
  if (!question) return { success: false as const, error: 'Pregunta no encontrada' };
  if (question.category.courseId !== quiz.courseId) {
    return { success: false as const, error: 'La pregunta no pertenece a este curso' };
  }

  const maxPos = await prisma.quizQuestion.aggregate({
    where: { quizId },
    _max: { position: true },
  });

  await prisma.quizQuestion.create({
    data: {
      quizId,
      questionId,
      questionVersionId: question.currentVersion?.id ?? null,
      position: (maxPos._max.position ?? -1) + 1,
      score: question.currentVersion?.defaultScore ?? 1,
    },
  });

  revalidatePath(`/dashboard/courses/${quiz.course.id}/quiz/${quizId}/edit`);
  return { success: true as const };
}

// Retira una pregunta del quiz.
export async function removeQuestionFromQuiz(quizId: string, quizQuestionId: string) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { course: { select: { id: true, instructorId: true } } },
  });
  if (!quiz) return { success: false as const, error: 'Cuestionario no encontrado' };
  if (quiz.course.instructorId !== user.id && user.role !== 'ADMIN') {
    return { success: false as const, error: 'No autorizado' };
  }

  await prisma.quizQuestion.deleteMany({
    where: { id: quizQuestionId, quizId },
  });

  revalidatePath(`/dashboard/courses/${quiz.course.id}/quiz/${quizId}/edit`);
  return { success: true as const };
}

// Reordenamiento masivo de preguntas en una transacción.
export async function reorderQuizQuestions(quizId: string, orderedIds: string[]) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { course: { select: { id: true, instructorId: true } } },
  });
  if (!quiz) return { success: false as const, error: 'Cuestionario no encontrado' };
  if (quiz.course.instructorId !== user.id && user.role !== 'ADMIN') {
    return { success: false as const, error: 'No autorizado' };
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.quizQuestion.updateMany({
        where: { id, quizId },
        data: { position: index },
      })
    )
  );

  revalidatePath(`/dashboard/courses/${quiz.course.id}/quiz/${quizId}/edit`);
  return { success: true as const };
}

// Modifica el puntaje ponderado de una pregunta en el quiz.
export async function updateQuestionScore(quizId: string, quizQuestionId: string, score: number) {
  const user = await requireRole(['ADMIN', 'TEACHER', 'MANAGER']);

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { course: { select: { id: true, instructorId: true } } },
  });
  if (!quiz) return { success: false as const, error: 'Cuestionario no encontrado' };
  if (quiz.course.instructorId !== user.id && user.role !== 'ADMIN') {
    return { success: false as const, error: 'No autorizado' };
  }

  if (!Number.isFinite(score) || score < 0) {
    return { success: false as const, error: 'Puntaje inválido' };
  }

  await prisma.quizQuestion.updateMany({
    where: { id: quizQuestionId, quizId },
    data: { score },
  });

  revalidatePath(`/dashboard/courses/${quiz.course.id}/quiz/${quizId}/edit`);
  return { success: true as const };
}
