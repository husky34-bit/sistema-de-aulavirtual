import { notFound, redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth-helpers';
import { getActiveAttemptData } from '@/features/quizzes/actions/get-active-attempt-data';
import { AttemptClient } from '@/features/quizzes/components/attempt-client';
import type { QuestionResponse } from '@/features/questions/types/question.types';

export default async function AttemptPage({
  params,
}: {
  params: Promise<{ id: string; quizId: string; attemptId: string }>;
}) {
  const user = await requireAuth();
  const { id: courseId, quizId, attemptId } = await params;

  const attempt = await getActiveAttemptData(attemptId);
  if (!attempt || attempt.quiz.id !== quizId || attempt.quiz.course.id !== courseId) {
    notFound();
  }

  // Solo el dueño puede ejecutar el intento
  if (attempt.userId !== user.id) {
    redirect(`/dashboard/courses/${courseId}/quiz/${quizId}`);
  }

  // Si ya está finalizado, ir a revisión
  if (attempt.state !== 'in_progress') {
    redirect(`/dashboard/courses/${courseId}/quiz/${quizId}/review/${attemptId}`);
  }

  // Mapear respuestas precargadas (autosave previo)
  const initialResponses: Record<string, QuestionResponse | null> = {};
  for (const a of attempt.answers) {
    initialResponses[a.quizQuestionId] = (a.response as QuestionResponse | null) ?? null;
  }

  const datasetSnapshots =
    (attempt.datasetSnapshots as Record<string, Record<string, number>> | null) ?? null;

  return (
    <div className="mx-auto max-w-3xl">
      <AttemptClient
        attemptId={attempt.id}
        quizId={quizId}
        courseId={courseId}
        timeLimitMin={attempt.quiz.timeLimitMin}
        startedAt={attempt.startedAt.toISOString()}
        datasetSnapshots={datasetSnapshots}
        questions={attempt.answers.map((a) => ({
          quizQuestionId: a.quizQuestionId,
          questionVersion: a.quizQuestion.questionVersion
            ? {
                id: a.quizQuestion.questionVersion.id,
                type: a.quizQuestion.questionVersion.type,
                text: a.quizQuestion.questionVersion.text,
                data: a.quizQuestion.questionVersion.data,
              }
            : null,
          score: a.quizQuestion.score,
        }))}
        initialResponses={initialResponses}
      />
    </div>
  );
}
