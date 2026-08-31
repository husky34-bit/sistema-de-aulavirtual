'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { getGradebook } from '../actions/get-gradebook';
import { updateGrade } from '../actions/update-grade';
import { exportGrades } from '../actions/export-grades';

interface GraderReportProps {
  courseId: string;
}

interface GradebookData {
  students: { id: string; name: string | null; email: string }[];
  items: { id: string; name: string; maxScore: number; weight: number; categoryName?: string | null }[];
  categories: { id: string; name: string; parentId: string | null; aggregation: string; position: number }[];
  matrix: {
    student: { id: string; name: string | null; email: string };
    cells: { gradeItemId: string; score: number | null; overridden: boolean }[];
  }[];
}

export function GraderReport({ courseId }: GraderReportProps) {
  const [data, setData] = useState<GradebookData | null>(null);
  const [editing, setEditing] = useState<{ studentId: string; itemId: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [, startTransition] = useTransition();

  const load = useCallback(() => {
    startTransition(async () => {
      const res = await getGradebook(courseId);
      if (res.success) setData(res.data);
    });
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  function startEdit(studentId: string, itemId: string, current: number | null) {
    setEditing({ studentId, itemId });
    setEditValue(current !== null ? String(current) : '');
  }

  function commitEdit() {
    if (!editing) return;
    const num = editValue === '' ? null : Number(editValue);
    startTransition(async () => {
      await updateGrade({
        gradeItemId: editing.itemId,
        userId: editing.studentId,
        score: num,
      });
      setEditing(null);
      load();
    });
  }

  function handleExport() {
    startTransition(async () => {
      const res = await exportGrades(courseId);
      if (res.success) {
        // Descargar el CSV como blob
        const blob = new Blob([res.csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = res.filename;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  }

  if (!data) {
    return <p className="text-sm text-slate-500">Cargando gradebook…</p>;
  }

  if (data.items.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        No hay ítems de calificación. Crea tareas, quizzes o ítems manuales para ver la matriz.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Libro de Calificaciones</h2>
        <button
          onClick={handleExport}
          className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
        >
          ↓ Exportar CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-3 py-2.5 text-left font-medium text-slate-700">Estudiante</th>
              {data.items.map((it) => (
                <th key={it.id} className="px-3 py-2.5 text-center font-medium text-slate-700">
                  <div>{it.name}</div>
                  <div className="text-xs font-normal text-slate-400">/{it.maxScore}</div>
                  {it.categoryName && (
                    <div className="text-xs font-normal text-slate-400">{it.categoryName}</div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.matrix.map((row) => (
              <tr key={row.student.id} className="border-b border-slate-100">
                <td className="px-3 py-2 text-slate-900">
                  <div className="font-medium">{row.student.name}</div>
                  <div className="text-xs text-slate-400">{row.student.email}</div>
                </td>
                {row.cells.map((cell) => {
                  const isEditing =
                    editing?.studentId === row.student.id && editing?.itemId === cell.gradeItemId;
                  return (
                    <td
                      key={cell.gradeItemId}
                      className="px-3 py-2 text-center"
                      onClick={() =>
                        !isEditing && startEdit(row.student.id, cell.gradeItemId, cell.score)
                      }
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isEditing)
                          startEdit(row.student.id, cell.gradeItemId, cell.score);
                      }}
                    >
                      {isEditing ? (
                        <input
                          type="number"
                          value={editValue}
                          autoFocus
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={commitEdit}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') commitEdit();
                            if (e.key === 'Escape') setEditing(null);
                          }}
                          className="w-20 rounded border border-blue-500 p-1 text-center text-sm"
                        />
                      ) : (
                        <span
                          className={`inline-block cursor-pointer rounded px-2 py-0.5 ${
                            cell.overridden
                              ? 'bg-amber-100 text-amber-800'
                              : cell.score === null
                                ? 'text-slate-300'
                                : 'text-slate-900'
                          }`}
                          title={cell.overridden ? 'Modificada manualmente' : 'Click para editar'}
                        >
                          {cell.score === null ? '—' : cell.score}
                          {cell.overridden && ' ✎'}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400">
        Las celdas en amarillo (✎) han sido modificadas manualmente y no se sobrescriben al
        recalcular desde quizzes/tareas.
      </p>
    </div>
  );
}
