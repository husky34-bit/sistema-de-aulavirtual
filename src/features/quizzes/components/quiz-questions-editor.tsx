'use client';

import { useState, useTransition } from 'react';
import {
  addQuestionToQuiz,
  removeQuestionFromQuiz,
  reorderQuizQuestions,
  updateQuestionScore,
} from '../actions/edit-quiz-questions';
import { updateQuiz } from '../actions/update-quiz';
import { getQuizById } from '../actions/get-quiz-by-id';

interface QuizQuestionRow {
  id: string;
  position: number;
  score: number;
  question: { id: string; name: string };
  questionVersion: {
    id: string;
    type: string;
    text: string;
  } | null;
}

interface AvailableQuestion {
  id: string;
  name: string;
  currentVersion: { type: string; text: string } | null;
}

interface QuizQuestionsEditorProps {
  quizId: string;
  courseId: string;
  quiz: {
    title: string;
    description: string | null;
    timeLimitMin: number | null;
    maxAttempts: number;
    gradeMethod: string;
    password: string | null;
    published: boolean;
  };
  questions: QuizQuestionRow[];
  available: AvailableQuestion[];
}

const TYPE_LABELS: Record<string, string> = {
  multichoice: 'Opción múltiple',
  truefalse: 'V/F',
  shortanswer: 'Resp. corta',
  numerical: 'Numérica',
  calculated: 'Calculada',
  essay: 'Ensayo',
  match: 'Emparejamiento',
  ordering: 'Ordenamiento',
};

export function QuizQuestionsEditor({
  quizId,
  quiz,
  questions,
  available,
}: QuizQuestionsEditorProps) {
  const [isPending, startTransition] = useTransition();
  const [rows, setRows] = useState(sortRows(questions));
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function sortRows(qs: QuizQuestionRow[]) {
    return [...qs].sort((a, b) => a.position - b.position);
  }

  const filteredAvailable = available.filter((q) =>
    q.name.toLowerCase().includes(search.toLowerCase())
  );
  const addedIds = new Set(rows.map((r) => r.question.id));
  const notAdded = filteredAvailable.filter((q) => !addedIds.has(q.id));

  const handleAdd = (questionId: string) => {
    startTransition(async () => {
      const res = await addQuestionToQuiz(quizId, questionId);
      if (!res.success) setError(res.error ?? 'Error');
      else setRows(await refreshRows(quizId));
    });
  };

  const handleRemove = (quizQuestionId: string) => {
    startTransition(async () => {
      const res = await removeQuestionFromQuiz(quizId, quizQuestionId);
      if (!res.success) setError(res.error ?? 'Error');
      else setRows(await refreshRows(quizId));
    });
  };

  const move = (index: number, dir: -1 | 1) => {
    const to = index + dir;
    if (to < 0 || to >= rows.length) return;
    const next = [...rows];
    [next[index], next[to]] = [next[to], next[index]];
    setRows(next);
  };

  const handleSaveOrder = () => {
    startTransition(async () => {
      const res = await reorderQuizQuestions(quizId, rows.map((r) => r.id));
      if (!res.success) setError(res.error ?? 'Error');
    });
  };

  const handleScoreChange = (id: string, score: number) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, score } : r)));
  };

  const handleSaveScore = (id: string, score: number) => {
    startTransition(async () => {
      const res = await updateQuestionScore(quizId, id, score);
      if (!res.success) setError(res.error ?? 'Error');
    });
  };

  const handlePublish = () => {
    startTransition(async () => {
      const res = await updateQuiz(quizId, {
        title: quiz.title,
        description: quiz.description ?? undefined,
        timeLimitMin: quiz.timeLimitMin,
        maxAttempts: quiz.maxAttempts,
        gradeMethod: quiz.gradeMethod,
        password: quiz.password ?? undefined,
        published: !quiz.published,
      });
      if (res.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      } else {
        setError(JSON.stringify(res.errors ?? res.error));
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">
          Preguntas del cuestionario ({rows.length})
        </h2>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs text-emerald-600">✓ Guardado</span>}
          <button
            onClick={handleSaveOrder}
            disabled={isPending || rows.length < 2}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Guardar orden
          </button>
          <button
            onClick={handlePublish}
            disabled={isPending || rows.length === 0}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50 ${
              quiz.published ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {quiz.published ? 'Despublicar' : 'Publicar'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Aún no hay preguntas. Añade preguntas del banco disponible.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <th className="p-3 w-16">Orden</th>
                <th className="p-3">Pregunta</th>
                <th className="p-3 w-28">Puntaje</th>
                <th className="p-3 w-24 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {rows.map((row, i) => (
                <tr key={row.id}>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold text-slate-600">{i + 1}</span>
                      <div className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => move(i, -1)}
                          disabled={i === 0}
                          className="text-xs text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => move(i, 1)}
                          disabled={i === rows.length - 1}
                          className="text-xs text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="mr-2 inline-flex rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">
                      {TYPE_LABELS[row.questionVersion?.type ?? ''] ?? row.questionVersion?.type}
                    </span>
                    <span className="font-medium text-slate-900">{row.question.name}</span>
                    <p className="mt-0.5 text-xs text-slate-500 truncate max-w-md">
                      {row.questionVersion?.text}
                    </p>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={row.score}
                        onChange={(e) => handleScoreChange(row.id, Number(e.target.value))}
                        className="w-16 rounded border border-slate-300 p-1.5 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveScore(row.id, row.score)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        ✓
                      </button>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleRemove(row.id)}
                      disabled={isPending}
                      className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Retirar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">
          Banco de preguntas disponible
        </h3>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre..."
          className="w-full max-w-xs rounded-lg border border-slate-300 p-2 text-sm"
        />
        {notAdded.length === 0 ? (
          <p className="text-xs text-slate-500">
            {available.length === 0
              ? 'No hay preguntas en el banco de este curso.'
              : 'Todas las preguntas del banco ya están en el cuestionario.'}
          </p>
        ) : (
          <div className="space-y-1.5">
            {notAdded.map((q) => (
              <div
                key={q.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5 text-sm"
              >
                <div>
                  <span className="mr-2 inline-flex rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">
                    {TYPE_LABELS[q.currentVersion?.type ?? ''] ?? q.currentVersion?.type}
                  </span>
                  <span className="font-medium text-slate-900">{q.name}</span>
                  <p className="mt-0.5 text-xs text-slate-500 truncate max-w-md">
                    {q.currentVersion?.text}
                  </p>
                </div>
                <button
                  onClick={() => handleAdd(q.id)}
                  disabled={isPending}
                  className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  + Añadir
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

async function refreshRows(quizId: string): Promise<QuizQuestionRow[]> {
  const quiz = await getQuizById(quizId);
  if (!quiz) return [];
  return quiz.questions
    .map((q) => ({
      id: q.id,
      position: q.position,
      score: q.score,
      question: { id: q.question.id, name: q.question.name },
      questionVersion: q.questionVersion
        ? { id: q.questionVersion.id, type: q.questionVersion.type, text: q.questionVersion.text }
        : null,
    }))
    .sort((a, b) => a.position - b.position);
}
