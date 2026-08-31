'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';
import { finishAttemptSchema } from '../schemas/attempt.schema';
import { isAttemptExpired } from '../services/attempt-engine';
import { gradeQuestion } from '@/features/questions/services/question-engine';
import type { QuestionData } from '@/features/questions/schemas/question.schema';
import type { QuestionResponse, GradeResult } from '@/features/questions/types/question.types';
import { syncGradeToGradebook } from '@/features/grades/services/grade-sync';
import { computeFinalGrade, normalizeAttemptGrade } from '@/features/quizzes/services/grading-engine';
import { markComplete } from '@/features/completion/services/completion-engine';
import { revalidatePath } from 'next/cache';

// Califica todas las respuestas usando el motor de la Fase 3 (gradeQuestion),
// computa totalScore, detecta needsManualGrading y cierra el intento en una
// sola transacción atómica.
export async function finishAttempt(input: unknown) {
  const user = await requireAuth();

  const validated = finishAttemptSchema.safeParse(input);
  if (!validated.success) {
    return { success: false as const, errors: validated.error.flatten().fieldErrors };
  }

  const { attemptId } = validated.data;

  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: { select: { id: true, timeLimitMin: true, gradeMethod: true, course: { select: { id: true } } } },
      answers: {
        include: {
          quizQuestion: {
            select: { id: true, score: true, questionVersionId: true },
          },
        },
      },
    },
  });
  if (!attempt) return { success: false as const, error: 'Intento no encontrado' };
  if (attempt.userId !== user.id) return { success: false as const, error: 'No autorizado' };
  if (attempt.state !== 'in_progress') {
    return { success: false as const, error: 'El intento ya está finalizado' };
  }

  const datasetSnapshots = (attempt.datasetSnapshots ?? {}) as Record<string, Record<string, number>>;
  const versionSnapshots = (attempt.versionSnapshots ?? {}) as Record<string, string>;

  // Cargar las versiones snapshoteadas de cada pregunta en una sola consulta
  const versionIds = Object.values(versionSnapshots);
  const versions = versionIds.length
    ? await prisma.questionVersion.findMany({
        where: { id: { in: versionIds } },
        select: { id: true, type: true, data: true },
      })
    : [];
  const versionById = new Map(versions.map((v) => [v.id, v]));

  let totalScore = 0;
  let needsManualGrading = false;

  // Pre-calcular todos los resultados para escribirlos en la transacción
  const graded: { answerId: string; gradeResult: GradeResult; score: number }[] = [];

  for (const answer of attempt.answers) {
    const versionId = versionSnapshots[answer.quizQuestionId] ?? answer.quizQuestion.questionVersionId;
    const version = versionId ? versionById.get(versionId) : undefined;
    const data = (version?.data ?? null) as QuestionData | null;

    const response = (answer.response ?? null) as QuestionResponse | null;
    const questionScore = answer.quizQuestion.score;

    if (!data || !response) {
      // Sin respuesta: puntaje 0
      const gr: GradeResult = {
        fraction: 0,
        score: 0,
        correct: false,
        needsManualGrading: false,
      };
      graded.push({ answerId: answer.id, gradeResult: gr, score: 0 });
      continue;
    }

    const ctx = { datasetValues: datasetSnapshots[answer.quizQuestionId] ?? {} };
    const gr = gradeQuestion(data, response, questionScore, ctx);
    graded.push({ answerId: answer.id, gradeResult: gr, score: gr.score });

    totalScore += gr.score;
    if (gr.needsManualGrading) needsManualGrading = true;
  }

  const now = new Date();
  const expired = isAttemptExpired({
    startedAt: attempt.startedAt,
    state: attempt.state,
    timeLimitMin: attempt.quiz.timeLimitMin,
    now,
  });

  await prisma.$transaction(async (tx) => {
    // Actualizar cada respuesta con su resultado de calificación
    for (const g of graded) {
      await tx.quizAnswer.update({
        where: { id: g.answerId },
        data: {
          gradeResult: g.gradeResult as object,
          score: g.score,
          needsManualGrading: g.gradeResult.needsManualGrading,
        },
      });
    }

    await tx.quizAttempt.update({
      where: { id: attemptId },
      data: {
        state: 'finished',
        finishedAt: now,
        totalScore,
        needsManualGrading,
      },
    });
  });

  // Sincronizar la nota final del quiz al Gradebook (Fase 5).
  // Se calcula sobre TODOS los intentos finalizados según gradeMethod.
  try {
    const allFinished = await prisma.quizAttempt.findMany({
      where: { quizId: attempt.quiz.id, userId: user.id, state: 'finished' },
      select: { attemptNumber: true, totalScore: true, maxScore: true, finishedAt: true },
      orderBy: { attemptNumber: 'asc' },
    });

    const attemptGrades = allFinished
      .map((a) => ({
        attemptNumber: a.attemptNumber,
        grade: normalizeAttemptGrade(a.totalScore, a.maxScore) ?? 0,
        finishedAt: a.finishedAt ?? now,
      }));

    const finalGrade = computeFinalGrade(attempt.quiz.gradeMethod, attemptGrades);
    const fraction =
      finalGrade.finalGrade === null ? null : finalGrade.finalGrade / 100;

    await syncGradeToGradebook({
      courseId: attempt.quiz.course.id,
      sourceType: 'quiz',
      sourceId: attempt.quiz.id,
      userId: user.id,
      score: fraction,
    });
  } catch {
    // La sincronización al gradebook no debe romper el finishAttempt.
  }

  // Marcar el quiz como completado (Fase 6C)
  try {
    await markComplete({
      userId: user.id,
      activityType: 'quiz',
      activityId: attempt.quiz.id,
      courseId: attempt.quiz.course.id,
    });
    // Verificar y otorgar insignias automáticas de completitud (Fase 6C)
    const { checkAndAwardCompletionBadges } = await import('@/features/badges/actions/badge-actions');
    await checkAndAwardCompletionBadges(user.id, attempt.quiz.course.id);
  } catch {
    // La finalización no debe romper el finishAttempt.
  }

  revalidatePath(`/dashboard/courses/${attempt.quiz.course.id}/quiz/${attempt.quiz.id}`);
  void expired;
  return { success: true as const, attemptId, expired };
}
