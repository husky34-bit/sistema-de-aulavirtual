'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { getGradebook } from '../actions/get-gradebook';
import { createGradeCategory } from '../actions/create-grade-category';
import { updateAggregation } from '../actions/create-grade-category';
import { createGradeItem } from '../actions/create-grade-item';
import type { AggregationType } from '../schemas/grade.schema';

interface GradeCategoriesEditorProps {
  courseId: string;
}

interface CategoryData {
  id: string;
  name: string;
  parentId: string | null;
  aggregation: string;
  position: number;
}

const AGGREGATIONS = [
  { value: 'mean', label: 'Promedio' },
  { value: 'weighted', label: 'Ponderado' },
  { value: 'median', label: 'Mediana' },
  { value: 'sum', label: 'Suma' },
  { value: 'max', label: 'Máximo' },
  { value: 'min', label: 'Mínimo' },
  { value: 'mode', label: 'Moda' },
];

export function GradeCategoriesEditor({ courseId }: GradeCategoriesEditorProps) {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [newItem, setNewItem] = useState({ name: '', maxScore: 100, weight: 1 });
  const [, startTransition] = useTransition();

  const load = useCallback(() => {
    startTransition(async () => {
      const res = await getGradebook(courseId);
      if (res.success) setCategories(res.data.categories);
    });
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  function handleAddCategory() {
    if (!newCategory.trim()) return;
    startTransition(async () => {
      await createGradeCategory({
        courseId,
        name: newCategory,
        parentId: null,
        aggregation: 'mean',
        position: categories.length,
      });
      setNewCategory('');
      load();
    });
  }

  function handleChangeAggregation(categoryId: string, aggregation: string) {
    startTransition(async () => {
      await updateAggregation({ categoryId, aggregation: aggregation as AggregationType });
      load();
    });
  }

  function handleAddItem() {
    if (!newItem.name.trim()) return;
    startTransition(async () => {
      await createGradeItem({
        courseId,
        name: newItem.name,
        maxScore: Number(newItem.maxScore),
        weight: Number(newItem.weight),
        categoryId: null,
        position: 0,
      });
      setNewItem({ name: '', maxScore: 100, weight: 1 });
      load();
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-slate-900">Categorías de calificación</h3>
        <p className="mt-1 text-sm text-slate-500">
          Organiza los ítems en categorías con métodos de agregación.
        </p>

        {categories.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No hay categorías. Crea una para empezar.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {categories.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
              >
                <span className="font-medium text-slate-900">{c.name}</span>
                <select
                  value={c.aggregation}
                  onChange={(e) => handleChangeAggregation(c.id, e.target.value)}
                  className="rounded-lg border border-slate-300 p-1.5 text-sm"
                >
                  {AGGREGATIONS.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Nombre de la categoría"
            className="flex-1 rounded-lg border border-slate-300 p-2 text-sm"
          />
          <button
            onClick={handleAddCategory}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Categoría
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-slate-900">Ítem manual</h3>
        <p className="mt-1 text-sm text-slate-500">
          Añade ítems de calificación no vinculados a quizzes o tareas.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <input
            type="text"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            placeholder="Nombre (ej. Participación)"
            className="rounded-lg border border-slate-300 p-2 text-sm"
          />
          <input
            type="number"
            value={newItem.maxScore}
            onChange={(e) => setNewItem({ ...newItem, maxScore: Number(e.target.value) })}
            placeholder="Máx"
            className="rounded-lg border border-slate-300 p-2 text-sm"
          />
          <input
            type="number"
            value={newItem.weight}
            onChange={(e) => setNewItem({ ...newItem, weight: Number(e.target.value) })}
            placeholder="Peso"
            className="rounded-lg border border-slate-300 p-2 text-sm"
          />
        </div>
        <button
          onClick={handleAddItem}
          className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Ítem manual
        </button>
      </div>
    </div>
  );
}
