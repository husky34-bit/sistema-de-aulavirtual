import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/auth-helpers';
import { getAttemptReview } from '@/features/quizzes/actions/get-attempt-review';
import { QuestionRenderer } from '@/features/quizzes/components/question-renderer';
import { normalizeAttemptGrade } from '@/features/quizzes/services/grading-engine';
import type { QuestionData } from '@/features/questions/schemas/question.schema';
import type { QuestionResponse, GradeResult } from '@/features/questions/types/question.types';

const TYPE_LABELS: Record<string, string> = {
  multichoice: 'Opción múltiple',
  truefalse: 'Verdadero/Falso',
  shortanswer: 'Respuesta corta',
  numerical: 'Numérica',
  calculated: 'Calculada',
  essay: 'Ensayo',
  match: 'Emparejamiento',
  ordering: 'Ordenamiento',
  ddimageortext: 'Arrastrar texto',
  ddmarker: 'Arrastrar marcadores',
  ddwtos: 'Arrastrar palabras',
  gapselect: 'Selección en huecos',
  multianswer: 'Respuestas anidadas',
};

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string; quizId: string; attemptId: string }>;
}) {
  await requireAuth();
  const { id: courseId, quizId, attemptId } = await params;

  const attempt = await getAttemptReview(attemptId);
  if (!attempt || attempt.quiz.id !== quizId || attempt.quiz.course.id !== courseId) {
    notFound();
  }

  const grade = normalizeAttemptGrade(attempt.totalScore, attempt.maxScore);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={`/dashboard/courses/${courseId}/quiz/${quizId}`}
          className="text-xs text-blue-600 hover:underline"
        >
          ← Volver a la portada del quiz
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          Revisión del intento #{attempt.attemptNumber}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{attempt.quiz.title}</p>
      </div>

      {/* Resumen de la calificación */}
      <div className="grid grid-cols-3 gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">Estado</p>
          <p className="mt-1 text-sm font-medium text-slate-800">
            {attempt.state === 'finished' ? 'Finalizado' : attempt.state}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">Finalizado</p>
          <p className="mt-1 text-sm text-slate-800">
            {attempt.finishedAt ? new Date(attempt.finishedAt).toLocaleString() : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-slate-400">Nota</p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {grade !== null ? `${grade.toFixed(1)} / 100` : '—'}
          </p>
        </div>
      </div>

      {attempt.needsManualGrading && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-700">
          Este intento contiene preguntas que requieren calificación manual.
          La nota mostrada puede cambiar cuando el docente califique esas preguntas.
        </div>
      )}

      {/* Detalle pregunta por pregunta */}
      <div className="space-y-4">
        {attempt.answers.map((a, i) => {
          const data = (a.quizQuestion.questionVersion?.data ?? null) as QuestionData | null;
          const response = (a.response ?? null) as QuestionResponse | null;
          const gr = (a.gradeResult ?? null) as GradeResult | null;
          if (!data) return null;
          return (
            <div key={a.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500">
                  Pregunta {i + 1}
                </span>
                <span className="text-xs text-slate-500">
                  {TYPE_LABELS[data.type] ?? data.type} · {a.quizQuestion.score} pts
                </span>
              </div>
              <QuestionRenderer
                data={data}
                text={a.quizQuestion.questionVersion?.text ?? ''}
                datasetValues={
                  (attempt.datasetSnapshots as Record<string, Record<string, number>> | null)?.[
                    a.quizQuestionId
                  ]
                }
                response={response}
                readOnly
                gradeResult={gr}
                score={a.score}
                maxScore={a.quizQuestion.score}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
