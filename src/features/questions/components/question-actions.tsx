'use client';

import { useTransition, useState } from 'react';
import { duplicateQuestion } from '../actions/duplicate-question';
import { deleteQuestion } from '../actions/delete-question';
import { updateQuestion } from '../actions/update-question';

interface QuestionActionsProps {
  questionId: string;
  questionName: string;
  questionText: string;
  defaultScore: number;
  questionData: unknown;
}

export function QuestionActions({
  questionId,
  questionName,
  questionText,
  defaultScore,
  questionData,
}: QuestionActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(questionName);
  const [text, setText] = useState(questionText);
  const [score, setScore] = useState(defaultScore);
  const [error, setError] = useState<string | null>(null);

  const handleDuplicate = () => {
    startTransition(async () => {
      const res = await duplicateQuestion(questionId);
      if (!res.success) {
        alert(res.error || 'Error al duplicar la pregunta');
      }
    });
  };

  const handleDelete = () => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta pregunta?')) return;
    startTransition(async () => {
      const res = await deleteQuestion(questionId);
      if (!res.success) {
        alert(res.error || 'Error al eliminar la pregunta');
      }
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await updateQuestion(questionId, {
        name,
        text,
        defaultScore: score,
        categoryId: 'placeholder', // ignored or validated
        data: questionData,
      });
      if (res.success) {
        setIsEditing(false);
      } else {
        setError(JSON.stringify(res.errors || res.error));
      }
    });
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsEditing(true)}
          disabled={isPending}
          className="rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
        >
          Editar
        </button>
        <button
          onClick={handleDuplicate}
          disabled={isPending}
          className="rounded px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
        >
          Duplicar
        </button>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
        >
          Eliminar
        </button>
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Editar Pregunta (Crea una nueva versión)
            </h3>
            {error && (
              <div className="mb-3 rounded bg-red-50 p-2 text-xs text-red-600">
                {error}
              </div>
            )}
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700">Nombre interno</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 w-full rounded border border-slate-300 p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">Puntaje</label>
                <input
                  type="number"
                  step="0.5"
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  required
                  className="mt-1 w-full rounded border border-slate-300 p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700">Enunciado</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  required
                  rows={3}
                  className="mt-1 w-full rounded border border-slate-300 p-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isPending ? 'Guardando...' : 'Guardar (v+1)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
