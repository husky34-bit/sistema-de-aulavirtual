'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { QuestionData } from '@/features/questions/schemas/question.schema';
import type { QuestionResponse } from '@/features/questions/types/question.types';
import { QuestionRenderer } from './question-renderer';
import { QuizTimer } from './quiz-timer';
import { QuizNavigation } from './quiz-navigation';
import { saveAnswer } from '../actions/save-answer';
import { finishAttempt } from '../actions/finish-attempt';

interface AttemptQuestion {
  quizQuestionId: string;
  questionVersion: {
    id: string;
    type: string;
    text: string;
    data: unknown;
  } | null;
  score: number;
}

interface AttemptClientProps {
  attemptId: string;
  quizId: string;
  courseId: string;
  timeLimitMin: number | null;
  startedAt: string; // ISO
  questions: AttemptQuestion[];
  // respuestas precargadas desde el servidor (autosave previo)
  initialResponses: Record<string, QuestionResponse | null>;
  // snapshot de datasets calculados: { [quizQuestionId]: { var: value } }
  datasetSnapshots?: Record<string, Record<string, number>> | null;
}

const TYPE_LABELS: Record<string, string> = {
  multichoice: 'Opción múltiple',
  truefalse: 'Verdadero/Falso',
  shortanswer: 'Respuesta corta',
  numerical: 'Numérica',
  calculated: 'Calculada',
  essay: 'Ensayo',
  match: 'Emparejamiento',
  ordering: 'Ordenamiento',
  description: 'Descripción',
};

export function AttemptClient({
  attemptId,
  quizId,
  courseId,
  timeLimitMin,
  startedAt,
  questions,
  initialResponses,
  datasetSnapshots,
}: AttemptClientProps) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [responses, setResponses] = useState<Record<string, QuestionResponse | null>>(initialResponses);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);

  // Segundos restantes al montar (inicializador perezoso)
  const [initialSeconds] = useState<number | null>(() =>
    timeLimitMin !== null
      ? Math.max(
          0,
          Math.floor(
            (new Date(startedAt).getTime() + timeLimitMin * 60_000 - Date.now()) / 1000
          )
        )
      : null
  );

  // Autosave: cada vez que cambia una respuesta, la persiste en segundo plano.
  const autosave = useCallback(
    (quizQuestionId: string, response: QuestionResponse) => {
      // No bloquear la UI: fire-and-forget dentro de una transición
      startTransition(async () => {
        const res = await saveAnswer({ attemptId, quizQuestionId, response });
        if (!res.success && 'error' in res) {
          if (res.error === 'El tiempo del intento ha expirado') {
            setExpired(true);
            setError('El tiempo ha expirado. Finalizando el intento...');
          }
        }
      });
    },
    [attemptId]
  );

  const handleChange = (quizQuestionId: string, response: QuestionResponse) => {
    setResponses((prev) => ({ ...prev, [quizQuestionId]: response }));
    autosave(quizQuestionId, response);
  };

  const answeredSet = new Set(
    questions
      .filter((q) => {
        const r = responses[q.quizQuestionId];
        return r && !isEmptyResponse(r);
      })
      .map((q, i) => i)
  );

  const handleExpire = useCallback(() => {
    setExpired(true);
    setError('El tiempo ha expirado. Finalizando el intento...');
    startTransition(async () => {
      await finishAttempt({ attemptId });
      router.push(`/dashboard/courses/${courseId}/quiz/${quizId}/review/${attemptId}`);
    });
  }, [attemptId, courseId, quizId, router]);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSubmit = () => {
    setConfirmOpen(false);
    startTransition(async () => {
      const res = await finishAttempt({ attemptId });
      if (res.success) {
        router.push(`/dashboard/courses/${courseId}/quiz/${quizId}/review/${attemptId}`);
      } else {
        setError(res.error ?? 'Error al finalizar');
      }
    });
  };

  const q = questions[current];
  const data = (q.questionVersion?.data ?? null) as QuestionData | null;
  const unanswered = questions.length - answeredSet.size;

  return (
    <div className="space-y-4">
      {/* Barra superior: timer + navegación */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur">
        <QuizNavigation
          total={questions.length}
          current={current}
          answered={answeredSet}
          onSelect={setCurrent}
        />
        <div className="flex items-center gap-3">
          <QuizTimer initialSeconds={initialSeconds} onExpire={handleExpire} />
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={isPending || expired}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Finalizando...' : 'Finalizar intento'}
          </button>
        </div>
      </div>

      {/* Modal de confirmación */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">¿Finalizar el intento?</h3>
            <p className="mt-2 text-sm text-slate-600">
              {unanswered > 0
                ? `Tienes ${unanswered} pregunta(s) sin responder de ${questions.length}. Una vez finalizado, no podrás cambiar tus respuestas.`
                : '¿Estás seguro de enviar y calificar tus respuestas?'}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Continuar respondiendo
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isPending ? 'Calificando...' : 'Sí, finalizar intento'}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* Pregunta actual */}
      {data ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">
              Pregunta {current + 1} de {questions.length}
            </span>
            <span className="text-xs text-slate-500">
              {TYPE_LABELS[data.type] ?? data.type} · {q.score} pts
            </span>
          </div>
          <QuestionRenderer
            data={data}
            text={q.questionVersion?.text ?? ''}
            datasetValues={datasetSnapshots?.[q.quizQuestionId]}
            response={responses[q.quizQuestionId] ?? null}
            onChange={(r) => handleChange(q.quizQuestionId, r)}
          />
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          Esta pregunta no tiene versión disponible.
        </div>
      )}

      {/* Navegación inferior */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0 || isPending}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          ← Anterior
        </button>
        <span className="text-xs text-slate-400">
          {answeredSet.size}/{questions.length} respondidas
        </span>
        <button
          onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
          disabled={current === questions.length - 1 || isPending}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}

function isEmptyResponse(r: QuestionResponse): boolean {
  switch (r.kind) {
    case 'choice':
      return r.selected.length === 0;
    case 'boolean':
      return false;
    case 'text':
      return r.value.trim() === '';
    case 'number':
      return r.value === undefined || r.value === null || Number.isNaN(r.value);
    case 'essay':
      return r.value.trim() === '';
    case 'pairs':
      return Object.keys(r.assignments).length === 0;
    case 'order':
      return r.positions.length === 0;
    case 'zones':
      return Object.keys(r.placements).length === 0;
    case 'gaps':
      return Object.keys(r.answers).length === 0;
    default:
      return true;
  }
}
