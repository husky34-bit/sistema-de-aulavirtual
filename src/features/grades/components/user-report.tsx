'use client';

import { useState, useEffect } from 'react';
import { getUserGrades } from '../actions/get-user-grades';
import { BarChartIcon } from '@/components/Icons';

interface CourseGrade {
  courseId: string;
  courseTitle: string;
  instructorName: string | null;
  total: number | null;
  items: {
    id: string;
    name: string;
    maxScore: number;
    score: number | null;
    fraction: number | null;
    overridden: boolean;
    categoryName?: string | null;
  }[];
}

export function UserReport() {
  const [courses, setCourses] = useState<CourseGrade[]>([]);

  useEffect(() => {
    let active = true;
    getUserGrades().then((res) => {
      if (active && res.success) setCourses(res.data);
    });
    return () => {
      active = false;
    };
  }, []);

  if (courses.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#026BCA]">
          <BarChartIcon size={24} />
        </div>
        <p className="mt-3 font-semibold text-slate-700">No tienes calificaciones registradas todavía</p>
        <p className="mt-1 text-xs text-slate-400">Tus notas aparecerán aquí tan pronto como completes actividades evaluadas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {courses.map((c) => (
        <div key={c.courseId} className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{c.courseTitle}</h3>
              <p className="text-xs text-slate-500">Instructor: {c.instructorName}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Total del curso</p>
              <p className={`text-2xl font-bold ${totalColor(c.total)}`}>
                {c.total === null ? '—' : `${c.total.toFixed(1)}/100`}
              </p>
            </div>
          </div>

          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                <th className="py-2">Ítem</th>
                <th className="py-2 text-center">Nota</th>
                <th className="py-2 text-center">Máx</th>
                <th className="py-2 text-center">%</th>
              </tr>
            </thead>
            <tbody>
              {c.items.map((it) => (
                <tr key={it.id} className="border-b border-slate-100">
                  <td className="py-2 text-slate-900">
                    {it.name}
                    {it.overridden && (
                      <span className="ml-1 text-xs text-amber-600" title="Ajustada manualmente">
                        ✎
                      </span>
                    )}
                    {it.categoryName && (
                      <span className="ml-2 text-xs text-slate-400">{it.categoryName}</span>
                    )}
                  </td>
                  <td className="py-2 text-center text-slate-700">
                    {it.score === null ? '—' : it.score}
                  </td>
                  <td className="py-2 text-center text-slate-400">{it.maxScore}</td>
                  <td className={`py-2 text-center font-medium ${fractionColor(it.fraction)}`}>
                    {it.fraction === null ? '—' : `${(it.fraction * 100).toFixed(1)}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

function totalColor(total: number | null): string {
  if (total === null) return 'text-slate-400 dark:text-slate-500';
  if (total >= 70) return 'text-emerald-600 dark:text-emerald-400';
  if (total >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function fractionColor(fraction: number | null): string {
  if (fraction === null) return 'text-slate-400 dark:text-slate-500';
  if (fraction >= 0.7) return 'text-emerald-600 dark:text-emerald-400';
  if (fraction >= 0.5) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}
