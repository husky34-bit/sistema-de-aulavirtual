'use client';

import { useState, useTransition } from 'react';
import { createQuestionCategory } from '../actions/create-question-category';

interface CategoryManagerProps {
  courseId: string;
}

export function CategoryManager({ courseId }: CategoryManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await createQuestionCategory(courseId, name);
      if (res.success) {
        setName('');
        setIsOpen(false);
      } else {
        setError(res.error || 'Error al crear la categoría');
      }
    });
  };

  return (
    <div>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          + Nueva Categoría
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Nombre de categoría"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
            className="rounded border border-slate-300 px-2 py-1 text-xs"
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? '...' : 'Crear'}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
          >
            Cancelar
          </button>
          {error && <span className="text-xs text-red-500">{error}</span>}
        </form>
      )}
    </div>
  );
}
