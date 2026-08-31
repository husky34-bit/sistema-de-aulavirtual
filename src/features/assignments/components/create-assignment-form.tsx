'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createAssignment } from '../actions/create-assignment';
import { assignmentSchema } from '../schemas/assignment.schema';

interface CreateAssignmentFormProps {
  courseId: string;
  sections?: { id: string; title: string }[];
}

export function CreateAssignmentForm({ courseId, sections = [] }: CreateAssignmentFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    description: '',
    instructions: '',
    maxScore: 100,
    openAt: '',
    dueAt: '',
    cutoffAt: '',
    allowOnlineText: true,
    allowFiles: false,
    maxFiles: 1,
    maxFileSizeMb: 10,
    published: false,
    sectionId: '',
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setError(null);

    const payload = {
      ...form,
      maxScore: Number(form.maxScore),
      maxFiles: Number(form.maxFiles),
      maxFileSizeMb: Number(form.maxFileSizeMb),
      openAt: form.openAt ? new Date(form.openAt).toISOString() : undefined,
      dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : undefined,
      cutoffAt: form.cutoffAt ? new Date(form.cutoffAt).toISOString() : undefined,
      sectionId: form.sectionId || undefined,
    };

    // Validar con Zod en el cliente antes de enviar
    const result = assignmentSchema.safeParse(payload);
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }

    startTransition(async () => {
      const res = await createAssignment(courseId, payload);
      if (!res.success) {
        if ('errors' in res && res.errors) setErrors(res.errors);
        if ('error' in res && res.error) setError(res.error);
        return;
      }
      router.push(`/dashboard/courses/${courseId}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Título</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title[0]}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Descripción</label>
        <textarea
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Instrucciones</label>
        <textarea
          value={form.instructions}
          onChange={(e) => update('instructions', e.target.value)}
          rows={5}
          className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Apertura</label>
          <input
            type="datetime-local"
            value={form.openAt}
            onChange={(e) => update('openAt', e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Fecha límite</label>
          <input
            type="datetime-local"
            value={form.dueAt}
            onChange={(e) => update('dueAt', e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
          />
          {errors.dueAt && <p className="mt-1 text-xs text-red-600">{errors.dueAt[0]}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Corte</label>
          <input
            type="datetime-local"
            value={form.cutoffAt}
            onChange={(e) => update('cutoffAt', e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
          />
          {errors.cutoffAt && <p className="mt-1 text-xs text-red-600">{errors.cutoffAt[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Puntaje máximo</label>
          <input
            type="number"
            min={1}
            max={1000}
            value={form.maxScore}
            onChange={(e) => update('maxScore', Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Sección</label>
          <select
            value={form.sectionId}
            onChange={(e) => update('sectionId', e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
          >
            <option value="">Sin sección</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2 rounded-lg bg-slate-50 p-4">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.allowOnlineText}
            onChange={(e) => update('allowOnlineText', e.target.checked)}
          />
          Permitir texto en línea
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.allowFiles}
            onChange={(e) => update('allowFiles', e.target.checked)}
          />
          Permitir archivos
        </label>
        {form.allowFiles && (
          <div className="grid grid-cols-2 gap-3 pl-6">
            <div>
              <label className="mb-1 block text-xs text-slate-600">Máx. archivos</label>
              <input
                type="number"
                min={1}
                max={20}
                value={form.maxFiles}
                onChange={(e) => update('maxFiles', Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-600">Máx. tamaño (MB)</label>
              <input
                type="number"
                min={1}
                max={100}
                value={form.maxFileSizeMb}
                onChange={(e) => update('maxFileSizeMb', Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm"
              />
            </div>
          </div>
        )}
        {errors.allowFiles && <p className="text-xs text-red-600">{errors.allowFiles[0]}</p>}
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => update('published', e.target.checked)}
        />
        Publicar tarea (visible para estudiantes)
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition"
      >
        Crear tarea
      </button>
    </form>
  );
}
