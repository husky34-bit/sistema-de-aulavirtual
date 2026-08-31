'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createQuiz } from '../actions/create-quiz';

interface CreateQuizModalProps {
  courseId: string;
  open: boolean;
  onClose: () => void;
}

const METHODS = [
  { value: 'highest', label: 'Mejor intento (highest)' },
  { value: 'average', label: 'Promedio (average)' },
  { value: 'first', label: 'Primer intento (first)' },
  { value: 'last', label: 'Último intento (last)' },
] as const;

export function CreateQuizModal({ courseId, open, onClose }: CreateQuizModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);

    const input = {
      title: form.get('title'),
      description: form.get('description') || undefined,
      timeLimitMin: form.get('timeLimitMin') ? Number(form.get('timeLimitMin')) : null,
      maxAttempts: Number(form.get('maxAttempts') || 1),
      gradeMethod: form.get('gradeMethod'),
      password: form.get('password') || undefined,
      published: form.get('published') === 'on',
      openAt: form.get('openAt') ? new Date(form.get('openAt') as string).toISOString() : undefined,
      closeAt: form.get('closeAt') ? new Date(form.get('closeAt') as string).toISOString() : undefined,
    };

    startTransition(async () => {
      const res = await createQuiz(courseId, input);
      if (res.success) {
        onClose();
        router.push(`/dashboard/courses/${courseId}/quiz/${res.quizId}/edit`);
        router.refresh();
      } else {
        setError(JSON.stringify(res.errors ?? res.error));
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold text-slate-900 mb-1">Nuevo cuestionario</h3>
        <p className="text-xs text-slate-500 mb-4">
          Configura el cuestionario. Podrás añadir preguntas después.
        </p>

        {error && (
          <div className="mb-3 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Título</label>
            <input
              name="title"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm"
              placeholder="Examen parcial 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Descripción</label>
            <textarea
              name="description"
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm"
              placeholder="Instrucciones para el estudiante..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Límite de tiempo (min)
              </label>
              <input
                name="timeLimitMin"
                type="number"
                min={1}
                placeholder="Sin límite"
                className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Intentos máximos (0 = ilimitado)
              </label>
              <input
                name="maxAttempts"
                type="number"
                min={0}
                defaultValue={1}
                className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Método de calificación</label>
            <select
              name="gradeMethod"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm"
            >
              {METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Apertura</label>
              <input
                name="openAt"
                type="datetime-local"
                className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Cierre</label>
              <input
                name="closeAt"
                type="datetime-local"
                className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Contraseña (opcional)
            </label>
            <input
              name="password"
              type="text"
              className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm"
              placeholder="Dejar vacío para acceso libre"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="published" className="h-4 w-4" />
            Publicar inmediatamente (visible para estudiantes)
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? 'Creando...' : 'Crear cuestionario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
