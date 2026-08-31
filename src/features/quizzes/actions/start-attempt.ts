'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';
import {
  resolveEffectiveConfig,
  canStartAttempt,
} from '../services/attempt-engine';
import { generateDatasetValues } from '@/features/questions/services/calculated-datasets';
import type { QuestionData } from '@/features/questions/schemas/question.schema';
import { revalidatePath } from 'next/cache';

type CalculatedData = Extract<QuestionData, { type: 'calculated' }>;

// Inicia un intento: calcula número de intento, genera snapshot de datasets
// calculados por pregunta, crea QuizAttempt y pre-inserta QuizAnswer vacías.
export async function startAttempt(quizId: string) {
  const user = await requireAuth();

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      course: { select: { id: true } },
      questions: {
        orderBy: { position: 'asc' },
        include: {
          questionVersion: { select: { id: true, type: true, data: true } },
        },
      },
      overrides: { where: { userId: user.id } },
      attempts: {
        where: { userId: user.id },
        select: { state: true, attemptNumber: true },
      },
    },
  });
  if (!quiz) return { success: false as const, error: 'Cuestionario no encontrado' };

  // Verificar inscripción o rol docente/admin
  const isStaff = user.role === 'ADMIN' || user.role === 'TEACHER' || user.role === 'MANAGER';
  if (!isStaff) {
    const enrolled = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: quiz.course.id } },
    });
    if (!enrolled) return { success: false as const, error: 'No estás inscrito en este curso' };
  }

  const override = quiz.overrides[0] ?? null;
  const config = resolveEffectiveConfig(quiz, override);

  const finishedAttempts = quiz.attempts.filter((a) => a.state === 'finished').length;
  const hasActive = quiz.attempts.some((a) => a.state === 'in_progress');

  const startCheck = canStartAttempt({
    published: quiz.published,
    config,
    now: new Date(),
    finishedAttempts,
    hasActiveAttempt: hasActive,
  });
  if (!startCheck.ok) {
    return { success: false as const, error: startCheck.reason };
  }

  if (quiz.questions.length === 0) {
    return { success: false as const, error: 'El cuestionario no tiene preguntas' };
  }

  const nextAttemptNumber = (quiz.attempts.reduce((max, a) => Math.max(max, a.attemptNumber), 0)) + 1;

  // Snapshots inmutables por pregunta
  const datasetSnapshots: Record<string, Record<string, number>> = {};
  const versionSnapshots: Record<string, string> = {};

  for (const qq of quiz.questions) {
    const versionId = qq.questionVersion?.id ?? qq.questionVersionId;
    if (versionId) versionSnapshots[qq.id] = versionId;

    const data = qq.questionVersion?.data as QuestionData | null;
    if (data?.type === 'calculated') {
      const calc = data as CalculatedData;
      const ctx = generateDatasetValues(calc.variables);
      datasetSnapshots[qq.id] = ctx.datasetValues ?? {};
    }
  }

  const maxScore = quiz.questions.reduce((sum, q) => sum + q.score, 0);

  const attempt = await prisma.$transaction(async (tx) => {
    const a = await tx.quizAttempt.create({
      data: {
        quizId,
        userId: user.id,
        attemptNumber: nextAttemptNumber,
        state: 'in_progress',
        maxScore,
        datasetSnapshots,
        versionSnapshots,
      },
    });

    // Pre-crear respuestas vacías para que el autosave sea UPDATE
    await tx.quizAnswer.createMany({
      data: quiz.questions.map((qq) => ({
        attemptId: a.id,
        quizQuestionId: qq.id,
      })),
    });

    return a;
  });

  revalidatePath(`/dashboard/courses/${quiz.course.id}/quiz/${quizId}`);
  return { success: true as const, attemptId: attempt.id };
}
